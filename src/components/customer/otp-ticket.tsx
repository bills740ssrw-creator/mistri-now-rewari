"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function OtpTicket({
  label,
  otp,
  hint,
  tone = "brand",
}: {
  label: string;
  otp: string;
  hint: string;
  tone?: "brand" | "saffron";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      toast.success("OTP copied.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy. Please read the code aloud instead.");
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4",
        tone === "brand"
          ? "border-brand-600/20 bg-brand-50/70"
          : "border-saffron-600/20 bg-saffron-50/70",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute -right-5 -top-5 h-16 w-16 rounded-full",
          tone === "brand" ? "bg-brand-200/40" : "bg-saffron-200/50",
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em]",
              tone === "brand" ? "text-brand-800" : "text-saffron-800",
            )}
          >
            <KeyRound className="h-3 w-3" /> {label}
          </p>
          <p className="mt-2 font-mono text-[30px] font-bold leading-none tracking-[0.28em] text-ink-950">
            {otp}
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-ink-500">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
            {hint}
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-ink-500 ring-1 ring-ink-200 transition hover:text-ink-900"
          aria-label={`Copy ${label} OTP`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-brand-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
