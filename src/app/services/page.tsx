import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import { getData } from "@/lib/data";
import { BRAND } from "@/lib/constants";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";
import { PageHero } from "@/components/customer/page-hero";
import { ServiceGrid } from "@/components/customer/service-grid";
import { CoverageCta, TrustStrip } from "@/components/customer/marketing";
import { buttonClasses } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services & fixed prices",
  description:
    "Book verified plumbers, electricians, AC and RO technicians in Rewari at fixed prices. Every visit includes inspection and a 7-day workmanship warranty.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string }>;
}) {
  const [{ book }, profile, services] = await Promise.all([
    searchParams,
    getCurrentProfile(),
    getData().listServices(true),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHero
          current="Services"
          eyebrow="Fixed-price catalogue"
          title={
            <>
              Every repair.
              <br />
              <span className="text-brand-700">One fixed price.</span>
            </>
          }
          description="Plumbing, electrical, cooling and appliance repairs across Rewari. Pick a service, choose a one-hour slot, and pay only after the work is done."
          stats={[
            { value: `${services.length}`, label: "Services" },
            { value: "~1 hour", label: "Response" },
            { value: "7 days", label: "Warranty" },
          ]}
          actions={
            <>
              <Link href="#services" className={buttonClasses("brand", "lg")}>
                Browse services
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={BRAND.phoneHref} className={buttonClasses("secondary", "lg")}>
                <Phone className="text-brand-700 h-4 w-4" />
                {BRAND.phoneDisplay}
              </a>
            </>
          }
        />

        <ServiceGrid
          key={book ?? "all"}
          services={services}
          role={profile?.role ?? null}
          presetServiceId={book}
        />
        <TrustStrip />
        <CoverageCta />
      </main>
      <SiteFooter />
    </div>
  );
}
