import type { Profile, Role } from "@/lib/types";

export function portalHome(profile: Pick<Profile, "role"> | Role): string {
  const role = typeof profile === "string" ? profile : profile.role;
  if (role === "admin") return "/admin/dashboard";
  if (role === "worker") return "/worker/dashboard";
  return "/";
}

export const PROTECTED_PREFIXES = ["/account", "/bookings", "/worker", "/admin"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/auth")) return null;
  return value;
}
