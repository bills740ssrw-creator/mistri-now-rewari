import Link from "next/link";
import { Clock, Mail, MapPin, Phone, ShieldCheck, Wallet } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { Logo } from "@/components/brand/logo";
import { isDemoMode } from "@/lib/session";

const serviceLinks = [
  { label: "Plumber · ₹350", href: "/services" },
  { label: "Electrician · ₹199", href: "/services" },
  { label: "AC Service · ₹499", href: "/services" },
  { label: "AC Gas Filling · ₹3,399", href: "/services" },
  { label: "RO Service · ₹299", href: "/services" },
  { label: "Washing Machine · ₹300", href: "/services" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-ink-950 text-cream-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-cream-200/65">
            Rewari&apos;s neighbourhood home-service network. Verified mistris, fixed prices and a
            7-day service warranty — booked in under two minutes.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-100/15 px-3 py-1.5 text-[11px] text-cream-200/80">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-300" /> Aadhaar verified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-100/15 px-3 py-1.5 text-[11px] text-cream-200/80">
              <Wallet className="h-3.5 w-3.5 text-saffron-300" /> UPI & cash
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream-200/45">
            Popular services
          </h3>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            {serviceLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-cream-200/70 transition hover:text-cream-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream-200/45">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            <li>
              <Link href="/how-it-works" className="text-cream-200/70 transition hover:text-cream-50">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/why-mistri-now" className="text-cream-200/70 transition hover:text-cream-50">
                Why Mistri Now
              </Link>
            </li>
            <li>
              <Link href="/support" className="text-cream-200/70 transition hover:text-cream-50">
                Support
              </Link>
            </li>
            <li>
              <Link href="/auth" className="text-cream-200/70 transition hover:text-cream-50">
                Join as a professional
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-cream-200/70 transition hover:text-cream-50">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-cream-200/70 transition hover:text-cream-50">
                Terms of service
              </Link>
            </li>
            <li>
              <Link href="/refund" className="text-cream-200/70 transition hover:text-cream-50">
                Cancellation & refunds
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream-200/45">
            Reach us
          </h3>
          <ul className="mt-4 space-y-3 text-[13px] text-cream-200/70">
            <li>
              <a
                href={BRAND.phoneHref}
                className="flex items-start gap-2.5 transition hover:text-cream-50"
              >
                <Phone className="mt-0.5 h-4 w-4 text-brand-300" />
                {BRAND.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-start gap-2.5 transition hover:text-cream-50"
              >
                <Mail className="mt-0.5 h-4 w-4 text-brand-300" />
                {BRAND.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 text-brand-300" />
              {BRAND.address}
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 text-brand-300" />
              {BRAND.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-100/10">
        <div className="container-page flex flex-col gap-3 py-6 text-[11.5px] text-cream-200/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND.legalName}. Operated under the brand {BRAND.name}, Rewari, Haryana.
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Marketplace for independent professionals.</span>
            {isDemoMode() ? (
              <span className="rounded-full bg-saffron-400/15 px-2 py-0.5 font-semibold text-saffron-300">
                Demo environment
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
