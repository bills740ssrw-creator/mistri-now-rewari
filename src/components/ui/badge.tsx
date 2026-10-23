import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "saffron" | "rose" | "sky" | "ink";
  className?: string;
}) {
  const tones = {
    neutral: "bg-cream-100 text-ink-700 ring-ink-200/70",
    brand: "bg-brand-50 text-brand-700 ring-brand-600/15",
    saffron: "bg-saffron-50 text-saffron-700 ring-saffron-600/20",
    rose: "bg-rose-50 text-rose-700 ring-rose-600/15",
    sky: "bg-sky-50 text-sky-700 ring-sky-600/15",
    ink: "bg-ink-900 text-cream-50 ring-ink-900",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status, className }: { status: BookingStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        meta.tone,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}
