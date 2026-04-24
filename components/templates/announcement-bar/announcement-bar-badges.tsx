import {
  Truck,
  Shield,
  CreditCard,
  Star,
  Clock,
  Package,
  BadgeCheck,
  Headphones,
  RefreshCw,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";

const ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck,
  shield: Shield,
  "credit-card": CreditCard,
  star: Star,
  clock: Clock,
  package: Package,
  "badge-check": BadgeCheck,
  headphones: Headphones,
  "refresh-cw": RefreshCw,
  zap: Zap,
};

const DEFAULT_ICON = BadgeCheck;

/**
 * AnnouncementBarBadges — fila de íconos con texto corto.
 * Transmite confianza de un vistazo (envío / garantía / cuotas).
 */
export function AnnouncementBarBadges({ module }: { module: AnnouncementBarModule }) {
  if (module.variant !== "badges") return null;

  const { items } = module;
  if (items.length === 0) return null;

  return (
    <div
      role="banner"
      aria-label="Beneficios"
      data-template="announcement-bar-badges"
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-b border-border bg-panel px-4 py-2.5"
    >
      {items.map((item, idx) => {
        const Icon = ICON_MAP[item.icon] ?? DEFAULT_ICON;
        return (
          <span
            key={idx}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground"
          >
            <div className="flex size-4 shrink-0 items-center justify-center text-accent">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
