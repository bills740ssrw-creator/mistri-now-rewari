"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/why-mistri-now", label: "Why Mistri Now" },
  { href: "/support", label: "Support" },
];

export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav className="text-ink-700 hidden items-center gap-4 text-[17px] font-semibold tracking-[-0.01em] whitespace-nowrap lg:flex xl:gap-6 xl:text-[18px]">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={active}
            aria-current={active ? "page" : undefined}
            className="nav-link hover:text-ink-950 data-[active=true]:text-ink-950 transition-colors"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
