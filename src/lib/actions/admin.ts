"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth/session";
import { getData } from "@/lib/data";
import { firstError, serviceSchema } from "@/lib/validation";
import type { ActionResult, ServiceInput } from "@/lib/types";
import { isDemoMode } from "@/lib/session";

function revalidateAdmin() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/dashboard");
  revalidatePath("/worker/dashboard");
  revalidatePath("/account");
}

async function requireAdminAction() {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Please sign in again." as const, profile: null };
  if (profile.role !== "admin" || profile.status !== "ACTIVE") {
    return { error: "Admin access required." as const, profile: null };
  }
  return { error: null, profile };
}

export async function reviewWorkerAction(input: {
  workerId: string;
  decision: "APPROVE" | "REJECT";
  reason?: string;
}): Promise<ActionResult> {
  const { error } = await requireAdminAction();
  if (error) return { ok: false, error };
  if (!z.string().uuid().safeParse(input.workerId).success) {
    return { ok: false, error: "Worker not found." };
  }
  const reason = (input.reason ?? "").trim().slice(0, 300);
  if (input.decision === "REJECT" && reason.length < 5) {
    return { ok: false, error: "Add a short reason for rejecting this worker." };
  }

  try {
    if (input.decision === "APPROVE") {
      await getData().setWorkerApproved(input.workerId);
    } else {
      await getData().setWorkerRejected(input.workerId, reason);
    }
    revalidateAdmin();
    return {
      ok: true,
      message: input.decision === "APPROVE" ? "Worker approved." : "Worker rejected.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not review this worker.",
    };
  }
}

export async function reassignBookingAction(input: {
  bookingId: string;
  workerId: string;
}): Promise<ActionResult> {
  const { error } = await requireAdminAction();
  if (error) return { ok: false, error };
  if (
    !z.string().uuid().safeParse(input.bookingId).success ||
    !z.string().uuid().safeParse(input.workerId).success
  ) {
    return { ok: false, error: "Choose a valid technician." };
  }
  try {
    await getData().reassignBooking(input.bookingId, input.workerId);
    revalidateAdmin();
    revalidatePath(`/bookings/${input.bookingId}`);
    return { ok: true, message: "Technician reassigned." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reassign this booking.",
    };
  }
}

export async function saveServiceAction(
  input: ServiceInput & { id?: string },
): Promise<ActionResult> {
  const { error } = await requireAdminAction();
  if (error) return { ok: false, error };

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: firstError(parsed.error),
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await getData().saveService({ ...parsed.data, id: input.id });
    revalidateAdmin();
    return { ok: true, message: input.id ? "Service updated." : "Service added." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save this service.",
    };
  }
}

export async function toggleServiceAction(input: {
  serviceId: string;
  active: boolean;
}): Promise<ActionResult> {
  const { error } = await requireAdminAction();
  if (error) return { ok: false, error };
  if (!z.string().uuid().safeParse(input.serviceId).success) {
    return { ok: false, error: "Service not found." };
  }
  try {
    await getData().setServiceActive(input.serviceId, input.active);
    revalidateAdmin();
    return {
      ok: true,
      message: input.active ? "Service is live." : "Service hidden from the catalogue.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update this service.",
    };
  }
}

export async function resetDemoDataAction(): Promise<ActionResult> {
  const { error } = await requireAdminAction();
  if (error) return { ok: false, error };
  if (!isDemoMode()) return { ok: false, error: "Only available in demo mode." };
  try {
    await getData().resetDemoData?.();
    revalidateAdmin();
    revalidatePath("/");
    revalidatePath("/bookings", "layout");
    return { ok: true, message: "Demo data reset to the seeded state." };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reset demo data.",
    };
  }
}
