import {
  Ruler,
  Zap,
  ShieldCheck,
  Wrench,
  Truck,
  Users,
  Cog,
  Factory,
  ClipboardList,
  Hammer
} from "lucide-react";

const icons = {
  Ruler,
  Zap,
  ShieldCheck,
  Wrench,
  Truck,
  Users,
  Cog,
  Factory,
  ClipboardList,
  Hammer
} as const;

export type IconName = keyof typeof icons;

export function getIconByName(name?: string) {
  if (!name) return Wrench;
  return icons[name as IconName] ?? Wrench;
}
