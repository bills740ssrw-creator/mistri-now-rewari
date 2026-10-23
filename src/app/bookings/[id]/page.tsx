import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  ImageIcon,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { requireProfile } from "@/lib/auth/session";
import { getData } from "@/lib/data";
import {
  canCustomerCancel,
  isActiveBooking,
  TIMELINE_INDEX,
  bookingProgress,
} from "@/lib/booking";
import type { BookingStatus } from "@/lib/types";
import { BRAND, STATUS_META } from "@/lib/constants";
import { formatDateTime, formatINR, formatTime } from "@/lib/format";
import { isDemoMode } from "@/lib/session";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";
import { BookingActions } from "@/components/customer/booking-actions";
import { OtpTicket } from "@/components/customer/otp-ticket";
import { LiveRefresher } from "@/components/live/live-refresher";
import { Avatar } from "@/components/ui/avatar";
import { StatusPill } from "@/components/ui/badge";
import { ServiceIcon } from "@/components/ui/service-icon";
import { buttonClasses } from "@/components/ui/button";
import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking details",
  robots: { index: false },
};

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await requireProfile(`/bookings/${id}`);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();

  const detail = await getData().getBookingDetail(id, { id: profile.id, role: profile.role });
  if (!detail) notFound();

  const { booking, service, worker, customer, items } = detail;
  const role = profile.role;
  const isCustomer = role === "customer" && booking.customerId === profile.id;
  const isWorker = role === "worker" && booking.workerId === profile.id;
  const backHref =
    role === "worker" ? "/worker/dashboard" : role === "admin" ? "/admin/dashboard" : "/account";
  const canCancel = isCustomer && canCustomerCancel(booking.status);
  const showOtp = !isWorker && isActiveBooking(booking.status);
  const warrantyUntil = booking.completedAt
    ? new Date(new Date(booking.completedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <LiveRefresher bookingId={booking.id} />
      <main className="flex-1">
        <section className="border-b border-ink-100 bg-white/60">
          <div className="container-page py-6 lg:py-8">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-500 transition hover:text-ink-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {role === "worker" ? "Worker dashboard" : role === "admin" ? "Admin orders" : "My bookings"}
            </Link>

            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={booking.status} />
                  <span className="font-mono text-[10.5px] tracking-wide text-ink-400">
                    {booking.code}
                  </span>
                  {isWorker ? <span className="text-[11px] text-ink-400">Assigned job</span> : null}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1",
                      CATEGORY_META[service.category].tint,
                      CATEGORY_META[service.category].ring,
                    )}
                  >
                    <ServiceIcon name={service.icon} className="h-5 w-5" />
                  </span>
                  <h1 className="font-display text-[27px] font-extrabold leading-tight tracking-[-0.035em] text-ink-950 sm:text-[34px]">
                    {service.title}
                  </h1>
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateTime(booking.scheduledTime)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {booking.address}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-4 lg:text-right">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                    Order total
                  </p>
                  <p className="font-display text-[30px] font-extrabold leading-none tracking-tight text-ink-950">
                    {formatINR(booking.totalAmount)}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-500 lg:justify-end">
                    <Wallet className="h-3 w-3" />
                    {booking.paymentMethod === "UPI" ? "UPI online" : "Pay after service"}
                    <span aria-hidden>·</span>
                    <span
                      className={cn(
                        "font-semibold",
                        booking.paymentStatus === "PAID" ? "text-brand-700" : "text-saffron-700",
                      )}
                    >
                      {booking.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {query.new ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-600/20 bg-brand-50/80 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-brand-900">Booking confirmed</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-brand-900/70">
                    We&apos;re assigning the nearest available professional. This page updates
                    automatically — keep it open or check back from My bookings.
                  </p>
                </div>
              </div>
            ) : null}

            <StatusStrip status={booking.status} />
          </div>
        </section>

        <div className="container-page grid gap-5 py-7 lg:grid-cols-[1.55fr_1fr] lg:py-9">
          <div className="space-y-5">
            {booking.status === "CANCELLED" ? (
              <section className="rounded-3xl border border-rose-200 bg-rose-50/60 p-5">
                <p className="flex items-center gap-2 text-[13px] font-bold text-rose-900">
                  <X className="h-4 w-4" /> Booking cancelled
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-rose-900/70">
                  {booking.cancelledReason ?? "This booking was cancelled."}
                  {booking.cancelledAt ? ` · ${formatDateTime(booking.cancelledAt)}` : ""}
                </p>
                <Link href="/services" className={buttonClasses("secondary", "sm", "mt-3")}>
                  Book again
                </Link>
              </section>
            ) : (
              <section className="rounded-3xl border border-ink-100 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                      Live progress
                    </p>
                    <h2 className="mt-1 font-display text-[20px] font-extrabold tracking-tight text-ink-950">
                      {STATUS_META[booking.status].customerLabel}
                    </h2>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
                    Auto-updating
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                    style={{ width: `${Math.max(8, bookingProgress(booking))}%` }}
                  />
                </div>

                <ol className="mt-5 space-y-0">
                  <TimelineStep
                    label="Booking confirmed"
                    copy={`Request received at ${formatTime(booking.createdAt)}`}
                    reached
                    current={booking.status === "PENDING"}
                    icon="check"
                  />
                  <TimelineStep
                    label="Professional assigned"
                    copy={
                      worker
                        ? `${worker.fullName} accepted this job`
                        : "Finding the closest available professional"
                    }
                    reached={Boolean(worker)}
                    current={booking.status === "ASSIGNED"}
                    icon="user"
                  />
                  <TimelineStep
                    label="On the way"
                    copy={
                      booking.status === "IN_PROGRESS"
                        ? "Reached your address and started the work"
                        : worker
                          ? "Your professional is travelling to you"
                          : "Waiting for assignment"
                    }
                    reached={TIMELINE_INDEX[booking.status] >= 2}
                    current={booking.status === "ON_THE_WAY" || booking.status === "IN_PROGRESS"}
                    icon="nav"
                  />
                  <TimelineStep
                    label="Job completed"
                    copy={
                      booking.completedAt
                        ? `Completed ${formatDateTime(booking.completedAt)}`
                        : "7-day warranty starts once work is verified"
                    }
                    reached={booking.status === "COMPLETED"}
                    current={false}
                    icon="sparkles"
                    last
                  />
                </ol>
              </section>
            )}

            {showOtp && (booking.startOtp || booking.endOtp) ? (
              <section className="rounded-3xl border border-ink-100 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-saffron-50 text-saffron-700">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-[17px] font-bold text-ink-950">
                      Your service OTPs
                    </h2>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">
                      Share these only with your assigned professional — never over a call from an
                      unknown number.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {booking.startOtp &&
                  (booking.status === "ASSIGNED" || booking.status === "ON_THE_WAY") ? (
                    <OtpTicket
                      label="Start OTP"
                      otp={booking.startOtp}
                      hint="Share when the professional arrives, before work begins."
                      tone="saffron"
                    />
                  ) : null}
                  {booking.endOtp && booking.status === "IN_PROGRESS" ? (
                    <OtpTicket
                      label="Completion OTP"
                      otp={booking.endOtp}
                      hint="Share only after the work is finished to your satisfaction."
                    />
                  ) : null}
                </div>
                {booking.startOtp && booking.status === "IN_PROGRESS" ? (
                  <p className="mt-3 text-[11.5px] text-ink-500">
                    Start verified. The completion OTP is shown when work is underway.
                  </p>
                ) : null}
              </section>
            ) : null}

            <section className="rounded-3xl border border-ink-100 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-[17px] font-bold text-ink-950">
                  {isWorker || role === "admin" ? "Customer" : "Your professional"}
                </h2>
                {isWorker || role === "admin" ? (
                  <span className="text-[11px] text-ink-400">Contact for this job</span>
                ) : null}
              </div>

              {worker ? (
                <PersonRow
                  name={worker.fullName}
                  phone={worker.phone}
                  rating={worker.rating}
                  jobs={worker.jobsCompleted}
                  subtitle={CATEGORY_META[worker.serviceCategory ?? "plumbing"].short}
                  avatarUrl={worker.avatarUrl}
                />
              ) : isCustomer ? (
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-cream-100/70 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-400">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink-800">
                      Assigning your professional
                    </p>
                    <p className="text-[11.5px] text-ink-500">
                      Usually takes under 10 minutes. We&apos;ll notify you the moment they accept.
                    </p>
                  </div>
                </div>
              ) : null}

              {isWorker || role === "admin" ? (
                <div className="mt-4 border-t border-dashed border-ink-100 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                    Customer
                  </p>
                  <PersonRow
                    name={customer.fullName}
                    phone={customer.phone}
                    subtitle={`Booking ${booking.code}`}
                    compact
                  />
                </div>
              ) : null}

              {booking.notes || booking.issueMedia.length > 0 ? (
                <div className="mt-4 space-y-4 border-t border-dashed border-ink-100 pt-4">
                  {booking.notes ? (
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                        <FileText className="h-3 w-3" /> Customer notes
                      </p>
                      <p className="mt-1.5 rounded-xl bg-cream-50 p-3 text-[12.5px] leading-relaxed text-ink-700">
                        {booking.notes}
                      </p>
                    </div>
                  ) : null}
                  {booking.issueMedia.length > 0 ? (
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                        <ImageIcon className="h-3 w-3" /> Photos
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {booking.issueMedia.map((media) => (
                          <a
                            key={media.url}
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-16 w-16 overflow-hidden rounded-xl border border-ink-200"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={media.url}
                              alt={media.name}
                              className="h-full w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-ink-100 bg-white p-5 sm:p-6">
              <h2 className="font-display text-[17px] font-bold text-ink-950">Bill details</h2>
              <dl className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-600">{service.title} (visit charge)</dt>
                  <dd className="font-semibold text-ink-900">{formatINR(booking.baseAmount)}</dd>
                </div>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <dt className="text-ink-600">
                      {item.name}
                      {item.quantity > 1 ? (
                        <span className="text-ink-400"> × {item.quantity}</span>
                      ) : null}
                    </dt>
                    <dd className="font-medium text-ink-800">
                      {formatINR(item.quantity * item.unitPrice)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-dashed border-ink-200 pt-3">
                  <dt className="font-semibold text-ink-900">Total</dt>
                  <dd className="font-display text-[19px] font-extrabold text-ink-950">
                    {formatINR(booking.totalAmount)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
                Spare parts are added only with your approval. Prices include GST where applicable.
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-ink-100 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                Actions
              </p>
              <div className="mt-3">
                <BookingActions
                  bookingId={booking.id}
                  code={booking.code}
                  amount={booking.totalAmount}
                  status={booking.status}
                  paymentMethod={booking.paymentMethod}
                  paymentStatus={booking.paymentStatus}
                  canCancel={canCancel}
                  upiId={BRAND.upiId}
                  demo={isDemoMode()}
                />
              </div>
              {booking.paymentMethod === "COD" &&
              booking.paymentStatus === "PENDING" &&
              booking.status === "COMPLETED" ? (
                <p className="mt-3 rounded-xl bg-saffron-50 p-3 text-[11.5px] leading-relaxed text-saffron-900/80">
                  Cash or UPI is collected by the technician after the job. Our team records it
                  against booking {booking.code}.
                </p>
              ) : null}
            </section>

            <section
              className={cn(
                "rounded-3xl border p-5",
                booking.status === "COMPLETED"
                  ? "border-brand-600/20 bg-brand-50/70"
                  : "border-ink-100 bg-white",
              )}
            >
              <p className="flex items-center gap-2 text-[12.5px] font-bold text-ink-900">
                <ShieldCheck className="h-4 w-4 text-brand-600" /> 7-day service warranty
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-500">
                {booking.status === "COMPLETED" && warrantyUntil
                  ? `Active until ${formatDateTime(warrantyUntil)}. If the same issue returns, call us and we'll fix it free.`
                  : "Starts as soon as your job is marked complete. Covers workmanship on the same issue."}
              </p>
            </section>

            <section className="rounded-3xl bg-ink-950 p-5 text-cream-50">
              <p className="flex items-center gap-2 text-[12.5px] font-bold">
                <Phone className="h-4 w-4 text-brand-300" /> Need help?
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-cream-200/60">
                Our Rewari support desk is open 7 AM – 9 PM, all days. Quote {booking.code}.
              </p>
              <a href={BRAND.phoneHref} className={buttonClasses("saffron", "sm", "mt-4 w-full")}>
                Call {BRAND.phoneDisplay}
              </a>
              <a
                href={`mailto:${BRAND.email}?subject=Booking%20${booking.code}`}
                className="mt-2 block text-center text-[11px] text-cream-200/60 underline underline-offset-4 hover:text-cream-50"
              >
                {BRAND.email}
              </a>
            </section>

            <section className="rounded-3xl border border-ink-100 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                Booking info
              </p>
              <dl className="mt-3 space-y-2.5 text-[12px]">
                <MetaRow label="Booking ID" value={booking.code} mono />
                <MetaRow label="Placed on" value={formatDateTime(booking.createdAt)} />
                <MetaRow
                  label="Payment"
                  value={
                    booking.paymentMethod === "UPI"
                      ? "UPI online"
                      : "Cash / UPI after service"
                  }
                />
                <MetaRow
                  label="Status"
                  value={booking.paymentStatus === "PAID" ? "Paid" : "Payment pending"}
                />
                <MetaRow label="Address" value={booking.address} />
              </dl>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

const STATUS_STRIP: Record<BookingStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-900",
  ASSIGNED: "border-sky-200 bg-sky-50 text-sky-900",
  ON_THE_WAY: "border-indigo-200 bg-indigo-50 text-indigo-900",
  IN_PROGRESS: "border-violet-200 bg-violet-50 text-violet-900",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-900",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-900",
};

function StatusStrip({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status];
  const isCancelled = status === "CANCELLED";
  return (
    <div
      className={cn(
        "mt-6 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        STATUS_STRIP[status],
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} />
        <div>
          <p className="text-[12.5px] font-bold">{meta.customerLabel}</p>
          <p className="mt-0.5 text-[11.5px] opacity-80">{meta.description}</p>
        </div>
      </div>
      {!isCancelled ? (
        <p className="flex items-center gap-1.5 text-[11px] font-medium opacity-70">
          <Clock3 className="h-3.5 w-3.5" />
          {status === "COMPLETED"
            ? "Warranty active"
            : "This page refreshes automatically"}
        </p>
      ) : null}
    </div>
  );
}

function TimelineStep({
  label,
  copy,
  reached,
  current,
  icon,
  last,
}: {
  label: string;
  copy: string;
  reached: boolean;
  current: boolean;
  icon: "check" | "user" | "nav" | "sparkles";
  last?: boolean;
}) {
  const Icon = icon === "check" ? Check : icon === "user" ? UserRound : icon === "nav" ? Navigation : Sparkles;
  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className={cn(
            "absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-px",
            reached ? "bg-brand-300" : "bg-ink-200",
          )}
        />
      ) : null}
      <span
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
          current
            ? "bg-brand-600 text-white shadow-[0_0_0_5px_rgba(21,159,114,0.14)]"
            : reached
              ? "bg-brand-100 text-brand-700"
              : "bg-ink-100 text-ink-400",
        )}
      >
        {reached && !current ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <p className={cn("text-[13px] font-semibold", current ? "text-ink-950" : "text-ink-700")}>
          {label}
        </p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-500">{copy}</p>
      </div>
    </li>
  );
}

function PersonRow({
  name,
  phone,
  rating,
  jobs,
  subtitle,
  avatarUrl,
  compact,
}: {
  name: string;
  phone: string;
  rating?: number;
  jobs?: number;
  subtitle?: string;
  avatarUrl?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", compact ? "mt-2" : "mt-3")}>
      <div className="flex min-w-0 items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/5"
          />
        ) : (
          <Avatar name={name} size="md" />
        )}
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-ink-900">
            {name}
            {rating !== undefined ? <BadgeCheck className="h-3.5 w-3.5 text-brand-600" /> : null}
          </p>
          <p className="flex items-center gap-1 truncate text-[11px] text-ink-500">
            {rating !== undefined ? (
              <>
                <Star className="h-3 w-3 fill-saffron-400 text-saffron-400" />
                {rating.toFixed(1)}
                {jobs !== undefined ? ` · ${jobs} jobs` : ""}
                {subtitle ? " · " : ""}
              </>
            ) : null}
            {subtitle ?? "Verified customer"}
          </p>
        </div>
      </div>
      <a
        href={`tel:+91${phone.replace(/\D/g, "").slice(-10)}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700"
        aria-label={`Call ${name}`}
      >
        <Phone className="h-4 w-4" />
      </a>
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-ink-400">{label}</dt>
      <dd
        className={cn(
          "max-w-[62%] text-right font-medium text-ink-800",
          mono ? "font-mono text-[11px]" : "",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
