import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Database,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { getData } from "@/lib/data";
import {
  BOOKING_STATUSES,
  BRAND,
  CATEGORY_META,
  STATUS_META,
} from "@/lib/constants";
import type { BookingStatus, Profile } from "@/lib/types";
import { formatDateTime, formatINR, istDateKey } from "@/lib/format";
import { isDemoMode } from "@/lib/session";
import { SiteHeader } from "@/components/customer/site-header";
import { Avatar } from "@/components/ui/avatar";
import { StatusPill } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { WorkerApprovalCard } from "@/components/admin/worker-approval-card";
import { ReassignDialog } from "@/components/admin/reassign-dialog";
import { OrdersToolbar } from "@/components/admin/orders-toolbar";
import { ServiceManager } from "@/components/admin/service-manager";
import { DemoReset } from "@/components/admin/demo-reset";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false },
};

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "approvals", label: "Approvals", icon: UserCheck },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "services", label: "Services", icon: Wrench },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string; q?: string; page?: string }>;
}) {
  const profile = await requireRole("admin");
  const params = await searchParams;
  const tab: TabKey = TABS.some((item) => item.key === params.tab)
    ? (params.tab as TabKey)
    : "overview";
  const status: BookingStatus | "ALL" =
    BOOKING_STATUSES.find((item) => item === params.status) ?? "ALL";
  const q = (params.q ?? "").trim().slice(0, 60);
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const [stats, pending, workers, services, activity, orders] = await Promise.all([
    getData().adminStats(),
    getData().listPendingWorkers(),
    getData().listWorkers("ACTIVE"),
    getData().listServices(false),
    getData().recentActivity(8),
    getData().listAllBookings({ status, q, page, pageSize: 10 }),
  ]);

  const startOfMonthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-ink-950 text-cream-50">
          <div className="container-page pt-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-brand-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                  Operations control room
                </p>
                <h1 className="mt-2 font-display text-[28px] font-extrabold tracking-[-0.035em] sm:text-[34px]">
                  Rewari, {todayLabel}
                </h1>
                <p className="mt-1 text-[12px] text-cream-200/55">
                  {isDemoMode() ? "Demo environment · seeded dataset" : "Live environment"} · signed
                  in as {profile.email ?? profile.fullName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-cream-100/10 bg-white/[0.04] px-4 py-2.5 text-right sm:block">
                  <p className="text-[10px] uppercase tracking-wide text-cream-200/50">
                    Today&apos;s revenue
                  </p>
                  <p className="font-display text-[20px] font-extrabold text-cream-50">
                    {formatINR(stats.revenue.today)}
                  </p>
                </div>
                <Link
                  href="/"
                  className={buttonClasses(
                    "outline",
                    "sm",
                    "border-cream-100/20 text-cream-50 hover:bg-white/10",
                  )}
                >
                  View storefront <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <nav className="mt-6 flex gap-1 overflow-x-auto pb-0" aria-label="Admin sections">
              {TABS.map((item) => {
                const active = tab === item.key;
                const count =
                  item.key === "approvals"
                    ? stats.pendingApprovals
                    : item.key === "orders"
                      ? stats.activeBookings
                      : null;
                return (
                  <Link
                    key={item.key}
                    href={`/admin/dashboard?tab=${item.key}`}
                    className={cn(
                      "flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-[12.5px] font-semibold transition",
                      active
                        ? "border-brand-400 text-cream-50"
                        : "border-transparent text-cream-200/55 hover:text-cream-100",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {count ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9.5px] font-bold",
                          active ? "bg-brand-500/25 text-brand-200" : "bg-white/10 text-cream-200/70",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        </section>

        <div className="container-page py-6 lg:py-8">
          {tab === "overview" ? (
            <OverviewTab
              stats={stats}
              pending={pending}
              activity={activity}
              monthLabel={startOfMonthLabel}
            />
          ) : null}
          {tab === "approvals" ? (
            <ApprovalsTab pending={pending} workers={workers} />
          ) : null}
          {tab === "orders" ? (
            <OrdersTab
              orders={orders}
              workers={workers}
              status={status}
              q={q}
              page={page}
            />
          ) : null}
          {tab === "services" ? <ServiceManager services={services} /> : null}
          {tab === "settings" ? <SettingsTab statsCount={stats.totalBookings} /> : null}
        </div>
      </main>
    </div>
  );
}

function OverviewTab({
  stats,
  pending,
  activity,
  monthLabel,
}: {
  stats: Awaited<ReturnType<ReturnType<typeof getData>["adminStats"]>>;
  pending: Awaited<ReturnType<ReturnType<typeof getData>["listPendingWorkers"]>>;
  activity: Awaited<ReturnType<ReturnType<typeof getData>["recentActivity"]>>;
  monthLabel: string;
}) {
  const todayKey = istDateKey();
  const todayOrders = activity.filter((item) => istDateKey(item.booking.createdAt) === todayKey);
  const maxOrders = Math.max(...stats.daily.map((day) => day.orders), 1);
  const totalStatus = stats.statusBreakdown.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          icon={IndianRupee}
          label={`${monthLabel} revenue`}
          value={formatINR(stats.revenue.month)}
          sub={`Lifetime ${formatINR(stats.revenue.lifetime)}`}
          tone="bg-brand-50 text-brand-700"
        />
        <AdminStat
          icon={CalendarClock}
          label="Active bookings"
          value={String(stats.activeBookings)}
          sub={`${stats.totalBookings} total · ${stats.completionRate}% completion`}
          tone="bg-sky-50 text-sky-700"
        />
        <AdminStat
          icon={UserCheck}
          label="Pending approvals"
          value={String(stats.pendingApprovals)}
          sub={stats.pendingApprovals > 0 ? "Needs review today" : "All clear"}
          tone="bg-saffron-50 text-saffron-700"
          alert={stats.pendingApprovals > 0}
        />
        <AdminStat
          icon={Users}
          label="Professionals online"
          value={`${stats.onlineWorkers}/${stats.activeWorkers}`}
          sub={`${stats.registeredWorkers} registered · ${stats.customers} customers`}
          tone="bg-violet-50 text-violet-700"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-ink-100 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-[18px] font-bold text-ink-950">Orders &amp; revenue</h2>
              <p className="mt-0.5 text-[11.5px] text-ink-500">Last 14 days</p>
            </div>
            <div className="flex items-center gap-3 text-[10.5px] text-ink-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-brand-500" /> Orders
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-saffron-400" /> Revenue
              </span>
            </div>
          </div>

          <div className="mt-5 flex h-40 items-end gap-1.5">
            {stats.daily.map((day) => (
              <div key={day.date} className="group flex h-full flex-1 flex-col justify-end gap-1">
                <div className="flex h-full items-end gap-0.5">
                  <div
                    className="w-1/2 rounded-t bg-brand-500/80 transition group-hover:bg-brand-600"
                    style={{ height: `${Math.max(3, (day.orders / maxOrders) * 100)}%` }}
                    title={`${day.label}: ${day.orders} orders`}
                  />
                  <div
                    className="w-1/2 rounded-t bg-saffron-300 transition group-hover:bg-saffron-400"
                    style={{
                      height: `${Math.max(
                        3,
                        day.revenue > 0 ? (day.revenue / Math.max(...stats.daily.map((d) => d.revenue), 1)) * 100 : 3,
                      )}%`,
                    }}
                    title={`${day.label}: ${formatINR(day.revenue)}`}
                  />
                </div>
                <span className="truncate text-center text-[8.5px] text-ink-400">
                  {day.label.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-dashed border-ink-100 pt-3">
            <MiniStat label="Today" value={formatINR(stats.revenue.today)} />
            <MiniStat
              label="Avg. ticket"
              value={formatINR(stats.averageTicket)}
            />
            <MiniStat label="Completed" value={String(stats.completedBookings)} />
          </div>
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white p-5">
          <h2 className="font-display text-[18px] font-bold text-ink-950">Order mix</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-500">All-time status split</p>
          <ul className="mt-4 space-y-3">
            {stats.statusBreakdown.map((item) => {
              const meta = STATUS_META[item.status];
              return (
                <li key={item.status}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="flex items-center gap-1.5 font-medium text-ink-700">
                      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                      {meta.label}
                    </span>
                    <span className="text-ink-500">{item.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className={cn("h-full rounded-full", meta.dot)}
                      style={{ width: `${Math.max(2, (item.count / totalStatus) * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 rounded-2xl bg-cream-50 p-3 text-[11px] leading-relaxed text-ink-500 ring-1 ring-ink-100">
            <span className="font-semibold text-ink-800">Today:</span> {todayOrders.length} bookings
            placed · {stats.onlineWorkers} professionals online.
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-3xl border border-ink-100 bg-white">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <div>
              <h2 className="font-display text-[17px] font-bold text-ink-950">Recent activity</h2>
              <p className="text-[11px] text-ink-500">Latest bookings across the city</p>
            </div>
            <Link
              href="/admin/dashboard?tab=orders"
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700"
            >
              All orders <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-ink-100 text-[10px] uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-2.5 font-semibold">Booking</th>
                  <th className="px-3 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {activity.map((item) => (
                  <tr key={item.booking.id} className="hover:bg-cream-50/60">
                    <td className="px-5 py-3">
                      <Link href={`/bookings/${item.booking.id}`} className="group block">
                        <p className="text-[12px] font-semibold text-ink-900 group-hover:text-brand-700">
                          {item.service.title}
                        </p>
                        <p className="font-mono text-[9.5px] text-ink-400">{item.booking.code}</p>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-[11.5px] text-ink-600">{item.customer.fullName}</td>
                    <td className="px-3 py-3">
                      <StatusPill status={item.booking.status} />
                    </td>
                    <td className="px-3 py-3 text-right text-[12px] font-semibold text-ink-900">
                      {formatINR(item.booking.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-bold text-ink-950">Needs attention</h2>
            <AlertCircle className="h-4 w-4 text-saffron-500" />
          </div>
          <div className="mt-4 space-y-2">
            <AttentionRow
              href="/admin/dashboard?tab=approvals"
              label="Worker applications"
              value={pending.length}
              detail="Awaiting Aadhaar review"
            />
            <AttentionRow
              href="/admin/dashboard?tab=orders&status=PENDING"
              label="Unassigned bookings"
              value={stats.statusBreakdown.find((item) => item.status === "PENDING")?.count ?? 0}
              detail="No professional assigned yet"
            />
            <AttentionRow
              href="/admin/dashboard?tab=orders&status=IN_PROGRESS"
              label="Jobs in progress"
              value={stats.statusBreakdown.find((item) => item.status === "IN_PROGRESS")?.count ?? 0}
              detail="Watch for stuck OTPs"
            />
          </div>
          <div className="mt-5 rounded-2xl bg-brand-50/70 p-3.5 text-[11px] leading-relaxed text-brand-900/70 ring-1 ring-brand-600/10">
            <span className="font-semibold text-brand-900">Approval SLA:</span> verify new
            professionals within 24 hours. Same-day approvals get more online hours.
          </div>
        </section>
      </div>
    </div>
  );
}

function ApprovalsTab({
  pending,
  workers,
}: {
  pending: Awaited<ReturnType<ReturnType<typeof getData>["listPendingWorkers"]>>;
  workers: Profile[];
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink-950">
            Worker approvals
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-500">
            Verify Aadhaar details, then approve to activate job alerts.
          </p>
        </div>
        <span className="rounded-full bg-saffron-50 px-3 py-1.5 text-[11px] font-bold text-saffron-800 ring-1 ring-saffron-300">
          {pending.length} pending
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white/70 px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="mt-3 font-display text-[17px] font-bold text-ink-900">All caught up</p>
          <p className="mt-1 text-[12.5px] text-ink-500">
            No applications waiting. New professionals show up here instantly.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pending.map((item) => (
            <WorkerApprovalCard key={item.worker.id} item={item} />
          ))}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-ink-100 bg-white">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="font-display text-[17px] font-bold text-ink-950">Active team</h2>
            <p className="text-[11px] text-ink-500">{workers.length} approved professionals</p>
          </div>
          <BadgeCheck className="h-4 w-4 text-brand-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b border-ink-100 text-[10px] uppercase tracking-wide text-ink-400">
                <th className="px-5 py-2.5 font-semibold">Professional</th>
                <th className="px-3 py-2.5 font-semibold">Trade</th>
                <th className="px-3 py-2.5 font-semibold">Rating</th>
                <th className="px-3 py-2.5 font-semibold">Jobs</th>
                <th className="px-3 py-2.5 font-semibold">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-cream-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={worker.fullName} size="sm" online={worker.isOnline} />
                      <div>
                        <p className="text-[12px] font-semibold text-ink-900">{worker.fullName}</p>
                        <p className="text-[10px] text-ink-400">+91 {worker.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[11.5px] text-ink-600">
                    {worker.serviceCategory ? CATEGORY_META[worker.serviceCategory].short : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1 text-[11.5px] text-ink-700">
                      <Star className="h-3 w-3 fill-saffron-400 text-saffron-400" />
                      {worker.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[11.5px] text-ink-600">{worker.jobsCompleted}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        worker.isOnline
                          ? "bg-brand-50 text-brand-700"
                          : "bg-cream-100 text-ink-500",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          worker.isOnline ? "bg-brand-500" : "bg-ink-300",
                        )}
                      />
                      {worker.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function OrdersTab({
  orders,
  workers,
  status,
  q,
  page,
}: {
  orders: Awaited<ReturnType<ReturnType<typeof getData>["listAllBookings"]>>;
  workers: Profile[];
  status: BookingStatus | "ALL";
  q: string;
  page: number;
}) {
  function pageHref(nextPage: number) {
    const params = new URLSearchParams({ tab: "orders", page: String(nextPage) });
    if (status !== "ALL") params.set("status", status);
    if (q) params.set("q", q);
    return `/admin/dashboard?${params.toString()}`;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink-950">Orders</h2>
        <p className="mt-0.5 text-[12px] text-ink-500">
          Every booking, with reassignment and payment state.
        </p>
      </div>

      <OrdersToolbar key={q} status={status} query={q} total={orders.total} />

      <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-cream-50/60 text-[10px] uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Booking</th>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Schedule</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Professional</th>
                <th className="px-3 py-3 font-semibold">Payment</th>
                <th className="px-3 py-3 text-right font-semibold">Amount</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[12.5px] text-ink-500">
                    No orders match these filters.
                  </td>
                </tr>
              ) : null}
              {orders.rows.map((item) => {
                const active = !["COMPLETED", "CANCELLED"].includes(item.booking.status);
                return (
                  <tr key={item.booking.id} className="hover:bg-cream-50/50">
                    <td className="px-5 py-3">
                      <p className="text-[12px] font-semibold text-ink-900">{item.service.title}</p>
                      <p className="font-mono text-[9.5px] text-ink-400">{item.booking.code}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[11.5px] font-medium text-ink-800">{item.customer.fullName}</p>
                      <p className="text-[10px] text-ink-400">+91 {item.customer.phone}</p>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-ink-600">
                      {formatDateTime(item.booking.scheduledTime)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={item.booking.status} />
                    </td>
                    <td className="px-3 py-3">
                      {item.worker ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={item.worker.fullName} size="sm" className="h-6 w-6 text-[9px]" />
                          <span className="text-[11px] text-ink-700">{item.worker.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-ink-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[10.5px] text-ink-600">
                        {item.booking.paymentMethod === "UPI" ? "UPI" : "Cash / UPI"}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-semibold",
                          item.booking.paymentStatus === "PAID" ? "text-brand-700" : "text-saffron-700",
                        )}
                      >
                        {item.booking.paymentStatus === "PAID" ? "Paid" : "Pending"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right text-[12px] font-semibold text-ink-900">
                      {formatINR(item.booking.totalAmount)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {active ? (
                          <ReassignDialog
                            bookingId={item.booking.id}
                            currentWorkerId={item.booking.workerId}
                            workers={workers}
                            code={item.booking.code}
                          />
                        ) : null}
                        <Link
                          href={`/bookings/${item.booking.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-ink-950 px-2.5 py-1.5 text-[10.5px] font-semibold text-cream-50 transition hover:bg-ink-800"
                        >
                          View <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
          <p className="text-[11px] text-ink-500">
            Page {orders.page} of {Math.max(1, orders.pageCount)} · {orders.total} orders
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className={buttonClasses("secondary", "sm")}>
                Previous
              </Link>
            ) : null}
            {page < orders.pageCount ? (
              <Link href={pageHref(page + 1)} className={buttonClasses("secondary", "sm")}>
                Next
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ statsCount }: { statsCount: number }) {
  const demo = isDemoMode();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl border border-ink-100 bg-white p-5">
        <h2 className="font-display text-[18px] font-bold text-ink-950">Business profile</h2>
        <p className="mt-0.5 text-[11.5px] text-ink-500">Shown across the storefront, invoices and support.</p>
        <dl className="mt-4 space-y-3 text-[12.5px]">
          <SettingRow label="Brand" value={BRAND.name} />
          <SettingRow label="Legal entity" value={BRAND.legalName} />
          <SettingRow label="Support phone" value={BRAND.phoneDisplay} />
          <SettingRow label="Support email" value={BRAND.email} />
          <SettingRow label="UPI ID" value={BRAND.upiId} />
          <SettingRow label="Service area" value={`${BRAND.city}, ${BRAND.state} ${BRAND.pincode}`} />
          <SettingRow label="Hours" value={BRAND.hours} />
        </dl>
        <p className="mt-4 rounded-xl bg-cream-50 p-3 text-[11px] leading-relaxed text-ink-500 ring-1 ring-ink-100">
          Edit these in <code className="rounded bg-white px-1 py-0.5">src/lib/constants.ts</code> or
          your environment variables before going live.
        </p>
      </section>

      <section className="rounded-3xl border border-ink-100 bg-white p-5">
        <h2 className="font-display text-[18px] font-bold text-ink-950">Platform</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-ink-100 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Database className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-ink-900">
                {demo ? "Demo data store" : "Supabase connected"}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
                {demo
                  ? "File-backed seed data in .data/demo.json. Add Supabase env vars and run the migrations to switch."
                  : "PostgreSQL + RLS + Realtime. All writes flow through SECURITY DEFINER RPCs."}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-ink-100 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-ink-900">Access control</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
                Role-based routing + row-level security. Workers only read their own jobs; customers
                only their own bookings.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-ink-100 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-saffron-50 text-saffron-700">
              <ClipboardList className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-ink-900">Records</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
                {statsCount} bookings in the system. Export by querying the bookings table in your
                Supabase dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-ink-100 bg-white p-5">
        <h2 className="font-display text-[18px] font-bold text-ink-950">Compliance &amp; legal</h2>
        <p className="mt-0.5 text-[11.5px] text-ink-500">
          Customer-facing pages that must stay accurate.
        </p>
        <div className="mt-4 grid gap-2">
          <Link href="/privacy" className="flex items-center justify-between rounded-xl border border-ink-100 px-3.5 py-2.5 text-[12px] font-medium text-ink-700 transition hover:border-brand-300">
            Privacy policy <ArrowUpRight className="h-3.5 w-3.5 text-ink-400" />
          </Link>
          <Link href="/terms" className="flex items-center justify-between rounded-xl border border-ink-100 px-3.5 py-2.5 text-[12px] font-medium text-ink-700 transition hover:border-brand-300">
            Terms of service <ArrowUpRight className="h-3.5 w-3.5 text-ink-400" />
          </Link>
          <Link href="/refund" className="flex items-center justify-between rounded-xl border border-ink-100 px-3.5 py-2.5 text-[12px] font-medium text-ink-700 transition hover:border-brand-300">
            Cancellation &amp; refunds <ArrowUpRight className="h-3.5 w-3.5 text-ink-400" />
          </Link>
          <Link href="/support" className="flex items-center justify-between rounded-xl border border-ink-100 px-3.5 py-2.5 text-[12px] font-medium text-ink-700 transition hover:border-brand-300">
            Contact &amp; support <ArrowUpRight className="h-3.5 w-3.5 text-ink-400" />
          </Link>
        </div>
        <p className="mt-4 text-[10.5px] leading-relaxed text-ink-400">
          The legal pages currently state that attorney review is pending. Have them reviewed before
          launch.
        </p>
      </section>

      {demo ? (
        <section className="rounded-3xl border border-saffron-200 bg-saffron-50/60 p-5">
          <h2 className="flex items-center gap-2 font-display text-[18px] font-bold text-ink-950">
            <BookOpen className="h-4 w-4 text-saffron-700" /> Demo tools
          </h2>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-600">
            This build runs on seeded data so the entire flow works without Supabase. Reset restores
            all bookings, workers and pricing to the original demo state.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <DemoReset />
            <Link href="/auth" className={buttonClasses("secondary", "sm")}>
              View demo accounts
            </Link>
          </div>
          <div className="mt-4 space-y-1.5 text-[10.5px] text-ink-500">
            <p className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> Customer: 9876543210 · Worker: 9812345672
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> OTP 123456 · admin {BRAND.adminEmail}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function AdminStat({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  alert,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  sub: string;
  tone: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tone)}>
          <Icon className="h-4 w-4" />
        </span>
        {alert ? (
          <span className="flex items-center gap-1 rounded-full bg-saffron-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-saffron-700">
            <AlertCircle className="h-2.5 w-2.5" /> Action
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[22px] font-extrabold leading-none tracking-tight text-ink-950">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium text-ink-600">{label}</p>
      <p className="mt-0.5 text-[10px] text-ink-400">{sub}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold text-ink-900">{value}</p>
    </div>
  );
}

function AttentionRow({
  href,
  label,
  value,
  detail,
}: {
  href: string;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 px-3.5 py-3 transition hover:border-brand-300 hover:bg-cream-50/50"
    >
      <div>
        <p className="text-[12px] font-semibold text-ink-900">{label}</p>
        <p className="text-[10.5px] text-ink-400">{detail}</p>
      </div>
      <span
        className={cn(
          "flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-bold",
          value > 0 ? "bg-saffron-100 text-saffron-800" : "bg-cream-100 text-ink-400",
        )}
      >
        {value}
      </span>
    </Link>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed border-ink-100 pb-2.5 last:border-0 last:pb-0">
      <dt className="shrink-0 text-ink-400">{label}</dt>
      <dd className="text-right font-medium text-ink-800">{value}</dd>
    </div>
  );
}
