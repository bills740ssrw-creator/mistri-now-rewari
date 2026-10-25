import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "brand" | "secondary" | "outline" | "ghost" | "danger" | "saffron";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-900 text-cream-50 hover:bg-ink-800 active:bg-ink-950 shadow-[0_10px_30px_-18px_rgba(10,22,17,0.7)]",
  brand:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[0_12px_30px_-16px_rgba(10,128,91,0.85)]",
  secondary:
    "bg-white text-ink-900 border border-ink-200 hover:border-ink-300 hover:bg-cream-50 shadow-[0_1px_2px_rgba(10,22,17,0.04)]",
  outline: "border border-ink-300 bg-transparent text-ink-900 hover:bg-white",
  ghost: "text-ink-600 hover:bg-ink-100/80 hover:text-ink-900",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  saffron: "bg-saffron-400 text-ink-950 hover:bg-saffron-300 shadow-[0_12px_30px_-16px_rgba(239,148,20,0.9)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-[3.25rem] px-7 text-[15px]",
  icon: "h-10 w-10",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

export type { Variant as ButtonVariant, Size as ButtonSize };
