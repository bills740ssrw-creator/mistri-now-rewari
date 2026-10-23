"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Search, Wrench } from "lucide-react";
import type { BookingDetail, BookingStatus } from "@/lib/types";
import { CATEGORY_META } from "@/lib/constants";
import { isActiveBooking } from "@/lib/booking";
import { formatDateTime, formatINR } from "@/lib/format";
import { StatusPill } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ServiceIcon } from "@/components/ui/service-icon";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "all" | "active" | "completed" | "cancelled";

const TABS: { key: Tab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

function matchesTab(status: BookingStatus, tab: Tab) {
  if (tab === "all") return true;
  if (tab === "active") return isActiveBooking(status);
  if (tab === "completed") return status === "COMPLETED";
  return status === "CANCELLED";
}

export function BookingsList({ bookings }: { bookings: BookingDetail[] }) {
  const [tab, setTab] = useState<Tab>("active");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    return {
      active: bookings.filter((item) => isActiveBooking(item.booking.status)).length,
      completed: bookings.filter((item) => item.booking.status === "COMPLETED").length,
      cancelled: bookings.filter((item) => item.booking.status === "CANCELLED").length,
      all: bookings.length,
    } satisfies Record<Tab, number>;
  }, [bookings]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bookings.filter((item) => {
      if (!matchesTab(item.booking.status, tab)) return false;
      if (!needle) return true;
      return (
        item.service.title.toLowerCase().includes(needle) ||
        item.booking.code.toLowerCase().includes(needle) ||
        item.booking.address.toLowerCase().includes(needle)
      );
    });
  }, [bookings, tab, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-pressed={tab === item.key}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition",
                tab === item.key
                  ? "bg-ink-950 text-cream-50"
                  : "bg-white text-ink-600 ring-1 ring-ink-200 hover:text-ink-900",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
                  tab === item.key ? "bg-white/15 text-cream-100" : "bg-cream-100 text-ink-500",
                )}
              >
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search bookings"
            aria-label="Search bookings"
            className="h-9 w-full rounded-full border border-ink-200 bg-white pl-9 pr-3 text-[12.5px] placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-ink-200 bg-white/70 px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-100 text-ink-400">
            <Wrench className="h-5 w-5" />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-ink-900">
            {tab === "active" ? "No active bookings" : "Nothing here yet"}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-ink-500">
            {tab === "active"
              ? "When you book a service, you'll be able to track your professional here in real time."
              : "Bookings will appear here once you place them."}
          </p>
          <Link href="/services" className={buttonClasses("brand", "sm", "mt-5")}>
            Book a service <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {visible.map((item) => (
            <BookingCard key={item.booking.id} detail={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

function BookingCard({ detail }: { detail: BookingDetail }) {
  const { booking, service, worker } = detail;
  const active = isActiveBooking(booking.status);

  return (
    <li>
      <Link
        href={`/bookings/${booking.id}`}
        className="group block overflow-hidden rounded-3xl border border-ink-100 bg-white p-4 transition duration-200 hover:border-ink-200 hover:shadow-soft sm:p-5"
      >
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1",
              CATEGORY_META[service.category].tint,
              CATEGORY_META[service.category].ring,
            )}
          >
            <ServiceIcon name={service.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-[14.5px] font-bold text-ink-950">{service.title}</h3>
              <span className="font-mono text-[10px] text-ink-400">{booking.code}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-500">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDateTime(booking.scheduledTime)}
              </span>
              <span className="flex max-w-[260px] items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{booking.address}</span>
              </span>
            </div>
            {worker ? (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-500">
                <Avatar name={worker.fullName} size="sm" className="h-5 w-5 text-[8px]" />
                <span className="font-medium text-ink-700">{worker.fullName}</span>
                <span aria-hidden>·</span>
                <span>{worker.jobsCompleted} jobs</span>
              </div>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <StatusPill status={booking.status} />
            <p className="mt-2 font-display text-[15px] font-extrabold text-ink-950">
              {formatINR(booking.totalAmount)}
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-ink-100 pt-3">
          <span className="text-[11px] text-ink-400">
            {booking.paymentStatus === "PAID"
              ? "Paid"
              : booking.paymentMethod === "UPI"
                ? "UPI · pay online"
                : "Pay after service"}
          </span>
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700">
            {active ? "Track live" : "View details"}
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </li>
  );
}
