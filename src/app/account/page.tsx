import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck2, IndianRupee, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { getData } from "@/lib/data";
import { isActiveBooking } from "@/lib/booking";
import { formatINR, formatDate, maskPhone } from "@/lib/format";
import { BRAND } from "@/lib/constants";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";
import { BookingsList } from "@/components/customer/bookings-list";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account",
  description: "Your bookings, live jobs and service history with Mistri Now Rewari.",
  robots: { index: false },
};

export default async function AccountPage() {
  const profile = await requireCustomer();
  const bookings = await getData().listCustomerBookings(profile.id);

  const active = bookings.filter((item) => isActiveBooking(item.booking.status)).length;
  const completed = bookings.filter((item) => item.booking.status === "COMPLETED");
  const spend = completed.reduce((total, item) => total + item.booking.totalAmount, 0);

  const stats = [
    { icon: Sparkles, label: "Active jobs", value: String(active), tone: "text-brand-700 bg-brand-50" },
    {
      icon: CalendarCheck2,
      label: "Jobs completed",
      value: String(completed.length),
      tone: "text-sky-700 bg-sky-50",
    },
    {
      icon: IndianRupee,
      label: "Lifetime spend",
      value: formatINR(spend),
      tone: "text-saffron-700 bg-saffron-50",
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-ink-100 bg-white/60">
          <div className="container-page py-8 lg:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={profile.fullName} size="lg" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                    My account
                  </p>
                  <h1 className="mt-0.5 font-display text-[26px] font-extrabold tracking-[-0.03em] text-ink-950 sm:text-[32px]">
                    Namaste, {profile.fullName.split(" ")[0]}.
                  </h1>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500">
                    <span>+91 {maskPhone(profile.phone)}</span>
                    <span aria-hidden>·</span>
                    <span>Member since {formatDate(profile.createdAt)}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/services" className={buttonClasses("brand", "md")}>
                  Book a service <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a href={BRAND.phoneHref} className={buttonClasses("secondary", "md")}>
                  <Phone className="h-4 w-4 text-brand-700" /> Support
                </a>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4"
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}>
                    <stat.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-[20px] font-extrabold leading-none text-ink-950">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-page py-8 lg:py-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink-950">
                Your bookings
              </h2>
              <p className="mt-1 text-[12.5px] text-ink-500">
                Track a live job, check warranty or book the same service again.
              </p>
            </div>
          </div>
          <BookingsList bookings={bookings} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
