import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Wrench,
} from "lucide-react";
import { BRAND } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(173,233,209,0.45),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(251,221,152,0.35),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full border border-brand-200/60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] top-[-10%] h-[420px] w-[420px] rounded-full bg-brand-100/40 blur-3xl"
      />

      <div className="container-page relative grid items-center gap-14 pb-10 pt-12 lg:grid-cols-[1.03fr_0.97fr] lg:pb-16 lg:pt-20">
        <div className="animate-[fade-up_.7s_cubic-bezier(.16,1,.3,1)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-200/80 bg-white/80 px-3.5 py-1.5 text-[11.5px] font-semibold text-ink-700 shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            Serving Rewari · 7 AM – 9 PM, all days
          </span>

          <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink-950 sm:text-[56px] lg:text-[64px]">
            Ghar ki har repair,
            <br />
            ab{" "}
            <span className="relative inline-block whitespace-nowrap text-brand-700">
              ek tap dur
              <svg
                aria-hidden
                viewBox="0 0 240 14"
                className="absolute -bottom-1 left-0 w-full text-saffron-400"
                fill="none"
              >
                <path
                  d="M3 10.5C52 8 124 4 236 6.5"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-600 sm:text-base">
            Verified plumbers, electricians, RO and AC technicians at your door in about an hour.
            Fixed prices, no surprise bills, and a 7-day service warranty on every job.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/services" className={buttonClasses("brand", "lg")}>
              Book a service
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={BRAND.phoneHref} className={buttonClasses("secondary", "lg")}>
              <Phone className="h-4 w-4 text-brand-700" />
              {BRAND.phoneDisplay}
            </a>
            {!signedIn ? (
              <Link
                href="/auth"
                className="text-[13px] font-semibold text-ink-600 underline decoration-ink-300 decoration-1 underline-offset-4 transition hover:text-ink-900"
              >
                Join as a professional
              </Link>
            ) : null}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["Anjali Sharma", "Rohit Verma", "Priya Singh"].map((name) => (
                  <Avatar key={name} name={name} size="sm" className="ring-2 ring-cream-50" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-saffron-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="ml-1 text-[12px] font-bold text-ink-900">4.9</span>
                </div>
                <p className="text-[11.5px] text-ink-500">from 312 Rewari households</p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-ink-200 sm:block" />
            <div className="flex items-center gap-2 text-[12px] text-ink-600">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              Aadhaar &amp; background verified
            </div>
          </div>
        </div>

        <LiveJobCard />
      </div>

      <div className="container-page relative">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-ink-100 py-3.5 text-[11.5px] text-ink-500">
          <span className="flex items-center gap-1.5 font-semibold text-ink-700">
            <MapPin className="h-3.5 w-3.5 text-brand-600" />
            Serving
          </span>
          {["Model Town", "Sector 4", "Circular Road", "New Colony", "Bawal Road", "Housing Board Colony"].map(
            (area) => (
              <span key={area}>{area}</span>
            ),
          )}
          <span className="ml-auto hidden items-center gap-1.5 font-medium text-brand-700 sm:flex">
            <Clock3 className="h-3.5 w-3.5" /> Average response 58 minutes
          </span>
        </div>
      </div>
    </section>
  );
}

function LiveJobCard() {
  return (
    <div className="relative mx-auto w-full max-w-[430px] animate-[fade-up_.8s_cubic-bezier(.16,1,.3,1)_.1s]">
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[44px] bg-gradient-to-br from-brand-200/50 via-cream-100/30 to-saffron-100/40 blur-2xl"
      />

      <div className="relative rounded-[30px] border border-white/80 bg-white/95 p-5 shadow-lift backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700 ring-1 ring-brand-600/15">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />
            Live job
          </span>
          <span className="font-mono text-[10.5px] tracking-wide text-ink-400">MRW-8C21F4</span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
              AC Gas Filling
            </p>
            <p className="mt-1 font-display text-[26px] font-extrabold tracking-tight text-ink-950">
              ₹3,399
              <span className="ml-1.5 align-middle text-[11px] font-semibold text-ink-400">
                fixed
              </span>
            </p>
          </div>
          <span className="rounded-full bg-saffron-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-saffron-700 ring-1 ring-saffron-600/20">
            Most popular
          </span>
        </div>

        <div className="mt-5 space-y-0 rounded-2xl bg-cream-50/80 p-4 ring-1 ring-ink-100/70">
          <TimelineRow icon="check" title="Booking confirmed" time="10:42 AM" done />
          <TimelineRow icon="user" title="Imran assigned" time="10:49 AM" done />
          <TimelineRow icon="nav" title="On the way" time="ETA 22 min" active last />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name="Imran Khan" size="md" online />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-ink-900">Imran Khan</p>
              <p className="flex items-center gap-1 text-[11px] text-ink-500">
                <Star className="h-3 w-3 fill-saffron-400 text-saffron-400" />
                4.9 · 428 jobs · AC specialist
              </p>
            </div>
          </div>
          <a
            href={BRAND.phoneHref}
            aria-label="Call your professional"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700"
          >
            <Phone className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-ink-500">
          <span className="flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-brand-600" />
            Model Town, Rewari
          </span>
          <span className="flex items-center gap-1.5 font-medium text-ink-700">
            <Wallet className="h-3.5 w-3.5" /> Pay after service
          </span>
        </div>
      </div>

      <div className="absolute -right-3 -top-4 hidden rotate-3 items-center gap-1.5 rounded-full bg-saffron-400 px-3.5 py-2 text-[11px] font-bold text-ink-950 shadow-lg sm:flex">
        <BadgeCheck className="h-3.5 w-3.5" />
        7-day warranty
      </div>
      <div className="absolute -bottom-4 -left-3 hidden -rotate-2 items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-brand-700 shadow-lg sm:flex">
        <ShieldCheck className="h-3.5 w-3.5" />
        Aadhaar verified pro
      </div>
    </div>
  );
}

function TimelineRow({
  icon,
  title,
  time,
  done,
  active,
  last,
}: {
  icon: "check" | "user" | "nav";
  title: string;
  time: string;
  done?: boolean;
  active?: boolean;
  last?: boolean;
}) {
  const Icon = icon === "check" ? Check : icon === "user" ? BadgeCheck : Navigation;
  return (
    <div className="relative flex items-start gap-3 pb-4 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className={`absolute left-[11px] top-6 h-full w-px ${active ? "bg-gradient-to-b from-brand-400 to-ink-200" : "bg-ink-200"}`}
        />
      ) : null}
      <span
        className={`relative z-10 mt-0.5 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full ${
          active
            ? "bg-brand-600 text-white shadow-[0_0_0_4px_rgba(21,159,114,0.14)]"
            : done
              ? "bg-brand-100 text-brand-700"
              : "bg-ink-100 text-ink-400"
        }`}
      >
        <Icon className="h-3 w-3" />
      </span>
      <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
        <p
          className={`text-[12.5px] ${active ? "font-bold text-ink-900" : "font-medium text-ink-600"}`}
        >
          {title}
        </p>
        <p className={`shrink-0 text-[10.5px] ${active ? "font-semibold text-brand-700" : "text-ink-400"}`}>
          {time}
        </p>
      </div>
    </div>
  );
}

export function TrustStrip() {
  const items = [
    {
      icon: Clock3,
      title: "1-hour instant service",
      copy: "Most jobs start within 60 minutes. Pick a slot and we hold it.",
    },
    {
      icon: ShieldCheck,
      title: "7-day service warranty",
      copy: "If the same issue returns within a week, we fix it free.",
    },
    {
      icon: BadgeCheck,
      title: "Licensed & guaranteed pros",
      copy: "Aadhaar-checked technicians, rated by real Rewari customers.",
    },
  ];

  return (
    <section className="container-page py-12 lg:py-16">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-3xl border border-ink-100 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-soft"
          >
            <span
              aria-hidden
              className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-50 transition-transform duration-300 group-hover:scale-125"
            />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-600/10">
              <item.icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <h3 className="relative mt-4 font-display text-[17px] font-bold text-ink-900">
              {item.title}
            </h3>
            <p className="relative mt-1.5 text-[13px] leading-relaxed text-ink-500">{item.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Pick a service & slot",
      copy: "Choose the repair, your address and a one-hour window — 7 AM to 9 PM.",
      icon: Wrench,
    },
    {
      number: "02",
      title: "A verified mistri accepts",
      copy: "The nearest available professional in your trade accepts the job. You see their name, rating and phone.",
      icon: BadgeCheck,
    },
    {
      number: "03",
      title: "Track, verify, relax",
      copy: "Follow the live timeline, share the start OTP, and pay only after the work is done.",
      icon: Sparkles,
    },
  ];

  return (
    <section id="how-it-works" className="border-y border-ink-100 bg-white/70">
      <div className="container-page py-16 lg:py-20">
        <div className="max-w-2xl">
          <Badge tone="brand">How it works</Badge>
          <h2 className="mt-4 font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink-950 sm:text-[42px]">
            From “bijli ka issue hai”
            <br />
            to fixed — in three steps.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative rounded-3xl border border-ink-100 bg-white p-6 shadow-[0_1px_2px_rgba(10,22,17,0.03)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-brand-600">
                  {step.number}
                </span>
                <step.icon className="h-5 w-5 text-ink-300" strokeWidth={1.7} />
              </div>
              <h3 className="mt-6 font-display text-[19px] font-bold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{step.copy}</p>
              {index < steps.length - 1 ? (
                <ArrowRight
                  aria-hidden
                  className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-cream-50 p-0.5 text-ink-300 lg:block"
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-4 rounded-3xl bg-ink-950 px-6 py-6 text-cream-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
              <Phone className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-cream-50">
                Not sure what the problem is?
              </p>
              <p className="text-[12px] text-cream-200/60">
                Call us — we&apos;ll help you pick the right service.
              </p>
            </div>
          </div>
          <a
            href={BRAND.phoneHref}
            className={buttonClasses("saffron", "sm", "shrink-0")}
          >
            Call {BRAND.phoneDisplay}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function Guarantee() {
  const promises = [
    "The price you see is the price you pay — parts are quoted before fitting.",
    "Every professional is Aadhaar-verified and rated after each job.",
    "Start and finish OTPs so the wrong person can never close your job.",
    "7-day warranty on workmanship, with support a phone call away.",
    "Pay by UPI or cash after the service — never in advance.",
  ];

  return (
    <section id="why-us" className="container-page py-16 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Badge tone="saffron">The Mistri Now promise</Badge>
          <h2 className="mt-4 font-display text-[32px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink-950 sm:text-[44px]">
            Local trust,
            <br />
            <span className="text-brand-700">written down.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-ink-600">
            We built Mistri Now for our own neighbourhood in Rewari. No call-centre runaround, no
            “extra charge lagega bhaiya” at the door. Just clear pricing and a mistri you can call
            again.
          </p>

          <ul className="mt-7 space-y-3">
            {promises.map((promise) => (
              <li key={promise} className="flex items-start gap-3 text-[13.5px] text-ink-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {promise}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/services" className={buttonClasses("primary", "md")}>
              See fixed prices
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/support" className={buttonClasses("outline", "md")}>
              Talk to support
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-brand-100/60 via-transparent to-saffron-100/50 blur-xl" />
          <div className="relative rounded-[32px] border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400">
                Sample bill
              </p>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                Transparent
              </span>
            </div>
            <div className="mt-5 space-y-3 text-[13.5px]">
              <BillRow label="AC Gas Filling (fixed)" value="₹3,399" />
              <BillRow label="Copper pipe (optional)" value="₹350" />
              <BillRow label="Visiting / inspection" value="₹0" muted />
              <div className="border-t border-dashed border-ink-200 pt-3">
                <BillRow label="Total after approval" value="₹3,749" strong />
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-cream-50 p-4 text-[12px] leading-relaxed text-ink-500 ring-1 ring-ink-100">
              <span className="font-semibold text-ink-800">Never a surprise.</span> Spare parts are
              added to the live bill only after you approve them — you can see the running total on
              your booking page.
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Response", value: "~58 min" },
                { label: "Warranty", value: "7 days" },
                { label: "Support", value: "7 AM–9 PM" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white px-2 py-3 ring-1 ring-ink-100">
                  <p className="font-display text-[15px] font-extrabold text-ink-900">{stat.value}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BillRow({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={muted ? "text-ink-400" : "text-ink-600"}>{label}</span>
      <span
        className={
          strong
            ? "font-display text-[19px] font-extrabold text-ink-950"
            : muted
              ? "font-medium text-ink-400"
              : "font-semibold text-ink-900"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function Testimonials() {
  const reviews = [
    {
      quote:
        "AC gas filling ke liye subah book kiya. Imran bhai 40 minute mein aa gaye, leak bhi check kiya. Bill bilkul wahi tha jo app pe dikha tha.",
      name: "Anjali Sharma",
      area: "Model Town",
      service: "AC Gas Filling",
    },
    {
      quote:
        "Sunday ko plumber chahiye tha. Ek call pe mistri mil gaya aur kaam bhi saaf kiya. Warranty ke liye next week call bhi aaya.",
      name: "Rohit Verma",
      area: "Sector 4",
      service: "Plumber",
    },
    {
      quote:
        "Shop ka electrical kaam karwaya. Proper receipt mili, extra paisa nahi liya. Rewari mein aisi service pehle nahi mili.",
      name: "Priya Singh",
      area: "Circular Road",
      service: "Electrician",
    },
  ];

  return (
    <section className="border-y border-ink-100 bg-cream-100/50">
      <div className="container-page py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Badge tone="ink">Neighbourhood reviews</Badge>
            <h2 className="mt-4 font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink-950 sm:text-[40px]">
              Word travels fast in Rewari.
            </h2>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-3">
            <div className="flex items-center gap-1 text-saffron-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">4.9 / 5</p>
              <p className="text-[11px] text-ink-500">312 verified reviews</p>
            </div>
          </div>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.name}
              className="flex flex-col rounded-3xl border border-ink-100 bg-white p-6 shadow-[0_1px_2px_rgba(10,22,17,0.03)]"
            >
              <Quote className="h-5 w-5 text-brand-300" />
              <blockquote className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-700">
                “{review.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                <Avatar name={review.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink-900">{review.name}</p>
                  <p className="truncate text-[11px] text-ink-500">
                    {review.area} · {review.service}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CoverageCta() {
  return (
    <section className="container-page py-16 lg:py-20">
      <div className="relative overflow-hidden rounded-[36px] bg-ink-950 px-6 py-12 text-cream-50 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(253,251,246,0.6) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl"
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300">
              <MapPin className="h-3.5 w-3.5" /> Rewari, Haryana
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-[32px] font-extrabold leading-[1.03] tracking-[-0.035em] sm:text-[46px]">
              Something broken?
              <br />
              Let&apos;s get a mistri to your door.
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-cream-200/65">
              Book online in two minutes or call us directly. Slots run from 7 AM to 9 PM, every
              day of the week.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/services" className={buttonClasses("saffron", "lg")}>
                Book a service
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={BRAND.phoneHref} className={buttonClasses("outline", "lg", "border-cream-100/25 text-cream-50 hover:bg-white/10")}>
                <Phone className="h-4 w-4" />
                {BRAND.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { icon: Clock3, label: "Open all 7 days", value: "7 AM – 9 PM" },
              { icon: Wallet, label: "Pay after service", value: "UPI or cash" },
              { icon: ShieldCheck, label: "Every job covered", value: "7-day warranty" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-cream-100/10 bg-white/[0.04] px-4 py-3.5 backdrop-blur"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12px] text-cream-200/55">{item.label}</p>
                  <p className="text-[13.5px] font-semibold text-cream-50">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
