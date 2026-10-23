"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Loader2, MapPin, Radio, Zap } from "lucide-react";
import { toast } from "sonner";
import type { BookingDetail } from "@/lib/types";
import { formatDateTime, formatINR } from "@/lib/format";
import { acceptJobAction } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/service-icon";
import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OpenJobs({ jobs }: { jobs: BookingDetail[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (jobs.length === 0) return null;

  async function accept(id: string) {
    setBusyId(id);
    try {
      const result = await acceptJobAction(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Job accepted. Head to the customer's address.");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-saffron-300/70 bg-gradient-to-br from-saffron-50 via-white to-cream-50">
      <div className="flex items-center justify-between gap-3 border-b border-saffron-200/60 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-saffron-400/20 text-saffron-700">
            <Radio className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 animate-ping rounded-full bg-saffron-500" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-ink-950">
              {jobs.length} new {jobs.length === 1 ? "job" : "jobs"} in your trade
            </p>
            <p className="text-[11px] text-ink-500">First to accept gets the job — prices are fixed.</p>
          </div>
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-saffron-700 ring-1 ring-saffron-300 sm:flex">
          <Zap className="h-3 w-3" /> Live
        </span>
      </div>

      <ul className="divide-y divide-saffron-200/50">
        {jobs.map((detail) => {
          const { booking, service } = detail;
          const busy = busyId === booking.id;
          return (
            <li key={booking.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1",
                  CATEGORY_META[service.category].tint,
                  CATEGORY_META[service.category].ring,
                )}
              >
                <ServiceIcon name={service.icon} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold text-ink-950">{service.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {booking.address.split(",").slice(0, 2).join(",")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3" /> {formatDateTime(booking.scheduledTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <p className="font-display text-[16px] font-extrabold text-ink-950">
                  {formatINR(booking.totalAmount)}
                </p>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => accept(booking.id)}
                  disabled={busy || busyId !== null}
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Accept <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
