import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white/60 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-100 text-ink-500">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-base font-bold text-ink-900">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "brand" | "saffron" | "ink" | "rose";
}) {
  const accents = {
    brand: "bg-brand-50 text-brand-700",
    saffron: "bg-saffron-50 text-saffron-700",
    ink: "bg-ink-100 text-ink-700",
    rose: "bg-rose-50 text-rose-600",
  } as const;

  return (
    <div className="surface rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-400">{label}</p>
        {icon ? (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              accents[accent ?? "brand"],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[26px] font-extrabold leading-none tracking-[-0.03em] text-ink-900">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[12px] text-ink-500">{hint}</p> : null}
    </div>
  );
}
