"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export function AccountMenu({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links =
    profile.role === "admin"
      ? [
          { href: "/admin/dashboard", label: "Admin console", icon: ShieldCheck },
          { href: "/", label: "Customer site", icon: UserRound },
        ]
      : profile.role === "worker"
        ? [
            { href: "/worker/dashboard", label: "Worker dashboard", icon: LayoutDashboard },
            { href: "/", label: "Customer site", icon: UserRound },
          ]
        : [
            { href: "/account", label: "My bookings", icon: ClipboardList },
            { href: "/services", label: "Book a service", icon: UserRound },
          ];

  const signOut = () => {
    startTransition(async () => {
      const result = await logoutAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-2.5 transition hover:border-ink-300"
      >
        <Avatar name={profile.fullName} size="sm" />
        <span className="hidden max-w-[92px] truncate text-[13px] font-semibold text-ink-800 sm:block">
          {profile.fullName.split(" ")[0]}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-ink-400 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift animate-[pop_.18s_ease-out]"
        >
          <div className="border-b border-ink-100 bg-cream-50 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink-900">{profile.fullName}</p>
            <p className="mt-0.5 text-[12px] text-ink-500">
              {profile.role === "worker"
                ? profile.status === "ACTIVE"
                  ? `Verified ${profile.serviceCategory ?? "professional"}`
                  : "Verification in progress"
                : profile.role === "admin"
                  ? "Platform administrator"
                  : "Mistri Now customer"}
            </p>
          </div>
          <div className="p-1.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink-700 transition hover:bg-cream-100"
              >
                <link.icon className="h-4 w-4 text-ink-400" />
                {link.label}
              </Link>
            ))}
            <a
              href={`tel:+91${"8307121221"}`}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink-700 transition hover:bg-cream-100"
            >
              <Phone className="h-4 w-4 text-ink-400" />
              Call support
            </a>
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              disabled={pending}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {pending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
