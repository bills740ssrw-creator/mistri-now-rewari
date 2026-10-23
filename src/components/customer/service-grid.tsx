"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Clock3, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import type { Role, Service, ServiceCategory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/constants";
import { serviceSearchText } from "@/lib/booking";
import { formatINR } from "@/lib/format";
import { ServiceIcon } from "@/components/ui/service-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookingDialog } from "@/components/customer/booking-dialog";

type Filter = "all" | ServiceCategory;

const FILTERS: Filter[] = ["all", "plumbing", "electrical", "cooling", "appliance", "fabrication"];

export function ServiceGrid({
  services,
  role,
  presetServiceId,
}: {
  services: Service[];
  role: Role | null;
  presetServiceId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Service | null>(
    () => services.find((service) => service.id === presetServiceId) ?? null,
  );
  const [dialogOpen, setDialogOpen] = useState(Boolean(presetServiceId));
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return services.filter((service) => {
      if (filter !== "all" && service.category !== filter) return false;
      if (!needle) return true;
      return serviceSearchText(service).includes(needle) || String(service.price).includes(needle);
    });
  }, [services, filter, deferredQuery]);

  function beginBooking(service: Service) {
    if (!role) {
      router.push(`/auth?next=${encodeURIComponent(`${pathname}?book=${service.id}`)}`);
      return;
    }
    if (role !== "customer") {
      toast.error("Bookings are placed from a customer account. Sign in as a customer to continue.");
      return;
    }
    setActive(service);
    setDialogOpen(true);
  }

  return (
    <section id="services" className="container-page scroll-mt-24 py-16 lg:py-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <Badge tone="brand">
            <Sparkles className="h-3 w-3" /> Fixed-price catalogue
          </Badge>
          <h2 className="mt-4 font-display text-[32px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink-950 sm:text-[44px]">
            One price. No “extra lagega”.
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-600">
            The visit charge is final and shown upfront. If a spare part is needed, it is added to
            your bill only after you approve it — never in secret.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3 text-[11.5px] text-ink-500">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
          <p>
            <span className="block font-semibold text-ink-900">7-day workmanship warranty</span>
            on every booking, no extra charge.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search — AC, plumber, RO, washing machine…"
            aria-label="Search services"
            className="h-11 w-full rounded-full border border-ink-200 bg-white pl-10 pr-10 text-[13.5px] text-ink-900 placeholder:text-ink-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {FILTERS.map((item) => {
            const label = item === "all" ? "All services" : CATEGORY_META[item].label;
            const selected = filter === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(item)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition",
                  selected
                    ? "border-ink-950 bg-ink-950 text-cream-50"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center">
          <p className="font-display text-lg font-bold text-ink-900">No service matches that.</p>
          <p className="mt-1 text-[13px] text-ink-500">
            Try “AC”, “leak” or clear the filters. Or call us and we&apos;ll help.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-4 rounded-full bg-ink-950 px-4 py-2 text-[12.5px] font-semibold text-cream-50"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((service, index) => {
            const popular = service.badge?.toLowerCase().includes("popular");
            return (
              <article
                key={service.id}
                className={cn(
                  "group flex flex-col rounded-3xl border bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift",
                  popular
                    ? "border-saffron-300/70 bg-gradient-to-b from-saffron-50/70 to-white ring-1 ring-saffron-400/20"
                    : "border-ink-100",
                )}
                style={{ animationDelay: `${Math.min(index, 7) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ring-1",
                      CATEGORY_META[service.category].tint,
                      CATEGORY_META[service.category].ring,
                    )}
                  >
                    <ServiceIcon name={service.icon} className="h-5 w-5" />
                  </span>
                  {service.badge ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em]",
                        popular
                          ? "bg-saffron-400 text-ink-950"
                          : "bg-brand-50 text-brand-700 ring-1 ring-brand-600/15",
                      )}
                    >
                      {service.badge}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 font-display text-[17px] font-bold leading-tight tracking-tight text-ink-950">
                  {service.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-500">
                  {service.description}
                </p>

                <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-400">
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3" />
                    {service.durationMins} min
                  </span>
                  <span className="h-1 w-1 rounded-full bg-ink-300" />
                  <span>{CATEGORY_META[service.category].short}</span>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-dashed border-ink-100 pt-4">
                  <div>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                      Visit charge
                    </p>
                    <p className="font-display text-[21px] font-extrabold leading-none tracking-tight text-ink-950">
                      {formatINR(service.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => beginBooking(service)}
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-ink-950 px-3.5 text-[12px] font-semibold text-cream-50 transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                  >
                    Book
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-[11.5px] text-ink-400">
        Prices are per visit and include inspection. Spare parts and additional material are billed
        separately with your approval. Showing {filtered.length} of {services.length} services.
      </p>

      {active ? (
        <BookingDialog
          key={active.id}
          service={active}
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            if (presetServiceId) router.replace(`${pathname}#services`, { scroll: false });
          }}
        />
      ) : null}
    </section>
  );
}
