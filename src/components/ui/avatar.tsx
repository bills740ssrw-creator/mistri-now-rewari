import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

function hueFor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return hash;
}

export function Avatar({
  name,
  size = "md",
  className,
  online,
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  online?: boolean;
}) {
  const hue = hueFor(name);
  const sizes = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-[13px]",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  } as const;

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-display font-bold tracking-tight ring-1 ring-black/5",
          sizes[size],
        )}
        style={{
          background: `linear-gradient(145deg, hsl(${hue} 45% 88%), hsl(${(hue + 38) % 360} 55% 72%))`,
          color: `hsl(${hue} 45% 24%)`,
        }}
        aria-hidden
      >
        {initials(name) || "MN"}
      </span>
      {online ? (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      ) : null}
    </span>
  );
}
