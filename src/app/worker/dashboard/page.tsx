import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Check,
  Clock3,
  IndianRupee,
  Phone,
  ShieldCheck,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { requireWorker } from "@/lib/auth/session";
import { getData } from "@/lib/data";
import { isActiveBooking } from "@/lib/booking";
import { BRAND, CATEGORY_META } from "@/lib/constants";
import { formatDateTime, formatDayLabel, formatINR, istDateKey } from "@/lib/format";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";
import { OnlineToggle } from "@/components/worker/online-toggle";
import { OpenJobs } from "@/components/worker/open-jobs";
import { WorkerJobCard } from "@/components/worker/job-card";
import { WorkerRefresh } from "@/components/worker/worker-refresh";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Worker dashboard",
  robots: { index: false },
};

export default async function WorkerDashboardPage() {
  const profile = await requireWorker();

  if (profile.status !== "ACTIVE") {
    return <WorkerHolding profileStatus={profile.status} submittedAt={profile.createdAt} />;
  }

  const [bookings, openJobs, earnings] = await Promise.all([
    getData().listWorkerBookings(profile.id),
    profile.isOnline ? getData().listOpenJobs(profile.serviceCategory) : Promise.resolve([]),
    getData().workerEarnings(profile.id),
  ]);

  const active = bookings
    .filter((item) => isActiveBooking(item.booking.status))
    .sort((a, b) => a.booking.scheduledTime.localeCompare(b.booking.scheduledTime));
  const todayKey = istDateKey();
  const todayJobs = active.filter((item) => istDateKey(item.booking.scheduledTime) === todayKey);
  const recent = bookings.filter((item) => item.booking.status === "COMPLETED").slice(0, 6);
  const summary = earnings.summary;
  const maxDaily = Math.max(...summary.daily.map((day) => day.amount), 1);
  const categoryLabel = profile.serviceCategory
    ? CATEGORY_META[profile.serviceCategory].short
    : "Professional";

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <WorkerRefresh />
      <main className="flex-1">
        <section className="border-b border-ink-100 bg-white/60">
          <div className="container-page py-7 lg:py-9">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={profile.fullName} size="lg" online={profile.isOnline} />
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                    {categoryLabel}
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[9.5px] font-bold text-brand-700">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </span>
                  </p>
                  <h1 className="mt-0.5 font-display text-[26px] font-extrabold tracking-[-0.03em] text-ink-950 sm:text-[32px]">
                    Namaste, {profile.fullName.split(" ")[0]}.
                  </h1>
                  <p className="mt-1 flex items-center gap-2 text-[12px] text-ink-500">
                    <span className="flex items-center gap-0.5 text-saffron-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="font-semibold text-ink-800">{profile.rating.toFixed(1)}</span>
                    </span>
                    <span aria-hidden>·</span>
                    <span>{profile.jobsCompleted} jobs completed</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <OnlineToggle initial={profile.isOnline} />
                <a href={BRAND.phoneHref} className={buttonClasses("secondary", "sm")}>
                  <Phone className="h-3.5 w-3.5 text-brand-700" /> Support
                </a>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                icon={IndianRupee}
                label="Today's earnings"
                value={formatINR(summary.today)}
                tone="bg-brand-50 text-brand-700"
              />
              <StatCard
                icon={TrendingUp}
                label="This week"
                value={formatINR(summary.week)}
                tone="bg-sky-50 text-sky-700"
              />
              <StatCard
                icon={Briefcase}
                label="Completed jobs"
                value={String(summary.completedJobs)}
                tone="bg-saffron-50 text-saffron-700"
              />
              <StatCard
                icon={CalendarDays}
                label="Active today"
                value={String(todayJobs.length)}
                tone="bg-violet-50 text-violet-700"
              />
            </div>
          </div>
        </section>

        <div className="container-page grid gap-5 py-7 lg:grid-cols-[1.6fr_1fr] lg:py-9">
          <div className="space-y-5">
            {profile.isOnline ? (
              <OpenJobs jobs={openJobs} />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink-100 bg-white p-5">
                <div>
                  <p className="text-[13px] font-bold text-ink-900">You&apos;re currently offline</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-500">
                    Go online to see new job alerts in your trade.
                  </p>
                </div>
                <OnlineToggle initial={false} />
              </div>
            )}

            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-[20px] font-extrabold tracking-tight text-ink-950">
                    Active jobs
                  </h2>
                  <p className="mt-0.5 text-[12px] text-ink-500">
                    Accept, travel, verify OTPs and close the bill.
                  </p>
                </div>
                <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[10.5px] font-bold text-cream-50">
                  {active.length}
                </span>
              </div>

              {active.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-ink-200 bg-white/70 px-6 py-12 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-100 text-ink-400">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-display text-[17px] font-bold text-ink-900">
                    No active jobs right now
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-ink-500">
                    {profile.isOnline
                      ? "Stay online — new jobs in your trade appear above the moment a customer books."
                      : "Go online to start receiving jobs."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {active.map((detail) => (
                    <WorkerJobCard key={detail.booking.id} detail={detail} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-ink-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                    Earnings
                  </p>
                  <p className="mt-1 font-display text-[26px] font-extrabold leading-none text-ink-950">
                    {formatINR(summary.week)}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-500">Last 7 days</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-5 flex h-28 items-end gap-2">
                {summary.daily.map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-full w-full items-end">
                      <div
                        className={cn(
                          "w-full rounded-t-md transition-all",
                          day.amount > 0 ? "bg-brand-500/80" : "bg-ink-100",
                        )}
                        style={{ height: `${Math.max(6, (day.amount / maxDaily) * 100)}%` }}
                        title={`${day.label}: ${formatINR(day.amount)}`}
                      />
                    </div>
                    <span className="text-[9px] text-ink-400">{formatDayLabel(day.date)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-dashed border-ink-100 pt-3 text-[11px]">
                <div>
                  <p className="text-ink-400">Avg. ticket</p>
                  <p className="mt-0.5 font-semibold text-ink-900">{formatINR(summary.averageTicket)}</p>
                </div>
                <div>
                  <p className="text-ink-400">Lifetime</p>
                  <p className="mt-0.5 font-semibold text-ink-900">{formatINR(summary.lifetime)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-ink-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[16px] font-bold text-ink-950">Recent payouts</h2>
                <Wallet className="h-4 w-4 text-ink-300" />
              </div>
              {recent.length === 0 ? (
                <p className="mt-3 text-[12px] text-ink-500">Completed jobs will appear here.</p>
              ) : (
                <ul className="mt-3 divide-y divide-ink-100">
                  {recent.map((detail) => (
                    <li key={detail.booking.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-ink-800">
                          {detail.service.title}
                        </p>
                        <p className="text-[10px] text-ink-400">
                          {detail.booking.completedAt
                            ? formatDateTime(detail.booking.completedAt)
                            : detail.booking.code}
                        </p>
                      </div>
                      <span className="shrink-0 text-[12px] font-bold text-ink-900">
                        {formatINR(detail.booking.totalAmount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-3xl bg-ink-950 p-5 text-cream-50">
              <p className="flex items-center gap-2 text-[12.5px] font-bold">
                <ShieldCheck className="h-4 w-4 text-brand-300" /> Worker code of conduct
              </p>
              <ul className="mt-3 space-y-2 text-[11.5px] text-cream-200/65">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-brand-300" /> Quote parts before fitting
                  them.
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-brand-300" /> Never ask for the OTP over
                  the phone.
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-brand-300" /> Revisit warranty issues
                  within 7 days.
                </li>
              </ul>
              <a href={BRAND.phoneHref} className={buttonClasses("saffron", "sm", "mt-4 w-full")}>
                <Phone className="h-3.5 w-3.5" /> Call operations
              </a>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3.5 sm:p-4">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-display text-[16px] font-extrabold leading-tight text-ink-950">
          {value}
        </p>
        <p className="mt-0.5 truncate text-[10.5px] text-ink-500">{label}</p>
      </div>
    </div>
  );
}

function WorkerHolding({
  profileStatus,
  submittedAt,
}: {
  profileStatus: "PENDING_APPROVAL" | "SUSPENDED";
  submittedAt: string;
}) {
  const suspended = profileStatus === "SUSPENDED";

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-cream-50 px-4 py-14">
        <div className="w-full max-w-lg">
          <div className="rounded-[28px] border border-ink-100 bg-white p-7 shadow-soft sm:p-9">
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                suspended ? "bg-rose-50 text-rose-600" : "bg-saffron-50 text-saffron-700",
              )}
            >
              {suspended ? <ShieldCheck className="h-6 w-6" /> : <Clock3 className="h-6 w-6" />}
            </span>
            <h1 className="mt-5 font-display text-[26px] font-extrabold tracking-[-0.03em] text-ink-950">
              {suspended ? "Account suspended" : "Your application is under review"}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
              {suspended
                ? "Your worker account has been paused by the operations team. Please call support so we can help."
                : "We received your Aadhaar details and trade selection. Our team verifies every professional before activating job alerts — usually within 24 hours."}
            </p>

            {!suspended ? (
              <div className="mt-6 space-y-0">
                <HoldingStep label="Application received" copy={`Submitted ${formatDateTime(submittedAt)}`} done />
                <HoldingStep label="Document verification" copy="Aadhaar + trade check in progress" current />
                <HoldingStep label="Profile activated" copy="You start receiving jobs nearby" last />
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl bg-cream-50 p-4 text-[12px] leading-relaxed text-ink-500 ring-1 ring-ink-100">
              <span className="font-semibold text-ink-800">Need to update something?</span> Call{" "}
              <a href={BRAND.phoneHref} className="font-semibold text-brand-700 underline underline-offset-2">
                {BRAND.phoneDisplay}
              </a>{" "}
              or email{" "}
              <a href={`mailto:${BRAND.email}`} className="font-semibold text-brand-700 underline underline-offset-2">
                {BRAND.email}
              </a>
              . Quote your registered mobile number.
            </div>

            <div className="mt-5 flex gap-2">
              <Link href="/" className={buttonClasses("secondary", "md", "flex-1")}>
                Back to site
              </Link>
              <a href={BRAND.phoneHref} className={buttonClasses("brand", "md", "flex-1")}>
                Call support <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-ink-400">
            Keep this page handy — it updates automatically once approved.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function HoldingStep({
  label,
  copy,
  done,
  current,
  last,
}: {
  label: string;
  copy: string;
  done?: boolean;
  current?: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className={cn(
            "absolute left-[11px] top-6 h-full w-px",
            done ? "bg-brand-300" : "bg-ink-200",
          )}
        />
      ) : null}
      <span
        className={cn(
          "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          done
            ? "bg-brand-600 text-white"
            : current
              ? "bg-saffron-400 text-ink-950"
              : "bg-ink-100 text-ink-400",
        )}
      >
        {done ? <Check className="h-3 w-3" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <div>
        <p className={cn("text-[12.5px] font-semibold", current ? "text-ink-950" : "text-ink-700")}>
          {label}
        </p>
        <p className="mt-0.5 text-[11px] text-ink-400">{copy}</p>
      </div>
    </div>
  );
}
