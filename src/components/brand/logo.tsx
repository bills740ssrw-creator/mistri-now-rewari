import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-10 w-10", className)}
      role="img"
      aria-label="Mistri Now Rewari logo"
    >
      <defs>
        <linearGradient id="mn-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a805b" />
          <stop offset="100%" stopColor="#084434" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12.5" fill="url(#mn-mark)" />
      <path
        d="M9.5 28V14.2l6.1 6.2 4.4-4.4 4.4 4.4 6.1-6.2V28"
        fill="none"
        stroke="#fdfbf6"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="29.6" cy="11.2" r="3.1" fill="#f6b233" stroke="#fdfbf6" strokeWidth="1.1" />
    </svg>
  );
}

export function Logo({
  href = "/",
  compact = false,
  light = false,
  className,
  onClick,
}: {
  href?: string;
  compact?: boolean;
  light?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Mistri Now Rewari home"
    >
      <LogoMark className="h-10 w-10 transition-transform duration-300 group-hover:-rotate-3" />
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[19px] font-extrabold tracking-[-0.04em]",
              light ? "text-cream-50" : "text-ink-900",
            )}
          >
            Mistri Now
            <span className={light ? "text-brand-300" : "text-brand-600"}> Rewari</span>
          </span>
          <span
            className={cn(
              "mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.16em] sm:block",
              light ? "text-cream-200/70" : "text-ink-400",
            )}
          >
            A unit of Lakshya Yadav Enterprises
          </span>
        </span>
      ) : null}
    </Link>
  );
}
