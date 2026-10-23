"use client";

import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideClose?: boolean;
}) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previousFocus = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(
        "input:not([type=hidden]), select, textarea, button",
      );
      target?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
      previousFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const widths = {
    sm: "sm:max-w-md",
    md: "sm:max-w-xl",
    lg: "sm:max-w-3xl",
    xl: "sm:max-w-5xl",
  } as const;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-ink-950/45 backdrop-blur-[3px] animate-[fade-in_.2s_ease-out]"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-ink-100 bg-cream-50 shadow-2xl animate-[fade-up_.35s_cubic-bezier(.16,1,.3,1)] sm:rounded-[28px]",
          widths[size],
        )}
      >
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-ink-100/80 bg-cream-50/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-ink-900 sm:text-xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>
            ) : null}
          </div>
          {!hideClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 border-t border-ink-100/80 bg-cream-50/95 px-5 py-4 backdrop-blur sm:px-7">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
