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
import { cn } from "@/lib/utils/cn";

import { AnnouncementBarFrame, resolveAnnouncementBarPalette } from "@/components/templates/announcement-bar/announcement-bar-frame";

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

  const { items, appearance } = module;
  const palette = resolveAnnouncementBarPalette(appearance);
  if (items.length === 0) return null;

  return (
    <AnnouncementBarFrame
      appearance={appearance}
      role="region"
      ariaLabel="Beneficios destacados"
      dataTemplate="announcement-bar-badges"
      contentClassName="justify-center"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {items.map((item, idx) => {
          const Icon = ICON_MAP[item.icon] ?? DEFAULT_ICON;
          return (
            <span key={idx} className="inline-flex min-h-9 items-center gap-2">
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium leading-tight">{item.label}</span>
              {item.description ? (
                <span className={cn("text-[11px] leading-tight")} style={palette.mutedText}>
                  {item.description}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </AnnouncementBarFrame>
  );
}
