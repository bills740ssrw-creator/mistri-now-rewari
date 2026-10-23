"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-[58px] shrink-0 items-center rounded-full border transition-colors duration-300 disabled:opacity-50",
        checked
          ? "border-brand-600 bg-brand-600"
          : "border-ink-200 bg-ink-100 hover:border-ink-300",
      )}
    >
      <span
        className={cn(
          "absolute h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300",
          checked ? "translate-x-[28px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}
