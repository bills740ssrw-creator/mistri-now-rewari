import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, FileText, Scale, ShieldCheck, Undo2 } from "lucide-react";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";

const LEGAL_NAV = [
  { href: "/privacy", label: "Privacy policy", icon: ShieldCheck },
  { href: "/terms", label: "Terms of service", icon: Scale },
  { href: "/refund", label: "Cancellation & refunds", icon: Undo2 },
  { href: "/support", label: "Contact & support", icon: FileText },
];

export function LegalPage({
  title,
  description,
  updated,
  current,
  children,
}: {
  title: string;
  description: string;
  updated: string;
  current: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-ink-100 bg-white/60">
          <div className="container-page py-10 lg:py-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
              Legal &amp; policies
            </p>
            <h1 className="mt-3 font-display text-[34px] font-extrabold leading-[1.03] tracking-[-0.04em] text-ink-950 sm:text-[44px]">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink-600">{description}</p>
            <p className="mt-4 text-[11.5px] text-ink-400">Last updated {updated}</p>
          </div>
        </section>

        <div className="container-page grid gap-10 py-10 lg:grid-cols-[230px_1fr] lg:py-12">
          <aside className="lg:sticky lg:top-32 lg:h-fit">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-400">
              On this site
            </p>
            <nav className="mt-3 grid gap-1">
              {LEGAL_NAV.map((item) => {
                const active = current === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "flex items-center gap-2 rounded-xl bg-ink-950 px-3 py-2 text-[12px] font-semibold text-cream-50"
                        : "flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-medium text-ink-600 transition hover:bg-white hover:text-ink-900"
                    }
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-5 rounded-2xl border border-saffron-200 bg-saffron-50/70 p-3.5">
              <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-saffron-800">
                <AlertTriangle className="h-3 w-3" /> Draft for attorney review
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-saffron-900/75">
                These policies are good-faith drafts for the Rewari launch. Have an Indian advocate
                review them before accepting real payments.
              </p>
            </div>
          </aside>

          <article className="prose-legal max-w-3xl text-[13.5px]">
            <div className="mb-7 rounded-2xl border border-ink-100 bg-white p-4 text-[12px] leading-relaxed text-ink-500">
              <span className="font-semibold text-ink-800">Plain-language summary.</span> Mistri Now
              Rewari is a booking platform operated by Lakshya Yadav Enterprises. Independent,
              Aadhaar-verified professionals perform the services. We use your details to run the
              booking, show fixed prices, support you after the job, and meet our legal duties. We do
              not sell your data.
            </div>
            {children}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
