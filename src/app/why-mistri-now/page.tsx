import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus, Phone, X } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";
import { PageHero } from "@/components/customer/page-hero";
import { CoverageCta, Guarantee, Testimonials } from "@/components/customer/marketing";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Why Mistri Now",
  description:
    "Aadhaar-verified professionals, fixed prices, start and completion OTPs, a 7-day workmanship warranty and a local Rewari support team.",
  alternates: { canonical: "/why-mistri-now" },
};

type Comparison = "yes" | "sometimes" | "no";

const ROWS: {
  label: string;
  ours: Comparison;
  handyman: Comparison;
  classifieds: Comparison;
}[] = [
  {
    label: "Fixed price shown before booking",
    ours: "yes",
    handyman: "sometimes",
    classifieds: "no",
  },
  { label: "Aadhaar & background verified", ours: "yes", handyman: "no", classifieds: "no" },
  { label: "Start and completion OTP", ours: "yes", handyman: "no", classifieds: "no" },
  { label: "7-day workmanship warranty", ours: "yes", handyman: "sometimes", classifieds: "no" },
  { label: "Bill shown before you pay", ours: "yes", handyman: "sometimes", classifieds: "no" },
  { label: "Local support, 7 AM to 9 PM", ours: "yes", handyman: "no", classifieds: "no" },
];

const LABELS: Record<Comparison, string> = {
  yes: "Yes",
  sometimes: "Sometimes",
  no: "No",
};

function CompareCell({ value, highlight }: { value: Comparison; highlight?: boolean }) {
  return (
    <td
      className={highlight ? "bg-brand-50/60 px-4 py-3.5 text-center" : "px-4 py-3.5 text-center"}
    >
      <span
        className={
          value === "yes"
            ? "bg-brand-100 text-brand-700 inline-flex h-7 w-7 items-center justify-center rounded-full"
            : value === "sometimes"
              ? "bg-saffron-50 text-saffron-700 inline-flex h-7 w-7 items-center justify-center rounded-full"
              : "bg-ink-100 text-ink-400 inline-flex h-7 w-7 items-center justify-center rounded-full"
        }
      >
        {value === "yes" ? (
          <Check className="h-4 w-4" strokeWidth={2.6} />
        ) : value === "sometimes" ? (
          <Minus className="h-4 w-4" strokeWidth={2.6} />
        ) : (
          <X className="h-4 w-4" strokeWidth={2.4} />
        )}
        <span className="sr-only">{LABELS[value]}</span>
      </span>
    </td>
  );
}

export default function WhyMistriNowPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHero
          current="Why Mistri Now"
          eyebrow="Built for Rewari"
          title={
            <>
              The neighbourhood mistri,
              <br />
              <span className="text-brand-700">with receipts.</span>
            </>
          }
          description="We are not a listings board. Every professional is verified, every price is fixed before the visit, and our own team handles support if something goes wrong."
          stats={[
            { value: "4.9/5", label: "312 reviews" },
            { value: "100%", label: "Verified" },
            { value: "7 days", label: "Warranty" },
          ]}
          actions={
            <>
              <Link href="/services" className={buttonClasses("brand", "lg")}>
                See fixed prices
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={BRAND.phoneHref} className={buttonClasses("secondary", "lg")}>
                <Phone className="text-brand-700 h-4 w-4" />
                {BRAND.phoneDisplay}
              </a>
            </>
          }
        />

        <Guarantee />

        <section className="border-ink-100 border-y bg-white/60">
          <div className="container-page py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-xl">
                <Badge tone="brand">Compare</Badge>
                <h2 className="font-display text-ink-950 mt-4 text-[30px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[38px]">
                  Not another number from a classifieds app.
                </h2>
                <p className="text-ink-600 mt-3 text-[13.5px] leading-relaxed">
                  A local handyman can be great. The problem is what happens when the price, the
                  person or the work is not what you expected. Here is the difference we build for.
                </p>
              </div>
              <p className="text-ink-400 text-[11px]">Based on the Mistri Now operating model.</p>
            </div>

            <div className="border-ink-100 mt-8 overflow-x-auto rounded-3xl border bg-white shadow-[0_1px_2px_rgba(10,22,17,0.03)]">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr className="border-ink-100 bg-cream-50/70 text-ink-400 border-b text-[11px] tracking-[0.08em] uppercase">
                    <th scope="col" className="px-4 py-3.5 font-semibold">
                      What you get
                    </th>
                    <th
                      scope="col"
                      className="bg-brand-50/60 text-brand-800 px-4 py-3.5 text-center font-bold"
                    >
                      Mistri Now
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center font-semibold">
                      Local handyman
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center font-semibold">
                      Just a phone number
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-ink-100 text-ink-700 divide-y text-[12.5px]">
                  {ROWS.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="text-ink-700 px-4 py-3.5 text-left font-medium">
                        {row.label}
                      </th>
                      <CompareCell value={row.ours} highlight />
                      <CompareCell value={row.handyman} />
                      <CompareCell value={row.classifieds} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <Testimonials />
        <CoverageCta />
      </main>
      <SiteFooter />
    </div>
  );
}
