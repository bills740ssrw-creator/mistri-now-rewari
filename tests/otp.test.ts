import { describe, expect, it } from "vitest";
import { generateOtp, isValidOtp, maskOtp, otpMatches } from "@/lib/otp";

describe("generateOtp", () => {
  it("produces a four-digit string in the documented range", () => {
    for (let index = 0; index < 50; index += 1) {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{4}$/);
      const value = Number(otp);
      expect(value).toBeGreaterThanOrEqual(1000);
      expect(value).toBeLessThanOrEqual(9999);
    }
  });
});

describe("isValidOtp", () => {
  it("accepts only four-digit strings", () => {
    expect(isValidOtp("4821")).toBe(true);
    expect(isValidOtp("0482")).toBe(true);
    expect(isValidOtp(4821)).toBe(false);
    expect(isValidOtp("482")).toBe(false);
    expect(isValidOtp("48210")).toBe(false);
    expect(isValidOtp(null)).toBe(false);
  });
});

describe("otpMatches", () => {
  it("matches identical codes", () => {
    expect(otpMatches("7390", "7390")).toBe(true);
  });

  it("rejects wrong, malformed or missing codes", () => {
    expect(otpMatches("7390", "7391")).toBe(false);
    expect(otpMatches("7390", "739")).toBe(false);
    expect(otpMatches("7390", "73900")).toBe(false);
    expect(otpMatches(null, "7390")).toBe(false);
    expect(otpMatches(undefined, "7390")).toBe(false);
  });
});

describe("maskOtp", () => {
  it("reveals only the last two digits", () => {
    const masked = maskOtp("4821");
    expect(masked).toMatch(/21$/);
    expect(masked).not.toContain("48");
  });

  it("handles an empty code", () => {
    expect(maskOtp(null)).toBe("••••");
    expect(maskOtp(undefined)).toBe("••••");
  });
});
