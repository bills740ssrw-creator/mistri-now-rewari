import { randomInt, timingSafeEqual } from "node:crypto";

export function generateOtp(): string {
  return String(randomInt(1000, 10000));
}

export function isValidOtp(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}$/.test(value);
}

export function otpMatches(expected: string | null | undefined, provided: string): boolean {
  if (!expected || !isValidOtp(provided)) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function maskOtp(value: string | null | undefined): string {
  return value ? `••${value.slice(-2)}` : "••••";
}
