"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Power } from "lucide-react";
import { toast } from "sonner";
import { toggleWorkerOnlineAction } from "@/lib/actions/bookings";
import { cn } from "@/lib/utils";

export function OnlineToggle({ initial }: { initial: boolean }) {
  const router = useRouter();
  const [online, setOnline] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !online;
    setOnline(next);
    startTransition(async () => {
      const result = await toggleWorkerOnlineAction(next);
      if (!result.ok) {
        setOnline(!next);
        toast.error(result.error);
        return;
      }
      toast.success(next ? "You're online — new jobs will show up here." : "You're offline. No new job alerts.");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={online}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition",
        online
          ? "border-brand-600/25 bg-brand-50 text-brand-800"
          : "border-ink-200 bg-white text-ink-500 hover:text-ink-800",
      )}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Power className={cn("h-3.5 w-3.5", online ? "text-brand-600" : "text-ink-400")} />
      )}
      {online ? "Online" : "Offline"}
      <span
        className={cn(
          "relative inline-flex h-4 w-7 items-center rounded-full transition",
          online ? "bg-brand-600" : "bg-ink-300",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute h-3 w-3 rounded-full bg-white shadow transition-transform",
            online ? "translate-x-3.5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
