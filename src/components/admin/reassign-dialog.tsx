"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Star, UserCog } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";
import { reassignBookingAction } from "@/lib/actions/admin";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export function ReassignDialog({
  bookingId,
  currentWorkerId,
  workers,
  code,
}: {
  bookingId: string;
  currentWorkerId: string | null;
  workers: Profile[];
  code: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentWorkerId ?? "");
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!selected) return;
    setPending(true);
    try {
      const result = await reassignBookingAction({ bookingId, workerId: selected });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Technician reassigned.");
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
      >
        <UserCog className="h-3 w-3" /> Reassign
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Reassign booking"
        description={`${code} · choose an active technician`}
        size="sm"
      >
        <div className="max-h-[46vh] space-y-1.5 overflow-y-auto pr-1">
          {workers.length === 0 ? (
            <p className="rounded-xl bg-cream-100 p-3 text-[12px] text-ink-500">
              No active technicians available.
            </p>
          ) : null}
          {workers.map((worker) => (
            <button
              key={worker.id}
              type="button"
              onClick={() => setSelected(worker.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                selected === worker.id
                  ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/15"
                  : "border-ink-200 bg-white hover:border-ink-300",
              )}
            >
              <Avatar name={worker.fullName} size="sm" online={worker.isOnline} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-ink-900">
                  {worker.fullName}
                </span>
                <span className="flex items-center gap-1 text-[10.5px] text-ink-500">
                  <Star className="h-2.5 w-2.5 fill-saffron-400 text-saffron-400" />
                  {worker.rating.toFixed(1)} · {worker.jobsCompleted} jobs ·{" "}
                  {worker.isOnline ? "online" : "offline"}
                </span>
              </span>
              {selected === worker.id ? (
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              ) : null}
            </button>
          ))}
        </div>
        <Button
          variant="brand"
          size="md"
          className="mt-4 w-full"
          onClick={submit}
          disabled={!selected || pending}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Confirm reassignment
        </Button>
        <p className="mt-2 text-center text-[10.5px] text-ink-400">
          The technician and customer are both notified with the updated assignment.
        </p>
      </Modal>
    </>
  );
}
