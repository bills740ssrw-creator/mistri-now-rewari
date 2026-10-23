import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Clock3, MapPin, ShieldCheck, Star, Wallet } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import { portalHome, safeNextPath } from "@/lib/auth/paths";
import { isDemoMode } from "@/lib/session";
import { BRAND } from "@/lib/constants";
import { Logo } from "@/components/brand/logo";
import { AuthFlow } from "@/components/customer/auth-flow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Mistri Now Rewari with your mobile number to book a verified professional.",
  robots: { index: false },
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, profile] = await Promise.all([searchParams, getCurrentProfile()]);
  const safeNext = safeNextPath(next);
  if (profile) redirect(safeNext ?? portalHome(profile));

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink-950 text-cream-50 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(253,251,246,0.7) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          aria-hidden
          className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-saffron-400/15 blur-3xl"
        />

        <div className="relative p-10 xl:p-14">
          <Logo light />
          <div className="mt-20 max-w-md">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
              <MapPin className="h-3.5 w-3.5" /> Made for Rewari
            </p>
            <h2 className="mt-4 font-display text-[44px] font-extrabold leading-[1.0] tracking-[-0.045em] xl:text-[52px]">
              Ghar ka kaam,
              <br />
              <span className="text-brand-300">ghar pe.</span>
            </h2>
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-cream-200/65">
              One verified mistri for every repair — plumbing, electrical, AC, RO and more. Fixed
              prices, live tracking and a 7-day warranty.
            </p>

            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-cream-100/10 bg-white/[0.04] p-4 backdrop-blur">
              <div className="flex -space-x-2">
                {["Anjali Sharma", "Rohit Verma", "Imran Khan"].map((name) => (
                  <span
                    key={name}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink-950 bg-brand-200 text-[10px] font-bold text-brand-900"
                  >
                    {name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-saffron-300">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3 w-3 fill-current" />
                  ))}
                  <span className="ml-1 text-[11px] font-bold text-cream-50">4.9</span>
                </div>
                <p className="text-[11px] text-cream-200/55">
                  Trusted by 312 households across Rewari
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-3 p-10 pt-0 text-[11px] xl:p-14 xl:pt-0">
          {[
            { icon: ShieldCheck, label: "Aadhaar verified" },
            { icon: Clock3, label: "~58 min response" },
            { icon: Wallet, label: "Pay after service" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-xl border border-cream-100/10 px-3 py-2.5 text-cream-200/70"
            >
              <item.icon className="h-3.5 w-3.5 shrink-0 text-brand-300" />
              {item.label}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex flex-col bg-cream-50">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 transition hover:text-ink-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
          <div className="lg:hidden">
            <Logo />
          </div>
          <a
            href={BRAND.phoneHref}
            className="hidden text-[12.5px] font-semibold text-ink-700 transition hover:text-brand-700 sm:block"
          >
            Need help? {BRAND.phoneDisplay}
          </a>
        </div>

        <div className="flex flex-1 items-start justify-center px-5 pb-12 sm:items-center sm:px-8">
          <div className="w-full max-w-md">
            <AuthFlow next={safeNext ?? undefined} demo={isDemoMode()} />
          </div>
        </div>
      </main>
    </div>
  );
}
