"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Keeps the worker board fresh so new jobs and OTP-driven status changes appear. */
export function WorkerRefresh({ intervalMs = 12000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, intervalMs]);

  return null;
}
