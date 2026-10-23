import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";
import { DEMO_SESSION_COOKIE, isDemoMode, verifyDemoSession } from "@/lib/session";
import { getData } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { portalHome, safeNextPath } from "@/lib/auth/paths";

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    const session = await verifyDemoSession(cookieStore.get(DEMO_SESSION_COOKIE)?.value);
    if (!session) return null;
    return getData().getProfileById(session.uid);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return getData().getProfileById(user.id);
  } catch {
    return null;
  }
});

export async function requireProfile(nextPath?: string): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/auth${next}`);
  }
  return profile;
}

export async function requireRole(role: "customer"): Promise<Profile>;
export async function requireRole(role: "admin"): Promise<Profile>;
export async function requireRole(role: "worker"): Promise<Profile>;
export async function requireRole(role: Profile["role"]): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== role) redirect(portalHome(profile));
  if (role === "admin" && profile.status !== "ACTIVE") redirect("/auth?error=admin_inactive");
  return profile;
}

/** Workers keep access to the dashboard while pending so the guard can render. */
export async function requireWorker(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "worker") redirect(portalHome(profile));
  return profile;
}

export async function requireCustomer(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "customer") redirect(portalHome(profile));
  if (profile.status !== "ACTIVE") redirect("/auth?error=account_inactive");
  return profile;
}

export async function requireActiveWorker(): Promise<Profile> {
  const profile = await requireWorker();
  if (profile.status !== "ACTIVE") {
    throw new Error("Your worker account is not active yet.");
  }
  return profile;
}

export function resolvePostLoginPath(
  profile: Profile,
  requested: string | null | undefined,
): string {
  const next = safeNextPath(requested);
  if (profile.role === "admin") return next?.startsWith("/admin") ? next : "/admin/dashboard";
  if (profile.role === "worker") {
    return next?.startsWith("/worker") ? next : "/worker/dashboard";
  }
  if (next && !next.startsWith("/worker") && !next.startsWith("/admin")) return next;
  return "/";
}
