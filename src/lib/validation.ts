import { z } from "zod";
import type { PaymentMethod, ServiceCategory } from "@/lib/types";
import { CATEGORY_OPTIONS } from "@/lib/constants";

const CATEGORY_VALUES = CATEGORY_OPTIONS.map((option) => option.value) as [
  ServiceCategory,
  ...ServiceCategory[],
];

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your full name")
  .max(60, "Name is too long")
  .regex(/^[a-zA-Z\u0900-\u097F\s.'-]+$/, "Use letters only");

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, "").slice(-10))
  .refine((value) => /^[6-9]\d{9}$/.test(value), "Enter a valid 10-digit mobile number");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const optionalEmailSchema = z
  .union([z.literal(""), emailSchema])
  .optional()
  .transform((value) => (value ? value : undefined));

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit OTP");

export const addressSchema = z
  .string()
  .trim()
  .min(10, "Add your full address with a landmark")
  .max(300, "Address is too long");

export const notesSchema = z.string().trim().max(500, "Notes must be under 500 characters").optional();

export const customerSignupSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  termsAccepted: z.literal(true, { message: "Please accept the terms to continue" }),
});

export const workerSignupSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  serviceCategory: z.enum(CATEGORY_VALUES, { message: "Choose your trade" }),
  termsAccepted: z.literal(true, { message: "Please accept the terms to continue" }),
});

export const bookingSchema = z.object({
  serviceId: z.string().uuid("Choose a valid service"),
  address: addressSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  slot: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time slot"),
  paymentMethod: z.enum(["UPI", "COD"] satisfies [PaymentMethod, PaymentMethod]),
  notes: notesSchema,
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2, "Service name is required").max(60),
  price: z.coerce.number().int().min(1, "Price must be at least ₹1").max(200000),
  description: z.string().trim().min(10, "Add a short description").max(240),
  category: z.enum(CATEGORY_VALUES),
  badge: z.string().trim().max(30).optional(),
  icon: z.enum([
    "wrench",
    "zap",
    "droplets",
    "washing-machine",
    "flame",
    "filter",
    "snowflake",
    "wind",
  ]),
  durationMins: z.coerce.number().int().min(15).max(480),
  isActive: z.boolean(),
});

export const sparePartSchema = z.object({
  name: z.string().trim().min(2, "Part name is required").max(80),
  quantity: z.coerce.number().int().min(1).max(20),
  unitPrice: z.coerce.number().min(1, "Price must be at least ₹1").max(50000),
});

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(-10);
  return `+91${digits}`;
}

export function isValidIndianPhone(value: string): boolean {
  return /^[6-9]\d{9}$/.test(value.replace(/\D/g, "").slice(-10));
}

export function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] = [...(out[key] ?? []), issue.message];
  }
  return out;
}

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again";
}
