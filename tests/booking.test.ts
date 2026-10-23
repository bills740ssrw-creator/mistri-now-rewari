import { describe, expect, it } from "vitest";
import type { Booking, BookingStatus } from "@/lib/types";
import {
  TIMELINE_INDEX,
  addDaysKey,
  bookingItemTotal,
  bookingProgress,
  bookingTotal,
  buildSlotIso,
  canCustomerCancel,
  canWorkerTransition,
  isActiveBooking,
  isSlotBookable,
  nextDays,
  paymentLabel,
  slotsForDate,
  statusAfterWorkerAction,
  upiPaymentUri,
} from "@/lib/booking";
import { MAX_ADVANCE_DAYS, TIME_SLOTS } from "@/lib/constants";
import { istDateKey } from "@/lib/format";

function bookingWithStatus(status: BookingStatus): Booking {
  return { status } as Booking;
}

describe("booking totals", () => {
  it("returns the base amount when there are no items", () => {
    expect(bookingTotal(499, [])).toBe(499);
  });

  it("adds line items to the base amount", () => {
    expect(
      bookingTotal(499, [
        { quantity: 2, unitPrice: 120.5 },
        { quantity: 1, unitPrice: 75 },
      ]),
    ).toBe(815);
  });

  it("rounds floating point noise to paise", () => {
    expect(bookingTotal(0.1, [{ quantity: 1, unitPrice: 0.2 }])).toBe(0.3);
    expect(bookingItemTotal({ quantity: 3, unitPrice: 33.333 })).toBe(100);
  });
});

describe("worker transitions", () => {
  const cases = [
    ["accept", "PENDING", true],
    ["accept", "ASSIGNED", false],
    ["start_travel", "ASSIGNED", true],
    ["start_travel", "ON_THE_WAY", false],
    ["start_work", "ASSIGNED", true],
    ["start_work", "ON_THE_WAY", true],
    ["start_work", "IN_PROGRESS", false],
    ["complete", "IN_PROGRESS", true],
    ["complete", "ON_THE_WAY", false],
  ] as const;

  it.each(cases)("%s is %s -> %s", (action, status, expected) => {
    expect(canWorkerTransition(status, action)).toBe(expected);
  });

  it("maps each action to its next status", () => {
    expect(statusAfterWorkerAction("accept")).toBe("ASSIGNED");
    expect(statusAfterWorkerAction("start_travel")).toBe("ON_THE_WAY");
    expect(statusAfterWorkerAction("start_work")).toBe("IN_PROGRESS");
    expect(statusAfterWorkerAction("complete")).toBe("COMPLETED");
  });

  it("only lets customers cancel before work starts", () => {
    expect(canCustomerCancel("PENDING")).toBe(true);
    expect(canCustomerCancel("ASSIGNED")).toBe(true);
    expect(canCustomerCancel("ON_THE_WAY")).toBe(false);
    expect(canCustomerCancel("IN_PROGRESS")).toBe(false);
    expect(canCustomerCancel("COMPLETED")).toBe(false);
  });

  it("treats completed and cancelled bookings as inactive", () => {
    expect(isActiveBooking("IN_PROGRESS")).toBe(true);
    expect(isActiveBooking("COMPLETED")).toBe(false);
    expect(isActiveBooking("CANCELLED")).toBe(false);
  });
});

describe("progress and timeline", () => {
  it("maps statuses to timeline positions", () => {
    expect(TIMELINE_INDEX.PENDING).toBe(0);
    expect(TIMELINE_INDEX.ASSIGNED).toBe(1);
    expect(TIMELINE_INDEX.IN_PROGRESS).toBe(2);
    expect(TIMELINE_INDEX.COMPLETED).toBe(3);
    expect(TIMELINE_INDEX.CANCELLED).toBe(-1);
  });

  it("converts timeline positions to percentages", () => {
    expect(bookingProgress(bookingWithStatus("PENDING"))).toBe(0);
    expect(bookingProgress(bookingWithStatus("ASSIGNED"))).toBe(33);
    expect(bookingProgress(bookingWithStatus("ON_THE_WAY"))).toBe(67);
    expect(bookingProgress(bookingWithStatus("COMPLETED"))).toBe(100);
    expect(bookingProgress(bookingWithStatus("CANCELLED"))).toBe(0);
  });
});

describe("slots", () => {
  const today = istDateKey();

  it("builds an IST ISO timestamp from a date key and slot", () => {
    const iso = buildSlotIso("2026-11-02", "10:00");
    expect(iso).toBe("2026-11-02T10:00:00+05:30");
    expect(Number.isNaN(new Date(iso).getTime())).toBe(false);
  });

  it("offers no slots for past dates or dates beyond the booking window", () => {
    expect(slotsForDate("2000-01-01")).toEqual([]);
    expect(slotsForDate(addDaysKey(today, MAX_ADVANCE_DAYS + 1))).toEqual([]);
  });

  it("offers the full day for valid future dates", () => {
    expect(slotsForDate(addDaysKey(today, 3))).toEqual(TIME_SLOTS);
  });

  it("never offers a slot outside the catalogue", () => {
    const available = slotsForDate(today);
    for (const slot of available) {
      expect(TIME_SLOTS).toContain(slot);
    }
  });

  it("agrees with isSlotBookable", () => {
    const date = addDaysKey(today, 2);
    expect(isSlotBookable(date, "10:00")).toBe(true);
    expect(isSlotBookable(date, "23:30")).toBe(false);
  });
});

describe("date helpers", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDaysKey("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDaysKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("labels the first two days and keeps keys unique", () => {
    const days = nextDays(4);
    expect(days).toHaveLength(4);
    expect(days[0]?.label).toBe("Today");
    expect(days[1]?.label).toBe("Tomorrow");
    expect(new Set(days.map((day) => day.key)).size).toBe(4);
    expect(days[0]?.key).toBe(istDateKey());
  });
});

describe("payments", () => {
  it("labels payment methods", () => {
    expect(paymentLabel("UPI")).toBe("UPI (online)");
    expect(paymentLabel("COD")).toBe("Pay after service");
  });

  it("builds a valid UPI deep link", () => {
    const uri = upiPaymentUri(3399, "MRW-ABC123", "mistrinowrewari@upi");
    expect(uri.startsWith("upi://pay?")).toBe(true);
    const params = new URLSearchParams(uri.slice("upi://pay?".length));
    expect(params.get("pa")).toBe("mistrinowrewari@upi");
    expect(params.get("am")).toBe("3399.00");
    expect(params.get("cu")).toBe("INR");
    expect(params.get("tn")).toBe("Booking MRW-ABC123");
  });
});
