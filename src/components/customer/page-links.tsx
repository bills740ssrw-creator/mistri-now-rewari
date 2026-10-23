import Link from "next/link";
import { ArrowUpRight, HelpCircle, Phone, ShieldCheck, Wrench } from "lucide-react";

const LINKS = [
  {
    href: "/how-it-works",
    icon: Wrench,
    title: "How it works",
    copy: "Slot, OTP, live tracking and payment — the full journey explained step by step.",
  },
  {
    href: "/why-mistri-now",
    icon: ShieldCheck,
    title: "Why Mistri Now",
    copy: "Aadhaar verification, fixed prices, a 7-day warranty and a real local support team.",
  },
  {
    href: "/support",
    icon: Phone,
    title: "Support",
    copy: "Call, WhatsApp or email us for bookings, refunds and warranty revisits.",
  },
];

export function PageLinks() {
  return (
    <section className="border-ink-100 border-y bg-white/60">
      <div className="container-page py-14 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-brand-700 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase">
              <HelpCircle className="h-3.5 w-3.5" />
              More about Mistri Now
            </p>
            <h2 className="font-display text-ink-950 mt-3 text-[28px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[34px]">
              Know before you book.
            </h2>
          </div>
          <p className="text-ink-500 max-w-sm text-[12.5px] leading-relaxed">
            Everything from how a mistri is verified to what happens if the same fault returns.
          </p>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group border-ink-100 hover:border-brand-200 hover:shadow-soft flex flex-col rounded-3xl border bg-white p-5 transition duration-300 hover:-translate-y-0.5"
            >
              <span className="bg-brand-50 text-brand-700 ring-brand-600/10 flex h-10 w-10 items-center justify-center rounded-2xl ring-1">
                <item.icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <span className="mt-4 flex items-center justify-between gap-2">
                <span className="font-display text-ink-950 text-[16.5px] font-bold">
                  {item.title}
                </span>
                <ArrowUpRight className="text-ink-300 group-hover:text-brand-700 h-4 w-4 transition" />
              </span>
              <span className="text-ink-500 mt-1.5 text-[12.5px] leading-relaxed">{item.copy}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
