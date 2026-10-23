"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Lock, QrCode, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import type { BookingStatus, PaymentMethod, PaymentStatus } from "@/lib/types";
import { upiPaymentUri } from "@/lib/booking";
import { formatINR } from "@/lib/format";
import { cancelBookingAction, markBookingPaidAction } from "@/lib/actions/bookings";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const CANCEL_REASONS = ["Plans changed", "Booked by mistake", "Professional is delayed", "Issue resolved myself"];

export function BookingActions({
  bookingId,
  code,
  amount,
  status,
  paymentMethod,
  paymentStatus,
  canCancel,
  upiId,
  demo,
}: {
  bookingId: string;
  code: string;
  amount: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  canCancel: boolean;
  upiId: string;
  demo: boolean;
}) {
  const router = useRouter();
  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const upiUri = upiPaymentUri(amount, code, upiId);
  const showPay = paymentMethod === "UPI" && paymentStatus === "PENDING" && status !== "CANCELLED";

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
      if (label === "UPI ID") {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } else {
        setCopiedCode(true);
        window.setTimeout(() => setCopiedCode(false), 1600);
      }
    } catch {
      toast.error("Could not copy — please type it manually.");
    }
  }

  async function markPaid() {
    setPending(true);
    try {
      const result = await markBookingPaidAction(bookingId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Payment recorded. Thank you!");
      setPayOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function cancelBooking() {
    setPending(true);
    try {
      const result = await cancelBookingAction({ bookingId, reason });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Booking cancelled.");
      setCancelOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {showPay ? (
          <Button variant="brand" size="md" onClick={() => setPayOpen(true)}>
            <Smartphone className="h-4 w-4" /> Pay {formatINR(amount)}
          </Button>
        ) : null}
        <Button
          variant="secondary"
          size="md"
          onClick={() => copy(code, "Booking ID")}
          className="text-ink-700"
        >
          {copiedCode ? <Check className="h-4 w-4 text-brand-600" /> : <Copy className="h-4 w-4" />}
          {copiedCode ? "Copied" : "Copy ID"}
        </Button>
        {canCancel ? (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <X className="h-4 w-4" /> Cancel booking
          </button>
        ) : null}
      </div>

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Pay with UPI"
        description={`${formatINR(amount)} · Booking ${code}`}
        size="sm"
      >
        <div className="flex flex-col items-center">
          <div className="rounded-3xl border border-ink-100 bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={upiUri}
              size={190}
              bgColor="#ffffff"
              fgColor="#0a1611"
              level="M"
              marginSize={1}
              title={`UPI payment QR for ${code}`}
            />
          </div>
          <p className="mt-3 text-center text-[12px] text-ink-500">
            Scan with GPay, PhonePe, Paytm or any UPI app
          </p>

          <div className="mt-5 w-full rounded-2xl border border-ink-100 bg-cream-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
              UPI ID
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="truncate font-mono text-[13px] font-semibold text-ink-900">
                {upiId}
              </span>
              <button
                type="button"
                onClick={() => copy(upiId, "UPI ID")}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-600 ring-1 ring-ink-200"
              >
                {copied ? <Check className="h-3 w-3 text-brand-600" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <a
            href={upiUri}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 bg-white py-2.5 text-[12.5px] font-semibold text-ink-800 transition hover:border-ink-300 sm:hidden"
          >
            <Smartphone className="h-4 w-4" /> Open UPI app
          </a>

          <Button
            variant="brand"
            size="md"
            className="mt-5 w-full"
            onClick={markPaid}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" /> I&apos;ve completed the payment
              </>
            )}
          </Button>

          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-400">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" />
            {demo
              ? "Demo mode: the payment is recorded instantly without a real UPI transfer."
              : "The operations team verifies UPI references. Your booking will show Paid once confirmed."}
          </p>
        </div>
      </Modal>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this booking?"
        description="No fee applies before the professional starts work."
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {CANCEL_REASONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setReason(item)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition",
                  reason === item
                    ? "border-ink-900 bg-ink-900 text-cream-50"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 200))}
            placeholder="Anything we should know? (optional)"
            className="min-h-[76px]"
          />
          <div className="flex gap-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setCancelOpen(false)}>
              Keep booking
            </Button>
            <Button variant="danger" size="md" className="flex-1" onClick={cancelBooking} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Cancel booking
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
