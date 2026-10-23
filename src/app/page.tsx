import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/session";
import { getData } from "@/lib/data";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";
import { ServiceGrid } from "@/components/customer/service-grid";
import { PageLinks } from "@/components/customer/page-links";
import {
  CoverageCta,
  Hero,
  Testimonials,
  TrustStrip,
} from "@/components/customer/marketing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage({
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
        <Hero signedIn={Boolean(profile)} />
        <TrustStrip />
        <ServiceGrid
          key={book ?? "all"}
          services={services}
          role={profile?.role ?? null}
          presetServiceId={book}
        />
        <PageLinks />
        <Testimonials />
        <CoverageCta />
      </main>
      <SiteFooter />
    </div>
  );
}
