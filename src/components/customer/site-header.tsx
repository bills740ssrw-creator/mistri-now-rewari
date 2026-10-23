import Link from "next/link";
import { MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/session";
import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/customer/account-menu";
import { MobileNav } from "@/components/customer/mobile-nav";
import { buttonClasses } from "@/components/ui/button";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink-950 text-cream-100">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[11px]">
          <p className="flex items-center gap-2 tracking-wide">
            <Sparkles className="h-3 w-3 text-saffron-300" aria-hidden />
            <span className="hidden sm:inline">A unit of {BRAND.legalName}</span>
            <span className="sm:hidden">Home services in Rewari</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-cream-200/80 md:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-300" aria-hidden />
              Aadhaar-verified professionals
            </span>
            <a
              href={BRAND.phoneHref}
              className="flex items-center gap-1.5 font-semibold text-cream-50 transition hover:text-saffron-300"
            >
              <Phone className="h-3 w-3" aria-hidden />
              {BRAND.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-ink-100/80 bg-cream-50/85 backdrop-blur-xl">
        <div className="container-page flex h-[72px] items-center justify-between gap-5">
          <Logo />

          <nav className="hidden items-center gap-7 text-[13px] font-medium text-ink-600 lg:flex">
            <Link href="/services" className="transition hover:text-ink-900">
              Services
            </Link>
            <Link href="/how-it-works" className="transition hover:text-ink-900">
              How it works
            </Link>
            <Link href="/why-mistri-now" className="transition hover:text-ink-900">
              Why Mistri Now
            </Link>
            <Link href="/support" className="transition hover:text-ink-900">
              Support
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-2 text-[12px] font-semibold text-ink-700 md:flex">
              <MapPin className="h-3.5 w-3.5 text-brand-600" aria-hidden />
              Rewari, HR
            </span>

            {profile ? (
              <>
                {profile.role === "customer" ? (
                  <Link
                    href="/account"
                    className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}
                  >
                    My bookings
                  </Link>
                ) : profile.role === "worker" ? (
                  <Link
                    href="/worker/dashboard"
                    className={buttonClasses("secondary", "sm", "hidden sm:inline-flex")}
                  >
                    Worker portal
                  </Link>
                ) : (
                  <Link
                    href="/admin/dashboard"
                    className={buttonClasses("secondary", "sm", "hidden sm:inline-flex")}
                  >
                    Admin
                  </Link>
                )}
                <AccountMenu profile={profile} />
              </>
            ) : (
              <>
                <Link href="/auth" className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}>
                  Sign in
                </Link>
                <Link
                  href="/services"
                  className={buttonClasses("brand", "sm", "whitespace-nowrap px-3 sm:px-4")}
                >
                  Book<span className="hidden sm:inline"> a mistri</span>
                </Link>
              </>
            )}

            <MobileNav role={profile?.role ?? null} />
          </div>
        </div>
      </div>

      {isDemoMode() ? (
        <div className="border-b border-saffron-200 bg-saffron-50/90">
          <div className="container-page flex h-7 items-center justify-center gap-2 text-[10.5px] font-medium text-saffron-800">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-saffron-500" />
            Demo build — sample data, demo OTP 123456. Supabase setup is included in the repo.
          </div>
        </div>
      ) : null}
    </header>
  );
}
