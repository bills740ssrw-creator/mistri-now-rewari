import Link from "next/link";
import { ArrowLeft, Compass, Phone } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center">
        <div className="container-page py-16">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Compass className="h-6 w-6" />
            </span>
            <p className="mt-6 font-display text-[64px] font-extrabold leading-none tracking-[-0.06em] text-ink-950">
              404
            </p>
            <h1 className="mt-2 font-display text-[26px] font-bold tracking-[-0.02em] text-ink-950">
              This page has moved on to another job.
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">
              The link may be old, or the page may never have existed. The booking flow, your
              account and support are all still where they should be.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              <Link href="/" className={buttonClasses("primary", "md")}>
                <ArrowLeft className="h-4 w-4" /> Back home
              </Link>
              <Link href="/account" className={buttonClasses("outline", "md")}>
                My bookings
              </Link>
              <a href={BRAND.phoneHref} className={buttonClasses("ghost", "md")}>
                <Phone className="h-4 w-4" /> Call support
              </a>
            </div>
            <p className="mt-6 text-[11.5px] text-ink-400">
              Need a hand? Call{" "}
              <a href={BRAND.phoneHref} className="font-semibold text-ink-700">
                {BRAND.phoneDisplay}
              </a>{" "}
              ({BRAND.hours}).
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
