"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogIn, Menu, Phone, X } from "lucide-react";
import { BRAND } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/why-mistri-now", label: "Why Mistri Now" },
  { href: "/support", label: "Support" },
];

export function MobileNav({ role }: { role: Role | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const account =
    role === "customer"
      ? { href: "/account", label: "My bookings" }
      : role === "worker"
        ? { href: "/worker/dashboard", label: "Worker portal" }
        : role === "admin"
          ? { href: "/admin/dashboard", label: "Admin dashboard" }
          : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="border-ink-200 text-ink-700 hover:border-brand-400 hover:text-brand-700 flex h-9 w-9 items-center justify-center rounded-full border bg-white transition lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[70] lg:hidden">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="bg-ink-950/45 absolute inset-0 h-full w-full cursor-default backdrop-blur-sm"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                className="bg-cream-50 absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col overflow-y-auto shadow-2xl"
              >
                <div className="border-ink-100 flex items-center justify-between border-b px-5 py-4">
                  <Logo onClick={() => setOpen(false)} />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    autoFocus
                    className="border-ink-200 text-ink-700 hover:border-brand-400 hover:text-brand-700 flex h-9 w-9 items-center justify-center rounded-full border bg-white transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav aria-label="Mobile" className="px-5 py-5">
                  <ul className="space-y-1">
                    {NAV.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex items-center justify-between rounded-2xl px-3.5 py-3 text-[14px] font-semibold transition",
                              active
                                ? "bg-brand-50 text-brand-800"
                                : "text-ink-700 hover:bg-ink-100/70 hover:text-ink-950",
                            )}
                          >
                            {item.label}
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-40" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="border-ink-100 mt-auto border-t px-5 py-5">
                  {account ? (
                    <Link
                      href={account.href}
                      onClick={() => setOpen(false)}
                      className="border-ink-200 text-ink-800 hover:border-brand-300 flex items-center justify-between rounded-2xl border bg-white px-4 py-3 text-[13.5px] font-semibold transition"
                    >
                      {account.label}
                      <ArrowUpRight className="text-ink-400 h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      onClick={() => setOpen(false)}
                      className="border-ink-200 text-ink-800 hover:border-brand-300 flex items-center justify-between rounded-2xl border bg-white px-4 py-3 text-[13.5px] font-semibold transition"
                    >
                      <span className="flex items-center gap-2">
                        <LogIn className="text-brand-700 h-4 w-4" />
                        Sign in or create account
                      </span>
                      <ArrowUpRight className="text-ink-400 h-4 w-4" />
                    </Link>
                  )}

                  <Link
                    href="/services"
                    onClick={() => setOpen(false)}
                    className={buttonClasses("brand", "md", "mt-3 w-full")}
                  >
                    Book a mistri
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>

                  <a
                    href={BRAND.phoneHref}
                    className="text-ink-600 hover:text-brand-700 mt-3 flex items-center justify-center gap-2 text-[12.5px] font-semibold transition"
                  >
                    <Phone className="text-brand-700 h-4 w-4" />
                    Call {BRAND.phoneDisplay}
                  </a>
                  <p className="text-ink-400 mt-1 text-center text-[10.5px]">{BRAND.hours}</p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
