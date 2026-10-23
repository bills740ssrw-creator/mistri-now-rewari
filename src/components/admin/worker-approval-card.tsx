"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Check, Clock3, FileWarning, Loader2, Phone, X } from "lucide-react";
import { toast } from "sonner";
import type { Profile, WorkerDocument } from "@/lib/types";
import type { WorkerApprovalItem } from "@/lib/data/adapter";
import { CATEGORY_META } from "@/lib/constants";
import { formatDateTime, formatRelative } from "@/lib/format";
import { reviewWorkerAction } from "@/lib/actions/admin";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Textarea } from "@/components/ui/form";

export function WorkerApprovalCard({ item }: { item: WorkerApprovalItem }) {
  const router = useRouter();
  const worker = item.worker as Profile;
  const document = item.document as WorkerDocument | null;
  const [viewerOpen, setViewerOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<"APPROVE" | "REJECT" | null>(null);

  async function decide(decision: "APPROVE" | "REJECT") {
    setPending(decision);
    try {
      const result = await reviewWorkerAction({ workerId: worker.id, decision, reason });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        decision === "APPROVE"
          ? `${worker.fullName} is now live and can accept jobs.`
          : "Application rejected. The worker can contact support to reapply.",
      );
      setRejectOpen(false);
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <article className="rounded-3xl border border-ink-100 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar name={worker.fullName} size="md" />
            <div>
              <p className="flex items-center gap-1.5 text-[14px] font-bold text-ink-950">
                {worker.fullName}
                <BadgeCheck className="h-3.5 w-3.5 text-saffron-500" />
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-ink-500">
                <span>+91 {worker.phone}</span>
                <span aria-hidden>·</span>
                <span>{worker.serviceCategory ? CATEGORY_META[worker.serviceCategory].short : "Trade not set"}</span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-[10.5px] text-ink-400">
                <Clock3 className="h-3 w-3" /> Applied {formatRelative(worker.createdAt)}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-saffron-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-saffron-800 ring-1 ring-saffron-300">
            Pending review
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <DocThumb
            label="Aadhaar front"
            url={document?.aadhaarFrontUrl}
            onClick={() => setViewerOpen(true)}
          />
          <DocThumb
            label="Aadhaar back"
            url={document?.aadhaarBackUrl}
            onClick={() => setViewerOpen(true)}
          />
        </div>

        {!document ? (
          <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-[11.5px] font-medium text-rose-700">
            <FileWarning className="h-3.5 w-3.5" /> No documents found for this application.
          </p>
        ) : null}

        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="brand"
            size="sm"
            className="flex-1"
            onClick={() => decide("APPROVE")}
            disabled={pending !== null}
          >
            {pending === "APPROVE" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Approve
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
            onClick={() => setRejectOpen(true)}
            disabled={pending !== null}
          >
            <X className="h-3.5 w-3.5" /> Reject
          </Button>
          <a
            href={`tel:+91${worker.phone.slice(-10)}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
            aria-label={`Call ${worker.fullName}`}
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        </div>
      </article>

      <Modal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={`Aadhaar — ${worker.fullName}`}
        description="Private documents. Do not download or share."
        size="lg"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {document ? (
            <>
              <DocPanel label="Front side" url={document.aadhaarFrontUrl} />
              <DocPanel label="Back side" url={document.aadhaarBackUrl} />
            </>
          ) : (
            <p className="text-[12.5px] text-ink-500">No documents uploaded.</p>
          )}
        </div>
        <p className="mt-3 text-[11px] text-ink-400">
          Verify the name, photo and Aadhaar number match the application before approving. Captured{" "}
          {document ? formatDateTime(document.createdAt) : "—"}.
        </p>
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject this application?"
        description="The worker sees this reason when they contact support."
        size="sm"
      >
        <div className="space-y-4">
          <Field label="Reason" htmlFor="reject-reason" hint="At least 5 characters.">
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 300))}
              placeholder="e.g. Aadhaar photo is blurred and the number is unreadable."
              className="min-h-[92px]"
            />
          </Field>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setRejectOpen(false)}>
              Keep pending
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              onClick={() => decide("REJECT")}
              disabled={pending !== null || reason.trim().length < 5}
            >
              {pending === "REJECT" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function DocThumb({
  label,
  url,
  onClick,
}: {
  label: string;
  url?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-24 overflow-hidden rounded-2xl border border-ink-200 bg-cream-100 text-left"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full items-center justify-center text-[11px] text-ink-400">
          Not uploaded
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent px-2 pb-1.5 pt-4 text-[10px] font-semibold text-cream-50">
        {label}
      </span>
    </button>
  );
}

function DocPanel({ label, url }: { label: string; url: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-cream-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="h-auto w-full object-contain" />
      <p className="border-t border-ink-200 bg-white px-3 py-2 text-[11px] font-semibold text-ink-600">
        {label}
      </p>
    </div>
  );
}
