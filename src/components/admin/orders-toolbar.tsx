"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import type { BookingStatus } from "@/lib/types";
import { BOOKING_STATUSES, STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OrdersToolbar({
  status,
  query,
  total,
}: {
  status: BookingStatus | "ALL";
  query: string;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(query);
  const [pending, startTransition] = useTransition();

  function push(next: { q?: string; status?: string; page?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "orders");
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.status !== undefined) {
      if (next.status === "ALL") params.delete("status");
      else params.set("status", next.status);
    }
    if (!next.page) params.delete("page");
    else params.set("page", next.page);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => push({ status: "ALL" })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition",
              status === "ALL"
                ? "border-ink-950 bg-ink-950 text-cream-50"
                : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
            )}
          >
            All
          </button>
          {BOOKING_STATUSES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => push({ status: item })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition",
                status === item
                  ? "border-ink-950 bg-ink-950 text-cream-50"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
              )}
            >
              {STATUS_META[item].label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            push({ q: value.trim() });
          }}
          className="relative sm:w-64"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Search ID, customer, phone…"
            className="h-9 w-full rounded-full border border-ink-200 bg-white pl-9 pr-8 text-[12px] placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            aria-label="Search orders"
          />
          {value ? (
            <button
              type="button"
              onClick={() => {
                setValue("");
                push({ q: "" });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 hover:text-ink-700"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </form>
      </div>
      <p className="flex items-center gap-2 text-[11px] text-ink-400">
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        Showing {total} {total === 1 ? "order" : "orders"}
        {query ? ` matching “${query}”` : ""}
      </p>
    </div>
  );
}
