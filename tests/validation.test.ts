import { describe, expect, it } from "vitest";
import {
  addressSchema,
  adminLoginSchema,
  bookingSchema,
  firstError,
  fullNameSchema,
  normalizePhone,
  otpSchema,
  phoneSchema,
  sparePartSchema,
} from "@/lib/validation";

const validBooking = {
  serviceId: "11111111-1111-4111-8111-111111111111",
  address: "House 42, Sector 6, Rewari, near the water tank",
  date: "2026-11-02",
  slot: "10:00",
  paymentMethod: "COD" as const,
  notes: "",
};

describe("phoneSchema", () => {
  it("accepts common Indian formats and keeps the last 10 digits", () => {
    expect(phoneSchema.parse("98765 43210")).toBe("9876543210");
    expect(phoneSchema.parse("+91 98765-43210")).toBe("9876543210");
  });

  it("rejects numbers that cannot be Indian mobiles", () => {
    expect(phoneSchema.safeParse("1234567890").success).toBe(false);
    expect(phoneSchema.safeParse("98765").success).toBe(false);
    expect(phoneSchema.safeParse("abcdefghij").success).toBe(false);
  });
});

describe("fullNameSchema", () => {
  it("accepts Latin and Devanagari names with punctuation", () => {
    expect(fullNameSchema.parse("  Anjali Sharma ")).toBe("Anjali Sharma");
    expect(fullNameSchema.parse("O'Brien-Khan")).toBe("O'Brien-Khan");
    expect(fullNameSchema.safeParse("रमेश कुमार").success).toBe(true);
  });

  it("rejects single characters and digits", () => {
    expect(fullNameSchema.safeParse("A").success).toBe(false);
    expect(fullNameSchema.safeParse("Ramesh 123").success).toBe(false);
  });
});

describe("otpSchema", () => {
  it("requires exactly six digits for sign-in", () => {
    expect(otpSchema.parse("123456")).toBe("123456");
    expect(otpSchema.safeParse("12345").success).toBe(false);
    expect(otpSchema.safeParse("4821").success).toBe(false);
    expect(otpSchema.safeParse("12345a").success).toBe(false);
  });
});

describe("bookingSchema", () => {
  it("accepts a complete booking", () => {
    const parsed = bookingSchema.parse(validBooking);
    expect(parsed.address).toContain("Sector 6");
    expect(parsed.paymentMethod).toBe("COD");
  });

  it("rejects a missing or short address", () => {
    expect(bookingSchema.safeParse({ ...validBooking, address: "Rewari" }).success).toBe(false);
  });

  it("rejects malformed dates and slots", () => {
    expect(bookingSchema.safeParse({ ...validBooking, date: "02-11-2026" }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...validBooking, slot: "9am" }).success).toBe(false);
  });

  it("rejects non-UUID services and unknown payment methods", () => {
    expect(bookingSchema.safeParse({ ...validBooking, serviceId: "abc" }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...validBooking, paymentMethod: "CARD" }).success).toBe(false);
  });
});

describe("addressSchema", () => {
  it("requires a landmark-worthy address", () => {
    expect(addressSchema.safeParse("Rewari").success).toBe(false);
    expect(addressSchema.safeParse("House 42, Sector 6, Rewari, near the water tank").success).toBe(
      true,
    );
  });
});

describe("sparePartSchema", () => {
  it("coerces string quantities and prices from forms", () => {
    const parsed = sparePartSchema.parse({
      name: "Copper pipe",
      quantity: "2",
      unitPrice: "120.50",
    });
    expect(parsed.quantity).toBe(2);
    expect(parsed.unitPrice).toBe(120.5);
  });

  it("rejects zero quantities", () => {
    expect(
      sparePartSchema.safeParse({ name: "Copper pipe", quantity: "0", unitPrice: "120" }).success,
    ).toBe(false);
  });
});

describe("adminLoginSchema", () => {
  it("lowercases emails and enforces a minimum password length", () => {
    const parsed = adminLoginSchema.parse({ email: "ADMIN@MISTRINOW.IN", password: "Admin@123" });
    expect(parsed.email).toBe("admin@mistrinow.in");
    expect(adminLoginSchema.safeParse({ email: "admin@mistrinow.in", password: "123" }).success).toBe(
      false,
    );
  });
});

describe("helpers", () => {
  it("normalizes phones to E.164", () => {
    expect(normalizePhone("98765 43210")).toBe("+919876543210");
  });

  it("surfaces the first validation message", () => {
    const result = bookingSchema.safeParse({ ...validBooking, address: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstError(result.error)).toMatch(/address/i);
    }
  });
});
