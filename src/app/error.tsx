"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Phone, RefreshCw, TriangleAlert } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { buttonClasses } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-50 px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white p-6 text-center shadow-soft">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-50 text-saffron-700">
          <TriangleAlert className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-[22px] font-bold tracking-[-0.02em] text-ink-950">
          Something went wrong on our side
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
          The page could not load. Your booking was not affected. Try again, or call us if you were
          in the middle of something urgent.
        </p>
        {error.digest ? (
          <p className="mt-3 rounded-lg bg-cream-100 px-2 py-1 text-[10.5px] font-mono text-ink-400">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={reset} className={buttonClasses("primary", "md")}>
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <Link href="/" className={buttonClasses("outline", "md")}>
            Go to home
          </Link>
        </div>
        <a
          href={BRAND.phoneHref}
          className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-700"
        >
          <Phone className="h-3.5 w-3.5" /> {BRAND.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
