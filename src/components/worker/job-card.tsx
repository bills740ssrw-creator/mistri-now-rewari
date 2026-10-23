"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  KeyRound,
  Loader2,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Plus,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { BookingDetail } from "@/lib/types";
import { CATEGORY_META } from "@/lib/constants";
import { formatDateTime, formatINR } from "@/lib/format";
import {
  addSparePartAction,
  startTravelAction,
  verifyJobOtpAction,
} from "@/lib/actions/bookings";
import { StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/service-icon";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export function WorkerJobCard({ detail }: { detail: BookingDetail }) {
  const router = useRouter();
  const { booking, service, customer, items } = detail;
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState("");
  const [partsOpen, setPartsOpen] = useState(false);
  const [partName, setPartName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [partError, setPartError] = useState<string | null>(null);

  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`;

  async function travel() {
    setPending(true);
    try {
      const result = await startTravelAction(booking.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Customer notified — you're on the way.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function verify(kind: "start" | "end") {
    setPending(true);
    try {
      const result = await verifyJobOtpAction({ bookingId: booking.id, kind, code });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        kind === "start" ? "Work started. Good luck!" : "Job completed — added to your earnings.",
      );
      setCode("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function addPart() {
    const qty = Number(quantity);
    const price = Number(unitPrice);
    if (partName.trim().length < 2) {
      setPartError("Enter the part name.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setPartError("Enter a valid price.");
      return;
    }
    setPending(true);
    setPartError(null);
    try {
      const result = await addSparePartAction({
        bookingId: booking.id,
        name: partName.trim(),
        quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
        unitPrice: price,
      });
      if (!result.ok) {
        setPartError(result.error);
        return;
      }
      toast.success("Part added to the bill.");
      setPartsOpen(false);
      setPartName("");
      setQuantity("1");
      setUnitPrice("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <article className="overflow-hidden rounded-3xl border border-ink-100 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-cream-50/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <StatusPill status={booking.status} />
            <span className="font-mono text-[10px] text-ink-400">{booking.code}</span>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-ink-500">
            <CalendarDays className="h-3 w-3" /> {formatDateTime(booking.scheduledTime)}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1",
                  CATEGORY_META[service.category].tint,
                  CATEGORY_META[service.category].ring,
                )}
              >
                <ServiceIcon name={service.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-[17px] font-bold leading-tight text-ink-950">
                  {service.title}
                </h3>
                <p className="mt-0.5 text-[11.5px] text-ink-500">
                  {service.durationMins} min · {customer.fullName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-[18px] font-extrabold text-ink-950">
                {formatINR(booking.totalAmount)}
              </p>
              <p className="text-[10px] text-ink-400">
                {booking.paymentMethod === "COD" ? "Collect after job" : "Prepaid UPI"}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 rounded-2xl bg-cream-50 p-3.5 text-[12px]">
            <p className="flex items-start gap-2 text-ink-700">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
              {booking.address}
            </p>
            {booking.notes ? (
              <p className="flex items-start gap-2 text-ink-500">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {booking.notes}
              </p>
            ) : null}
          </div>

          {booking.issueMedia.length > 0 ? (
            <div className="mt-3 flex gap-2">
              {booking.issueMedia.map((media) => (
                <a
                  key={media.url}
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 w-14 overflow-hidden rounded-xl border border-ink-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={media.url} alt={media.name} className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-ink-200 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-400">
                <Receipt className="h-3 w-3" /> Parts on bill
              </p>
              <ul className="mt-1.5 space-y-1">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between text-[11.5px]">
                    <span className="text-ink-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-ink-800">
                      {formatINR(item.quantity * item.unitPrice)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {booking.status === "ASSIGNED" ? (
            <div className="mt-4">
              <Button variant="brand" size="md" className="w-full" onClick={travel} disabled={pending}>
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                Start travelling
              </Button>
              <p className="mt-2 text-center text-[11px] text-ink-400">
                The customer is notified and can track you.
              </p>
            </div>
          ) : null}

          {booking.status === "ON_THE_WAY" ? (
            <div className="mt-4 rounded-2xl border border-saffron-200 bg-saffron-50/60 p-3.5">
              <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-saffron-900">
                <KeyRound className="h-3.5 w-3.5" /> Ask the customer for the start OTP
              </p>
              <div className="mt-2 flex gap-2">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="4-digit code"
                  className="h-11 flex-1 text-center font-mono tracking-[0.3em]"
                  aria-label="Start OTP"
                />
                <Button
                  variant="brand"
                  size="md"
                  onClick={() => verify("start")}
                  disabled={pending || code.length < 4}
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Start work
                </Button>
              </div>
              <p className="mt-1.5 text-[10.5px] text-saffron-900/60">
                Only start once you are at the address and the customer shares the code.
              </p>
            </div>
          ) : null}

          {booking.status === "IN_PROGRESS" ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-brand-600/15 bg-brand-50/60 p-3.5">
                <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-brand-900">
                  <ShieldCheck className="h-3.5 w-3.5" /> Completion OTP
                </p>
                <div className="mt-2 flex gap-2">
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="4-digit code"
                    className="h-11 flex-1 text-center font-mono tracking-[0.3em]"
                    aria-label="Completion OTP"
                  />
                  <Button
                    variant="brand"
                    size="md"
                    onClick={() => verify("end")}
                    disabled={pending || code.length < 4}
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Complete
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPartsOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-ink-200 bg-white px-4 py-3 text-left transition hover:border-brand-300"
              >
                <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-800">
                  <Plus className="h-4 w-4 text-brand-600" /> Add a spare part
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-ink-400" />
              </button>
              <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-400">
                <Wallet className="mt-0.5 h-3 w-3 shrink-0" />
                {booking.paymentMethod === "COD"
                  ? `Collect ${formatINR(booking.totalAmount)} in cash or UPI after completing the job.`
                  : "This booking is prepaid — do not collect payment."}
              </p>
            </div>
          ) : null}

          {booking.status === "COMPLETED" ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-50 p-3 text-[12px] font-medium text-brand-800">
              <Check className="h-4 w-4" /> Completed. Payment recorded as{" "}
              {booking.paymentStatus === "PAID" ? "paid" : "pending"}.
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-dashed border-ink-100 pt-3">
            <Link
              href={`/bookings/${booking.id}`}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink-600 hover:text-ink-900"
            >
              Full details <ArrowUpRight className="h-3 w-3" />
            </Link>
            <div className="flex gap-2">
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
                aria-label="Open address in Google Maps"
              >
                <MapPin className="h-4 w-4" />
              </a>
              <a
                href={`tel:+91${customer.phone.slice(-10)}`}
                className="flex h-9 items-center gap-1.5 rounded-full bg-ink-950 px-3.5 text-[11.5px] font-semibold text-cream-50 transition hover:bg-ink-800"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            </div>
          </div>
        </div>
      </article>

      <Modal
        open={partsOpen}
        onClose={() => setPartsOpen(false)}
        title="Add a spare part"
        description="The customer sees this instantly on their bill."
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setPartsOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" size="md" className="flex-1" onClick={addPart} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add to bill
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Part or material" htmlFor="part-name">
            <Input
              id="part-name"
              value={partName}
              onChange={(event) => setPartName(event.target.value.slice(0, 80))}
              placeholder="e.g. Copper pipe 1/4 inch"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity" htmlFor="part-qty">
              <Input
                id="part-qty"
                inputMode="numeric"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value.replace(/\D/g, "").slice(0, 3))}
              />
            </Field>
            <Field label="Unit price (₹)" htmlFor="part-price">
              <Input
                id="part-price"
                inputMode="decimal"
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value.replace(/[^\d.]/g, ""))}
                placeholder="350"
              />
            </Field>
          </div>
          {partError ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700" role="alert">
              {partError}
            </p>
          ) : null}
          <p className="text-[11px] leading-relaxed text-ink-400">
            Only charge for parts actually used. The customer can dispute a bill with support, and
            repeat issues are covered under the 7-day warranty.
          </p>
        </div>
      </Modal>
    </>
  );
}
