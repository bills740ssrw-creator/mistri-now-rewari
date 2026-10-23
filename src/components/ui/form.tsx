import type {
  ComponentPropsWithRef,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 placeholder:text-ink-400 transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-cream-100";

export function Input({ className, ...props }: ComponentPropsWithRef<"input">) {
  return <input className={cn(fieldBase, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-[104px] resize-y py-3", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        fieldBase,
        "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%235b7263%22 stroke-width=%222%22 viewBox=%220 0 24 24%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_1rem_center] bg-no-repeat pr-10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink-800">
          {label}
        </label>
        {optional ? <span className="text-[11px] text-ink-400">Optional</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-[12px] font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-ink-600", className)}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-ink-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
