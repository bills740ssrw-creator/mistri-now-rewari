import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  KeyRound,
  Phone,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { BRAND } from "@/lib/constants";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";
import { PageHero } from "@/components/customer/page-hero";
import { CoverageCta, HowItWorks } from "@/components/customer/marketing";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "See how Mistri Now Rewari works: pick a service and slot, a verified mistri accepts, track the job live, share OTPs and pay after the work is done.",
  alternates: { canonical: "/how-it-works" },
};

const FAQS = [
  {
    q: "Do I pay anything before the visit?",
    a: "No. Booking is free and the visit charge is paid after the service. If a spare part is needed, the professional quotes it and the amount is added only after you approve it.",
  },
  {
    q: "How is the final bill calculated?",
    a: "The fixed visit charge for the service plus any approved spare parts or material. You can see the running total on your booking page before paying.",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Yes. You can reschedule or cancel from your booking page before the professional starts. Cancellation and refund rules are published on the refunds page.",
  },
  {
    q: "What if the professional cannot fix the issue?",
    a: "You only pay the visit charge for the inspection. If the fault needs a specialist or a part we do not carry, support will help you with the next step.",
  },
  {
    q: "What if I am not home at the slot?",
    a: "Please keep the one-hour window free. If nobody is available, the professional may have to leave and the visit can be rescheduled subject to availability.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHero
          current="How it works"
          eyebrow="From booking to fixed"
          title={
            <>
              Booked in two minutes.
              <br />
              <span className="text-brand-700">Fixed the same day.</span>
            </>
          }
          description="No haggling, no advance payment and no mystery charges. Here is exactly what happens from the moment you tap Book to the moment the job is closed."
          stats={[
            { value: "3 steps", label: "To book" },
            { value: "0", label: "Advance" },
            { value: "7 days", label: "Warranty" },
          ]}
          actions={
            <>
              <Link href="/services" className={buttonClasses("brand", "lg")}>
                Book a service
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={BRAND.phoneHref} className={buttonClasses("secondary", "lg")}>
                <Phone className="text-brand-700 h-4 w-4" />
                {BRAND.phoneDisplay}
              </a>
            </>
          }
        />

        <HowItWorks />

        <section className="container-page py-16 lg:py-20">
          <div className="max-w-2xl">
            <Badge tone="brand">
              <KeyRound className="h-3 w-3" /> Safety, built in
            </Badge>
            <h2 className="font-display text-ink-950 mt-4 text-[30px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[38px]">
              Two OTPs. Zero confusion.
            </h2>
            <p className="text-ink-600 mt-3 text-[14px] leading-relaxed">
              The start and completion OTPs make sure the right job starts and only you can close
              it. Never share an OTP before the professional is at your door.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="border-ink-100 rounded-3xl border bg-white p-6">
              <span className="bg-brand-50 text-brand-700 ring-brand-600/10 flex h-11 w-11 items-center justify-center rounded-2xl ring-1">
                <KeyRound className="h-5 w-5" />
              </span>
              <h3 className="font-display text-ink-950 mt-4 text-[18px] font-bold">Start OTP</h3>
              <p className="text-ink-500 mt-1.5 text-[13px] leading-relaxed">
                Share the 4-digit start code only when the professional has arrived and is ready to
                begin. It starts the job timer and confirms the visit.
              </p>
            </div>
            <div className="border-ink-100 rounded-3xl border bg-white p-6">
              <span className="bg-saffron-50 text-saffron-700 ring-saffron-600/15 flex h-11 w-11 items-center justify-center rounded-2xl ring-1">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <h3 className="font-display text-ink-950 mt-4 text-[18px] font-bold">
                Completion OTP
              </h3>
              <p className="text-ink-500 mt-1.5 text-[13px] leading-relaxed">
                Check the work first, then share the completion code. It closes the job, records the
                final bill and starts your 7-day workmanship warranty.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: ReceiptText,
                title: "Bill before payment",
                copy: "The final amount is shown on your booking page before you pay, including any approved parts.",
              },
              {
                icon: Wallet,
                title: "Pay after service",
                copy: "Settle by UPI or cash once the work is done. No advance, no booking fee.",
              },
              {
                icon: ShieldCheck,
                title: "7-day warranty",
                copy: "If the same issue returns within a week, call support and we arrange a free revisit.",
              },
            ].map((item) => (
              <div key={item.title} className="border-ink-100 rounded-3xl border bg-white p-5">
                <item.icon className="text-brand-700 h-5 w-5" strokeWidth={1.8} />
                <h3 className="font-display text-ink-950 mt-3 text-[15.5px] font-bold">
                  {item.title}
                </h3>
                <p className="text-ink-500 mt-1 text-[12.5px] leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-ink-100 border-y bg-white/60">
          <div className="container-page grid gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
            <div>
              <Badge tone="ink">Before you book</Badge>
              <h2 className="font-display text-ink-950 mt-4 text-[30px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[38px]">
                Questions we hear every day.
              </h2>
              <p className="text-ink-600 mt-3 max-w-sm text-[13.5px] leading-relaxed">
                Still unsure which service fits? Call us and describe the problem. We will point you
                to the right trade.
              </p>
              <a href={BRAND.phoneHref} className={buttonClasses("secondary", "md", "mt-5")}>
                <Phone className="text-brand-700 h-4 w-4" />
                {BRAND.phoneDisplay}
              </a>
            </div>

            <div className="divide-ink-100 border-ink-100 divide-y rounded-3xl border bg-white px-5 sm:px-6">
              {FAQS.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="text-ink-800 flex cursor-pointer list-none items-center justify-between gap-4 text-[13.5px] font-semibold">
                    {item.q}
                    <span className="text-ink-400 shrink-0 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-ink-500 mt-2 text-[12.5px] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <CoverageCta />
      </main>
      <SiteFooter />
    </div>
  );
}
