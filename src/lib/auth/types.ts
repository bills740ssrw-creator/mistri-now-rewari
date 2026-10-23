export type OtpRequestResult =
  | { ok: true; demoOtp?: string; message: string }
  | { ok: false; error: string };

export type OtpVerifyResult =
  | { ok: true; needsOnboarding: true; message: string }
  | { ok: true; needsOnboarding: false; redirectTo: string }
  | { ok: false; error: string };

export type SignupResult = { ok: true; redirectTo: string } | { ok: false; error: string };

export type UploadResult =
  | { ok: true; path: string; demo: boolean }
  | { ok: false; error: string };

export type SimpleResult = { ok: true } | { ok: false; error: string };
