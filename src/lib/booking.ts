import type {
  Booking,
  BookingStatus,
  PaymentMethod,
  Service,
} from "@/lib/types";
import { MAX_ADVANCE_DAYS, TIME_SLOTS } from "@/lib/constants";
import { istDateKey, istHour } from "@/lib/format";
import { round2 } from "@/lib/utils";

export type WorkerAction = "accept" | "start_travel" | "start_work" | "complete";

export const TIMELINE_INDEX: Record<BookingStatus, number> = {
  PENDING: 0,
  ASSIGNED: 1,
  ON_THE_WAY: 2,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  CANCELLED: -1,
};

export function isActiveBooking(status: BookingStatus): boolean {
  return status !== "COMPLETED" && status !== "CANCELLED";
}

export function canCustomerCancel(status: BookingStatus): boolean {
  return status === "PENDING" || status === "ASSIGNED";
}

export function canWorkerTransition(
  status: BookingStatus,
  action: WorkerAction,
): boolean {
  switch (action) {
    case "accept":
      return status === "PENDING";
    case "start_travel":
      return status === "ASSIGNED";
    case "start_work":
      return status === "ON_THE_WAY" || status === "ASSIGNED";
    case "complete":
      return status === "IN_PROGRESS";
  }
}

export function statusAfterWorkerAction(action: WorkerAction): BookingStatus {
  switch (action) {
    case "accept":
      return "ASSIGNED";
    case "start_travel":
      return "ON_THE_WAY";
    case "start_work":
      return "IN_PROGRESS";
    case "complete":
      return "COMPLETED";
  }
}

export function bookingTotal(baseAmount: number, items: { quantity: number; unitPrice: number }[]) {
  return round2(
    baseAmount + items.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
  );
}

export function bookingItemTotal(item: { quantity: number; unitPrice: number }) {
  return round2(item.quantity * item.unitPrice);
}

export function buildSlotIso(dateKey: string, slot: string): string {
  return `${dateKey}T${slot}:00+05:30`;
}

export function slotsForDate(dateKey: string): (typeof TIME_SLOTS)[number][] {
  const today = istDateKey();
  if (dateKey < today) return [];
  if (dateKey > addDaysKey(today, MAX_ADVANCE_DAYS)) return [];
  if (dateKey !== today) return TIME_SLOTS;

  const now = new Date();
  const minutes = Number(
    new Intl.DateTimeFormat("en-GB", {
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }).format(now),
  );
  const nowMinutes = istHour(now) * 60 + minutes;
  return TIME_SLOTS.filter((slot) => slot.hour * 60 >= nowMinutes - 15);
}

export function addDaysKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00+05:30`);
  date.setUTCDate(date.getUTCDate() + days);
  return istDateKey(date);
}

export function nextDays(count: number): { key: string; label: string; weekday: string }[] {
  const today = istDateKey();
  return Array.from({ length: count }, (_, index) => {
    const key = addDaysKey(today, index);
    const date = new Date(`${key}T12:00:00+05:30`);
    return {
      key,
      label:
        index === 0
          ? "Today"
          : index === 1
            ? "Tomorrow"
            : new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
                timeZone: "Asia/Kolkata",
              }).format(date),
      weekday: new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        timeZone: "Asia/Kolkata",
      }).format(date),
    };
  });
}

export function isSlotBookable(dateKey: string, slot: string): boolean {
  return slotsForDate(dateKey).some((item) => item.value === slot);
}

export function paymentLabel(method: PaymentMethod): string {
  return method === "UPI" ? "UPI (online)" : "Pay after service";
}

export function upiPaymentUri(
  amount: number,
  bookingCode: string,
  upiId: string,
): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: "Mistri Now Rewari",
    am: amount.toFixed(2),
    cu: "INR",
    tn: `Booking ${bookingCode}`,
  });
  return `upi://pay?${params.toString()}`;
}

export function bookingProgress(booking: Booking): number {
  const steps = TIMELINE_INDEX[booking.status];
  if (steps < 0) return 0;
  return Math.round((steps / 3) * 100);
}

export function serviceSearchText(service: Service): string {
  return `${service.title} ${service.description} ${service.category}`.toLowerCase();
}
