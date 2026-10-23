import {
  Droplets,
  Filter,
  Flame,
  Snowflake,
  WashingMachine,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ServiceIcon as ServiceIconKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<ServiceIconKey, LucideIcon> = {
  wrench: Wrench,
  zap: Zap,
  droplets: Droplets,
  "washing-machine": WashingMachine,
  flame: Flame,
  filter: Filter,
  snowflake: Snowflake,
  wind: Wind,
};

export function ServiceIcon({
  name,
  className,
}: {
  name: ServiceIconKey;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Wrench;
  return <Icon className={cn("h-6 w-6", className)} strokeWidth={1.8} aria-hidden />;
}
