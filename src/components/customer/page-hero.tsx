import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  stats,
  current,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  stats?: { label: string; value: string }[];
  current: string;
}) {
  return (
    <section className="border-ink-100 relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(173,233,209,0.42),transparent_55%),radial-gradient(ellipse_at_85%_10%,rgba(251,221,152,0.32),transparent_50%)]"
      />
      <div className="container-page relative grid gap-10 py-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:py-14">
        <div>
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="text-ink-400 flex items-center gap-1.5 text-[11px] font-medium">
              <li>
                <Link href="/" className="hover:text-ink-800 transition">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <li aria-current="page" className="text-ink-700">
                {current}
              </li>
            </ol>
          </nav>

          <p className="text-brand-700 text-[11px] font-semibold tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
          <h1 className="font-display text-ink-950 mt-3 max-w-3xl text-[36px] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-[48px] lg:text-[54px]">
            {title}
          </h1>
          <p className="text-ink-600 mt-4 max-w-xl text-[14px] leading-relaxed sm:text-[15px]">
            {description}
          </p>
          {actions ? <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>

        {stats?.length ? (
          <div
            className={
              stats.length === 2
                ? "grid grid-cols-2 gap-2.5"
                : "grid grid-cols-3 gap-2.5 lg:grid-cols-1"
            }
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-ink-100 rounded-2xl border bg-white/85 px-4 py-3.5 shadow-[0_1px_2px_rgba(10,22,17,0.03)] backdrop-blur"
              >
                <p className="font-display text-ink-950 text-[18px] leading-none font-extrabold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-ink-400 mt-1.5 text-[10.5px] tracking-[0.08em] uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
