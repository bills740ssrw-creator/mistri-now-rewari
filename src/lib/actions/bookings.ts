"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth/session";
import { getData } from "@/lib/data";
import {
  bookingSchema,
  firstError,
  sparePartSchema,
} from "@/lib/validation";
import { buildSlotIso, isSlotBookable } from "@/lib/booking";
import type { ActionResult, IssueMedia, PaymentMethod } from "@/lib/types";
import { isDemoMode } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

function revalidateBookingSurfaces(bookingId?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/account");
  revalidatePath("/worker/dashboard");
  revalidatePath("/admin/dashboard");
  if (bookingId) revalidatePath(`/bookings/${bookingId}`);
}

function mediaAllowed(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:image/")) return isDemoMode();
  return /\/storage\/v1\/object\/public\/booking-media\//.test(url);
}

export async function uploadIssueMediaAction(input: {
  dataUrl: string;
  name: string;
}): Promise<ActionResult<{ url: string }>> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "customer") {
    return { ok: false, error: "Sign in as a customer to attach photos." };
  }
  const limit = rateLimit(`media:${profile.id}`, 20, 60 * 60_000);
  if (!limit.ok) return { ok: false, error: "Too many uploads. Please try again later." };

  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(
    input.dataUrl,
  );
  if (!match) return { ok: false, error: "Attach a JPG, PNG or WebP image." };
  const mime = match[1]!;
  const base64 = match[2]!.replace(/\s/g, "");
  const size = Math.floor((base64.length * 3) / 4);
  if (size > 1_500_000) return { ok: false, error: "Each photo must be under 1.5 MB." };
  if (size < 1024) return { ok: false, error: "That photo looks empty. Try another." };

  if (isDemoMode()) return { ok: true, data: { url: input.dataUrl } };

  try {
    const supabase = await createSupabaseServerClient();
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const path = `${profile.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("booking-media")
      .upload(path, Buffer.from(base64, "base64"), { contentType: mime, upsert: false });
    if (error) return { ok: false, error: `Upload failed: ${error.message}` };
    const { data } = supabase.storage.from("booking-media").getPublicUrl(path);
    return { ok: true, data: { url: data.publicUrl } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed. Please try again.",
    };
  }
}

export async function createBookingAction(input: {
  serviceId: string;
  address: string;
  date: string;
  slot: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  issueMedia?: IssueMedia[];
}): Promise<ActionResult<{ id: string; code: string }>> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Please sign in to book a service." };
  if (profile.role !== "customer") {
    return { ok: false, error: "Only customer accounts can book services." };
  }
  if (profile.status !== "ACTIVE") {
    return { ok: false, error: "This account is not active. Please call support." };
  }

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: firstError(parsed.error),
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!isSlotBookable(parsed.data.date, parsed.data.slot)) {
    return { ok: false, error: "That slot is no longer available. Please pick another time." };
  }

  const media = (input.issueMedia ?? []).slice(0, 3);
  if (media.some((item) => !mediaAllowed(item.url))) {
    return { ok: false, error: "One of the attachments is invalid. Please re-upload it." };
  }

  try {
    const booking = await getData().createBooking(profile.id, {
      serviceId: parsed.data.serviceId,
      address: parsed.data.address,
      scheduledTime: buildSlotIso(parsed.data.date, parsed.data.slot),
      paymentMethod: parsed.data.paymentMethod,
      notes: parsed.data.notes,
      issueMedia: media,
    });
    revalidateBookingSurfaces(booking.id);
    return { ok: true, data: { id: booking.id, code: booking.code } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not create your booking.",
    };
  }
}

export async function cancelBookingAction(input: {
  bookingId: string;
  reason: string;
}): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "customer") {
    return { ok: false, error: "Please sign in again." };
  }
  if (!z.string().uuid().safeParse(input.bookingId).success) {
    return { ok: false, error: "Booking not found." };
  }
  const reason = input.reason.trim().slice(0, 200) || "Cancelled by customer";
  try {
    await getData().cancelBooking(input.bookingId, profile.id, reason);
    revalidateBookingSurfaces(input.bookingId);
    return { ok: true, message: "Booking cancelled." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not cancel this booking.",
    };
  }
}

export async function markBookingPaidAction(bookingId: string): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Please sign in again." };
  if (!z.string().uuid().safeParse(bookingId).success) {
    return { ok: false, error: "Booking not found." };
  }
  try {
    await getData().markPaymentPaid(bookingId, { id: profile.id, role: profile.role });
    revalidateBookingSurfaces(bookingId);
    return { ok: true, message: "Payment marked as received." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update payment status.",
    };
  }
}

async function requireWorkerForAction() {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Please sign in again." as const, profile: null };
  if (profile.role !== "worker") return { error: "Worker account required." as const, profile: null };
  if (profile.status !== "ACTIVE") {
    return { error: "Your account is still pending admin approval." as const, profile: null };
  }
  return { error: null, profile };
}

export async function toggleWorkerOnlineAction(online: boolean): Promise<ActionResult> {
  const { error, profile } = await requireWorkerForAction();
  if (error || !profile) return { ok: false, error: error ?? "Worker account required." };
  try {
    await getData().setWorkerOnline(profile.id, online);
    revalidatePath("/worker/dashboard");
    return { ok: true, message: online ? "You are online." : "You are offline." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update availability.",
    };
  }
}

export async function acceptJobAction(bookingId: string): Promise<ActionResult> {
  const { error, profile } = await requireWorkerForAction();
  if (error || !profile) return { ok: false, error: error ?? "Worker account required." };
  if (!z.string().uuid().safeParse(bookingId).success) {
    return { ok: false, error: "Job not found." };
  }
  try {
    await getData().acceptJob(bookingId, profile.id);
    revalidateBookingSurfaces(bookingId);
    return { ok: true, message: "Job accepted. Head to the customer's address." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not accept this job.",
    };
  }
}

export async function startTravelAction(bookingId: string): Promise<ActionResult> {
  const { error, profile } = await requireWorkerForAction();
  if (error || !profile) return { ok: false, error: error ?? "Worker account required." };
  try {
    await getData().moveToOnTheWay(bookingId, profile.id);
    revalidateBookingSurfaces(bookingId);
    return { ok: true, message: "Customer can see that you are on the way." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update the job.",
    };
  }
}

export async function verifyJobOtpAction(input: {
  bookingId: string;
  kind: "start" | "end";
  code: string;
}): Promise<ActionResult> {
  const { error, profile } = await requireWorkerForAction();
  if (error || !profile) return { ok: false, error: error ?? "Worker account required." };
  if (!/^\d{4}$/.test(input.code)) {
    return { ok: false, error: "Enter the 4-digit code from the customer." };
  }
  try {
    const result = await getData().verifyAndAdvance(
      input.bookingId,
      profile.id,
      input.kind,
      input.code,
    );
    if (!result.ok) return { ok: false, error: result.error ?? "Could not verify the OTP." };
    revalidateBookingSurfaces(input.bookingId);
    return {
      ok: true,
      message: input.kind === "start" ? "Job started." : "Job completed successfully.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not verify the OTP.",
    };
  }
}

export async function addSparePartAction(input: {
  bookingId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}): Promise<ActionResult> {
  const { error, profile } = await requireWorkerForAction();
  if (error || !profile) return { ok: false, error: error ?? "Worker account required." };
  const parsed = sparePartSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  try {
    await getData().addBookingItem(input.bookingId, profile.id, {
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unitPrice: parsed.data.unitPrice,
    });
    revalidateBookingSurfaces(input.bookingId);
    return { ok: true, message: "Spare part added to the bill." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not add the spare part.",
    };
  }
}
