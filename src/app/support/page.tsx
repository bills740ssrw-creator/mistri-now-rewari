import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";
import { PageHero } from "@/components/customer/page-hero";
import { ContactForm } from "@/components/customer/contact-form";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Support & contact",
  description:
    "Call, WhatsApp or email Mistri Now Rewari for booking help, refunds, warranty claims or worker applications. Open 7 AM to 9 PM, all days.",
  alternates: { canonical: "/support" },
};

const FAQS = [
  {
    q: "How fast can a professional reach me?",
    a: "Most jobs start within about an hour. You pick a one-hour window when booking, and we assign the nearest available professional in that trade. Live tracking begins when they accept.",
  },
  {
    q: "What does the visit price include?",
    a: "The fixed price covers the listed work and inspection. Spare parts or extra material are quoted and added to your bill only after you approve them.",
  },
  {
    q: "How do the OTPs work?",
    a: "Share the start OTP when the professional arrives so work can begin, and the completion OTP only after you are satisfied. Never share an OTP over the phone before arrival.",
  },
  {
    q: "What if the problem comes back?",
    a: "Every job carries a 7-day workmanship warranty on the same issue. Call us within 7 days of completion with your booking code and we will arrange a free revisit.",
  },
  {
    q: "Where can I track my booking?",
    a: "Sign in and open My bookings. Every active job shows the assigned professional, live status, OTPs and the running bill.",
  },
];

export default function SupportPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHero
          current="Support"
          eyebrow="Support desk, Rewari"
          title={
            <>
              A real person
              <br />
              <span className="text-brand-700">picks up the phone.</span>
            </>
          }
          description="Booking trouble, a refund question, or a warranty revisit - call us. We are the operations team for Mistri Now Rewari, not a call centre."
          stats={[
            { value: "7 AM-9 PM", label: "All 7 days" },
            { value: "Rewari", label: "Local team" },
            { value: "1 call", label: "No IVR" },
          ]}
          actions={
            <>
              <a href={BRAND.phoneHref} className={buttonClasses("brand", "lg")}>
                <Phone className="h-4 w-4" />
                Call {BRAND.phoneDisplay}
              </a>
              <a href="#message" className={buttonClasses("secondary", "lg")}>
                Send a message
              </a>
            </>
          }
        />

        <section className="container-page pt-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <a
              href={BRAND.phoneHref}
              className="group border-ink-100 hover:shadow-soft rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5"
            >
              <span className="bg-brand-50 text-brand-700 flex h-9 w-9 items-center justify-center rounded-xl">
                <Phone className="h-4 w-4" />
              </span>
              <p className="text-ink-400 mt-3 text-[10.5px] font-semibold tracking-wide uppercase">
                Call support
              </p>
              <p className="text-ink-950 mt-0.5 text-[14px] font-bold">{BRAND.phoneDisplay}</p>
              <p className="text-ink-500 text-[11px]">Fastest for urgent jobs</p>
            </a>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group border-ink-100 hover:shadow-soft rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5"
            >
              <span className="bg-brand-50 text-brand-700 flex h-9 w-9 items-center justify-center rounded-xl">
                <MessageCircle className="h-4 w-4" />
              </span>
              <p className="text-ink-400 mt-3 text-[10.5px] font-semibold tracking-wide uppercase">
                WhatsApp
              </p>
              <p className="text-ink-950 mt-0.5 text-[14px] font-bold">{BRAND.phoneDisplay}</p>
              <p className="text-ink-500 text-[11px]">Send photos or your booking code</p>
            </a>
            <a
              href={`mailto:${BRAND.email}`}
              className="group border-ink-100 hover:shadow-soft rounded-2xl border bg-white p-4 transition hover:-translate-y-0.5"
            >
              <span className="bg-brand-50 text-brand-700 flex h-9 w-9 items-center justify-center rounded-xl">
                <Mail className="h-4 w-4" />
              </span>
              <p className="text-ink-400 mt-3 text-[10.5px] font-semibold tracking-wide uppercase">
                Email
              </p>
              <p className="text-ink-950 mt-0.5 text-[14px] font-bold break-all">{BRAND.email}</p>
              <p className="text-ink-500 text-[11px]">Receipts, refunds and documentation</p>
            </a>
          </div>
        </section>

        <div
          id="message"
          className="container-page grid scroll-mt-28 gap-6 py-8 lg:grid-cols-[1.35fr_1fr] lg:py-12"
        >
          <ContactForm />

          <div className="space-y-4">
            <section className="border-ink-100 rounded-3xl border bg-white p-5">
              <h2 className="font-display text-ink-950 text-[16px] font-bold">
                Visit or write to us
              </h2>
              <ul className="text-ink-600 mt-3 space-y-3 text-[12.5px]">
                <li className="flex items-start gap-2.5">
                  <MapPin className="text-brand-600 mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {BRAND.legalName}
                    <br />
                    {BRAND.address}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock3 className="text-brand-600 mt-0.5 h-4 w-4 shrink-0" />
                  <span>{BRAND.hours}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="text-brand-600 mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    For safety issues, call us immediately. If there is an emergency, contact local
                    emergency services first.
                  </span>
                </li>
              </ul>
            </section>

            <section className="border-ink-100 rounded-3xl border bg-white p-5">
              <h2 className="font-display text-ink-950 text-[16px] font-bold">Common questions</h2>
              <div className="divide-ink-100 mt-2 divide-y">
                {FAQS.map((item) => (
                  <details key={item.q} className="group py-3">
                    <summary className="text-ink-800 flex cursor-pointer list-none items-center justify-between gap-3 text-[12.5px] font-semibold">
                      {item.q}
                      <span className="text-ink-400 transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="text-ink-500 mt-2 text-[12px] leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="bg-ink-950 text-cream-50 rounded-3xl p-5">
              <h2 className="font-display text-[16px] font-bold">Looking for policies?</h2>
              <p className="text-cream-200/60 mt-1.5 text-[11.5px] leading-relaxed">
                Privacy, terms, cancellations and refunds are all published and kept in plain
                language.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                <Link
                  href="/privacy"
                  className="border-cream-100/20 rounded-full border px-3 py-1.5 transition hover:bg-white/10"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="border-cream-100/20 rounded-full border px-3 py-1.5 transition hover:bg-white/10"
                >
                  Terms
                </Link>
                <Link
                  href="/refund"
                  className="border-cream-100/20 rounded-full border px-3 py-1.5 transition hover:bg-white/10"
                >
                  Refunds
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
