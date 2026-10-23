"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Keeps server-rendered booking views current.
 * - Demo mode: light polling (the seeded JSON store has no realtime channel).
 * - Supabase: subscribes to postgres_changes on the booking + its line items.
 */
export function LiveRefresher({
  bookingId,
  intervalMs = 6000,
}: {
  bookingId: string;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const demo =
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (demo) {
      const timer = window.setInterval(() => {
        if (document.visibilityState === "visible") router.refresh();
      }, intervalMs);
      const onVisible = () => {
        if (document.visibilityState === "visible") router.refresh();
      };
      document.addEventListener("visibilitychange", onVisible);
      return () => {
        window.clearInterval(timer);
        document.removeEventListener("visibilitychange", onVisible);
      };
    }

    let supabase: ReturnType<typeof createSupabaseBrowserClient> | null = null;
    try {
      supabase = createSupabaseBrowserClient();
      const channel = supabase
        .channel(`booking-${bookingId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookings", filter: `id=eq.${bookingId}` },
          () => router.refresh(),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "booking_items",
            filter: `booking_id=eq.${bookingId}`,
          },
          () => router.refresh(),
        )
        .subscribe();
      return () => {
        void supabase?.removeChannel(channel);
      };
    } catch {
      const timer = window.setInterval(() => router.refresh(), 15000);
      return () => window.clearInterval(timer);
    }
  }, [router, bookingId, intervalMs]);

  return null;
}
