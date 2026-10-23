"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  OtpRequestResult,
  OtpVerifyResult,
  SignupResult,
  SimpleResult,
  UploadResult,
} from "@/lib/auth/types";
import {
  adminLoginSchema,
  customerSignupSchema,
  firstError,
  otpSchema,
  phoneSchema,
  workerSignupSchema,
} from "@/lib/validation";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, DEMO_OTP } from "@/lib/constants";
import { isDemoMode, DEMO_SESSION_COOKIE, signDemoSession } from "@/lib/session";
import { getData } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WORKER_DOCS_BUCKET } from "@/lib/supabase/config";
import { normalizePhone } from "@/lib/validation";
import { resolvePostLoginPath } from "@/lib/auth/session";
import { portalHome } from "@/lib/auth/paths";
import { rateLimit } from "@/lib/rate-limit";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

async function requestIp(): Promise<string> {
  try {
    const headerList = await headers();
    return (
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      "local"
    );
  } catch {
    return "local";
  }
}

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (lower.includes("provider") || lower.includes("sms") || lower.includes("twilio")) {
    return "SMS OTP is not enabled on this Supabase project. Enable a phone provider in Supabase → Authentication → Providers, or use demo mode.";
  }
  if (lower.includes("invalid") && lower.includes("token")) {
    return "That OTP is incorrect or has expired. Request a new one.";
  }
  if (lower.includes("expired")) {
    return "That OTP has expired. Please request a new one.";
  }
  return message;
}

export async function requestOtpAction(input: { phone: string }): Promise<OtpRequestResult> {
  const parsed = phoneSchema.safeParse(input.phone);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error) };
  }
  const phone = parsed.data;

  const ip = await requestIp();
  const limit = rateLimit(`otp:${ip}:${phone}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return {
      ok: false,
      error: `Too many OTP requests. Try again in ${limit.retryAfterSec} seconds.`,
    };
  }

  if (isDemoMode()) {
    return {
      ok: true,
      demoOtp: DEMO_OTP,
      message: `Demo OTP sent to +91 ${phone}. Use ${DEMO_OTP}.`,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizePhone(phone),
      options: { shouldCreateUser: true },
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true, message: `We sent a 6-digit OTP to +91 ${phone}.` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? friendlyAuthError(error.message) : "Could not send the OTP.",
    };
  }
}

export async function verifyOtpAction(input: {
  phone: string;
  token: string;
  next?: string;
}): Promise<OtpVerifyResult> {
  const phoneParsed = phoneSchema.safeParse(input.phone);
  const otpParsed = otpSchema.safeParse(input.token);
  if (!phoneParsed.success) return { ok: false, error: firstError(phoneParsed.error) };
  if (!otpParsed.success) return { ok: false, error: firstError(otpParsed.error) };

  const phone = phoneParsed.data;
  const token = otpParsed.data;
  const limit = isDemoMode() ? null : rateLimit(`verify:${phone}`, 8, 10 * 60_000);
  if (limit && !limit.ok) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes." };
  }

  if (isDemoMode()) {
    if (token !== DEMO_OTP) {
      return { ok: false, error: "That OTP is incorrect. In demo mode the OTP is 123456." };
    }
    const profile = await getData().getProfileByPhone(phone);
    if (!profile) {
      return {
        ok: true,
        needsOnboarding: true,
        message: "Number verified. Tell us who you are.",
      };
    }
    if (profile.status === "SUSPENDED") {
      return { ok: false, error: "This account is suspended. Call 8307121221 for help." };
    }
    const cookieStore = await cookies();
    cookieStore.set(DEMO_SESSION_COOKIE, await signDemoSession(profile.id), COOKIE_OPTIONS);
    revalidatePath("/", "layout");
    return {
      ok: true,
      needsOnboarding: false,
      redirectTo: resolvePostLoginPath(profile, input.next),
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizePhone(phone),
      token,
      type: "sms",
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    if (!data.user) return { ok: false, error: "Verification failed. Please try again." };

    const profile = await getData().getProfileById(data.user.id);
    if (!profile) {
      return {
        ok: true,
        needsOnboarding: true,
        message: "Number verified. Tell us who you are.",
      };
    }
    if (profile.status === "SUSPENDED") {
      await supabase.auth.signOut();
      return { ok: false, error: "This account is suspended. Call 8307121221 for help." };
    }
    revalidatePath("/", "layout");
    return {
      ok: true,
      needsOnboarding: false,
      redirectTo: resolvePostLoginPath(profile, input.next),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? friendlyAuthError(error.message) : "Verification failed.",
    };
  }
}

export async function completeCustomerSignupAction(input: {
  fullName: string;
  phone: string;
  email?: string;
  termsAccepted: boolean;
}): Promise<SignupResult> {
  const parsed = customerSignupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  try {
    if (isDemoMode()) {
      const profile = await getData().createCustomerProfile("demo", parsed.data);
      const cookieStore = await cookies();
      cookieStore.set(DEMO_SESSION_COOKIE, await signDemoSession(profile.id), COOKIE_OPTIONS);
      revalidatePath("/", "layout");
      return { ok: true, redirectTo: "/" };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Your verification expired. Please request a new OTP." };
    }
    const profile = await getData().createCustomerProfile(user.id, parsed.data);
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: portalHome(profile) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not create your account.",
    };
  }
}

export async function completeWorkerSignupAction(input: {
  fullName: string;
  phone: string;
  serviceCategory: string;
  termsAccepted: boolean;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
}): Promise<SignupResult> {
  const parsed = workerSignupSchema.safeParse({
    fullName: input.fullName,
    phone: input.phone,
    serviceCategory: input.serviceCategory,
    termsAccepted: input.termsAccepted,
  });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  if (!input.aadhaarFrontUrl || !input.aadhaarBackUrl) {
    return { ok: false, error: "Please upload both sides of your Aadhaar." };
  }
  if (
    !input.aadhaarFrontUrl.startsWith("data:image/") &&
    !input.aadhaarFrontUrl.startsWith("http")
  ) {
    return { ok: false, error: "The Aadhaar upload did not complete. Please try again." };
  }

  try {
    if (isDemoMode()) {
      const profile = await getData().createWorkerProfile("demo", {
        ...parsed.data,
        aadhaarFrontUrl: input.aadhaarFrontUrl,
        aadhaarBackUrl: input.aadhaarBackUrl,
      });
      const cookieStore = await cookies();
      cookieStore.set(DEMO_SESSION_COOKIE, await signDemoSession(profile.id), COOKIE_OPTIONS);
      revalidatePath("/", "layout");
      return { ok: true, redirectTo: "/worker/dashboard" };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Your verification expired. Please request a new OTP." };
    }
    if (
      !input.aadhaarFrontUrl.startsWith(`${user.id}/`) ||
      !input.aadhaarBackUrl.startsWith(`${user.id}/`)
    ) {
      return { ok: false, error: "The document upload is invalid. Please upload again." };
    }
    const profile = await getData().createWorkerProfile(user.id, {
      ...parsed.data,
      aadhaarFrontUrl: input.aadhaarFrontUrl,
      aadhaarBackUrl: input.aadhaarBackUrl,
    });
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: portalHome(profile) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not create your account.",
    };
  }
}

export async function uploadWorkerDocAction(input: {
  dataUrl: string;
  side: "front" | "back";
}): Promise<UploadResult> {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(
    input.dataUrl,
  );
  if (!match) return { ok: false, error: "Upload a JPG, PNG or WebP image." };

  const mime = match[1]!;
  const base64 = match[2]!.replace(/\s/g, "");
  const size = Math.floor((base64.length * 3) / 4);
  if (size > 2_500_000) {
    return { ok: false, error: "Each image must be under 2.5 MB." };
  }
  if (size < 1024) {
    return { ok: false, error: "That image looks empty. Please upload again." };
  }

  if (isDemoMode()) {
    return { ok: true, path: input.dataUrl, demo: true };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Verify your mobile number again before uploading." };

    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/${input.side}-${Date.now()}.${ext}`;
    const bytes = Buffer.from(base64, "base64");

    const { error } = await supabase.storage
      .from(WORKER_DOCS_BUCKET)
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (error) return { ok: false, error: `Upload failed: ${error.message}` };
    return { ok: true, path, demo: false };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed. Please try again.",
    };
  }
}

export async function adminLoginAction(input: {
  email: string;
  password: string;
}): Promise<SignupResult> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const limit = rateLimit(`admin:${parsed.data.email}`, 8, 10 * 60_000);
  if (!limit.ok) return { ok: false, error: "Too many attempts. Try again in a few minutes." };

  if (isDemoMode()) {
    if (
      parsed.data.email.toLowerCase() !== DEMO_ADMIN_EMAIL ||
      parsed.data.password !== DEMO_ADMIN_PASSWORD
    ) {
      return { ok: false, error: "Incorrect admin email or password." };
    }
    const profile = await getData().getProfileByEmail(DEMO_ADMIN_EMAIL);
    if (!profile) return { ok: false, error: "Admin account is not seeded." };
    const cookieStore = await cookies();
    cookieStore.set(DEMO_SESSION_COOKIE, await signDemoSession(profile.id), COOKIE_OPTIONS);
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/admin/dashboard" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    if (!data.user) return { ok: false, error: "Could not sign in." };

    const profile = await getData().getProfileById(data.user.id);
    if (!profile || profile.role !== "admin" || profile.status !== "ACTIVE") {
      await supabase.auth.signOut();
      return { ok: false, error: "This account does not have admin access." };
    }
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/admin/dashboard" };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? friendlyAuthError(error.message) : "Could not sign in.",
    };
  }
}

export async function logoutAction(): Promise<SimpleResult> {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_SESSION_COOKIE);
  } else {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore - the cookie will expire anyway.
    }
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Used by the auth page to prefill the demo flow without exposing secrets. */
export async function finishDemoSwitchAction(userId: string): Promise<SimpleResult> {
  if (!isDemoMode()) return { ok: false, error: "Only available in demo mode." };
  const profile = await getData().getProfileById(userId);
  if (!profile) return { ok: false, error: "Demo account not found." };
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE, await signDemoSession(profile.id), COOKIE_OPTIONS);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function goToAuthAction(next?: string): Promise<never> {
  redirect(next ? `/auth?next=${encodeURIComponent(next)}` : "/auth");
}
