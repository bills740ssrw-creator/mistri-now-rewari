"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Lock,
  MapPin,
  Navigation,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { IssueMedia, PaymentMethod, Service } from "@/lib/types";
import { CATEGORY_META } from "@/lib/constants";
import { addDaysKey, buildSlotIso, nextDays, slotsForDate } from "@/lib/booking";
import { formatINR, istDateKey } from "@/lib/format";
import { createBookingAction, uploadIssueMediaAction } from "@/lib/actions/bookings";
import { compressImageFile } from "@/lib/client/image";
import { Modal } from "@/components/ui/modal";
import { Field, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/service-icon";
import { cn } from "@/lib/utils";

const AREA_HINTS = ["Model Town", "Sector 4", "Circular Road", "New Colony"];

const STEPS = ["Your issue", "Pick a slot", "Payment"] as const;

export function BookingDialog({
  service,
  open,
  onClose,
}: {
  service: Service;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [media, setMedia] = useState<IssueMedia[]>([]);
  const [uploading, setUploading] = useState(0);
  const [date, setDate] = useState(() => {
    const today = istDateKey();
    return slotsForDate(today).length > 0 ? today : addDaysKey(today, 1);
  });
  const [slot, setSlot] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const days = useMemo(() => nextDays(7), []);
  const slots = useMemo(() => slotsForDate(date), [date]);

  const addressValid = address.trim().length >= 10;
  const canContinue = step === 0 ? addressValid : step === 1 ? Boolean(date && slot) : true;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = 3 - media.length;
    if (room <= 0) {
      toast.error("You can attach up to 3 photos.");
      return;
    }
    const picked = Array.from(files).slice(0, room);
    setUploading((count) => count + picked.length);
    for (const file of picked) {
      try {
        const dataUrl = await compressImageFile(file, { maxDim: 1200, quality: 0.72 });
        const result = await uploadIssueMediaAction({ dataUrl, name: file.name });
        if (!result.ok) {
          toast.error(result.error);
        } else if (result.data) {
          setMedia((current) =>
            current.length >= 3
              ? current
              : [...current, { name: file.name, type: "image/jpeg", url: result.data!.url }],
          );
        }
      } catch (uploadError) {
        toast.error(
          uploadError instanceof Error ? uploadError.message : "Could not attach that photo.",
        );
      } finally {
        setUploading((count) => Math.max(0, count - 1));
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function confirmBooking() {
    if (!slot || !date) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await createBookingAction({
        serviceId: service.id,
        address: address.trim(),
        date,
        slot,
        paymentMethod: payment,
        notes: notes.trim() || undefined,
        issueMedia: media,
      });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Booking confirmed. Finding your professional…");
      onClose();
      router.push(`/bookings/${result.data!.id}?new=1`);
    } catch {
      setError("Something went wrong while booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedDay = days.find((day) => day.key === date);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ring-1",
              CATEGORY_META[service.category].tint,
              CATEGORY_META[service.category].ring,
            )}
          >
            <ServiceIcon name={service.icon} className="h-5 w-5" />
          </span>
          {service.title}
        </span>
      }
      description={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-semibold text-ink-800">{formatINR(service.price)} fixed</span>
          <span aria-hidden>·</span>
          <span>about {service.durationMins} min</span>
          <span aria-hidden>·</span>
          <span>7-day warranty</span>
        </span>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11.5px] leading-snug text-ink-500">
            {step === 2 ? (
              <span className="font-semibold text-ink-800">
                Total {formatINR(service.price)}
                <span className="ml-1 font-normal text-ink-500">· parts extra with approval</span>
              </span>
            ) : (
              <span className="hidden items-center gap-1.5 sm:flex">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                Aadhaar-verified professionals only
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setError(null);
                  setStep((s) => s - 1);
                }}
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : null}
            {step < 2 ? (
              <Button
                variant="brand"
                size="md"
                disabled={!canContinue}
                onClick={() => {
                  setError(null);
                  setStep((s) => s + 1);
                }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="brand" size="md" onClick={confirmBooking} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Booking…
                  </>
                ) : (
                  <>
                    Confirm booking <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <ol className="mb-6 flex items-center gap-2" aria-label="Booking steps">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition",
                index < step
                  ? "bg-brand-600 text-white"
                  : index === step
                    ? "bg-ink-950 text-cream-50"
                    : "bg-ink-100 text-ink-400",
              )}
            >
              {index < step ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden text-[11.5px] font-semibold sm:block",
                index === step ? "text-ink-900" : "text-ink-400",
              )}
            >
              {label}
            </span>
            {index < STEPS.length - 1 ? (
              <span
                className={cn(
                  "h-px flex-1 transition-colors",
                  index < step ? "bg-brand-400" : "bg-ink-200",
                )}
              />
            ) : null}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-5">
          <Field
            label="Service address"
            htmlFor="booking-address"
            hint="Flat / house number, street and area — the professional needs to find you."
            error={address.length > 0 && !addressValid ? "Add at least 10 characters." : null}
          >
            <Textarea
              id="booking-address"
              value={address}
              onChange={(event) => setAddress(event.target.value.slice(0, 240))}
              placeholder="e.g. 24, Model Town, near Jain Chowk, Rewari"
              className="min-h-[88px]"
              autoComplete="street-address"
            />
          </Field>

          <div className="flex flex-wrap gap-1.5">
            {AREA_HINTS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() =>
                  setAddress((current) =>
                    current.trim().length === 0
                      ? `${area}, Rewari`
                      : current.includes(area)
                        ? current
                        : `${current.replace(/,\s*$/, "")}, ${area}, Rewari`,
                  )
                }
                className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                <MapPin className="h-3 w-3" /> {area}
              </button>
            ))}
          </div>

          <Field
            label="What's the problem?"
            htmlFor="booking-notes"
            optional
            hint="A line about the issue helps the professional come prepared."
          >
            <Textarea
              id="booking-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value.slice(0, 400))}
              placeholder="e.g. AC is running but not cooling. Indoor unit makes a rattling sound."
              className="min-h-[76px]"
            />
          </Field>

          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-semibold text-ink-800">Add photos</p>
              <span className="text-[11px] text-ink-400">{media.length}/3 · optional</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {media.map((item) => (
                <div
                  key={item.url}
                  className="group relative h-20 w-20 overflow-hidden rounded-2xl border border-ink-200 bg-cream-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMedia((current) => current.filter((m) => m.url !== item.url))}
                    aria-label={`Remove ${item.name}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-950/80 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {media.length + uploading < 3 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-300 bg-white text-ink-500 transition hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-700"
                >
                  {uploading > 0 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <span className="text-[10px] font-medium">
                    {uploading > 0 ? "Uploading" : "Add photo"}
                  </span>
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => void handleFiles(event.target.files)}
            />
            <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-400">
              <ImagePlus className="h-3 w-3" />
              Photos are compressed on your phone and stay private to your booking.
            </p>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-6">
          <div>
            <p className="text-[13px] font-semibold text-ink-800">Choose a day</p>
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {days.map((day) => {
                const available = slotsForDate(day.key).length > 0;
                const active = day.key === date;
                return (
                  <button
                    key={day.key}
                    type="button"
                    disabled={!available}
                    onClick={() => {
                      setError(null);
                      setDate(day.key);
                      setSlot("");
                    }}
                    className={cn(
                      "rounded-2xl border px-1 py-2.5 text-center transition",
                      active
                        ? "border-ink-950 bg-ink-950 text-cream-50 shadow-sm"
                        : available
                          ? "border-ink-200 bg-white text-ink-700 hover:border-brand-300"
                          : "cursor-not-allowed border-ink-100 bg-cream-100/60 text-ink-300",
                    )}
                  >
                    <span className="block text-[10px] uppercase tracking-wide opacity-70">
                      {day.weekday}
                    </span>
                    <span className="mt-0.5 block text-[13px] font-bold">{day.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-semibold text-ink-800">Pick a one-hour window</p>
              <span className="flex items-center gap-1 text-[11px] text-ink-400">
                <CalendarDays className="h-3 w-3" />
                {selectedDay ? `${selectedDay.weekday} · ${selectedDay.label}` : "Today"}
              </span>
            </div>
            {slots.length === 0 ? (
              <div className="mt-2 rounded-2xl border border-ink-100 bg-white p-4 text-[12.5px] text-ink-500">
                No slots left for this day. Please choose another date — our technicians work 7 AM to
                9 PM.
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSlot(item.value);
                    }}
                    className={cn(
                      "rounded-xl border px-2 py-2.5 text-[12.5px] font-semibold transition",
                      slot === item.value
                        ? "border-brand-600 bg-brand-600 text-white shadow-[0_8px_20px_-10px_rgba(10,128,91,0.8)]"
                        : "border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-400">
              <Navigation className="h-3 w-3" />
              Arrival window is one hour. You can track the technician live.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-600/15 bg-brand-50/60 p-4">
            <p className="flex items-center gap-2 text-[12px] font-semibold text-brand-800">
              <Sparkles className="h-4 w-4" /> What happens next
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-brand-900/70">
              We ask the nearest verified professional to accept. You&apos;ll see their name, rating
              and phone number on the booking page, plus a start OTP to share when work begins.
            </p>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-ink-800">How would you like to pay?</p>
            <PaymentOption
              active={payment === "COD"}
              onClick={() => {
                setError(null);
                setPayment("COD");
              }}
              icon={<Wallet className="h-5 w-5" />}
              title="Pay after service"
              subtitle="Cash or UPI directly to the technician once the job is done."
              tag="Recommended"
            />
            <PaymentOption
              active={payment === "UPI"}
              onClick={() => {
                setError(null);
                setPayment("UPI");
              }}
              icon={<Smartphone className="h-5 w-5" />}
              title="Pay online with UPI"
              subtitle="Scan a UPI QR on the booking page. Card and netbanking also supported."
            />
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
              Booking summary
            </p>
            <dl className="mt-3 space-y-2 text-[13px]">
              <SummaryRow label="Service" value={service.title} />
              <SummaryRow
                label="When"
                value={
                  selectedDay && slot
                    ? `${selectedDay.label}, ${slots.find((s) => s.value === slot)?.label ?? ""}`
                    : "—"
                }
              />
              <SummaryRow
                label="Where"
                value={address.trim() ? address.trim() : "—"}
                truncate
              />
              <div className="border-t border-dashed border-ink-200 pt-2">
                <div className="flex items-center justify-between">
                  <dt className="font-semibold text-ink-900">Payable now</dt>
                  <dd className="font-display text-lg font-extrabold text-ink-950">
                    {payment === "UPI" ? formatINR(service.price) : "₹0"}
                  </dd>
                </div>
                <p className="mt-0.5 text-right text-[11px] text-ink-400">
                  {payment === "UPI"
                    ? "Pay on the next screen via UPI"
                    : `${formatINR(service.price)} due after service`}
                </p>
              </div>
            </dl>
          </div>

          <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-500">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
            No advance payment is needed. Spare parts, if required, are added only after you approve
            them, and every job carries a 7-day workmanship warranty.
          </p>

          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
  tag,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition",
        active
          ? "border-brand-600 bg-brand-50/60 shadow-[0_0_0_3px_rgba(21,159,114,0.1)]"
          : "border-ink-200 bg-white hover:border-ink-300",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          active ? "bg-brand-600 text-white" : "bg-cream-100 text-ink-500",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[13.5px] font-semibold text-ink-900">{title}</span>
          {tag ? (
            <span className="rounded-full bg-saffron-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-saffron-800">
              {tag}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-500">{subtitle}</span>
      </span>
      <span
        className={cn(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300",
        )}
      >
        {active ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

function SummaryRow({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-ink-500">{label}</dt>
      <dd
        className={cn(
          "text-right font-medium text-ink-900",
          truncate ? "line-clamp-2 max-w-[65%]" : "",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function buildBookingTime(date: string, slot: string) {
  return buildSlotIso(date, slot);
}
