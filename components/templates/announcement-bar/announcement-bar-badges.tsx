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
import { themeTypographyStyles } from "@/lib/theme/typography";

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

  const { heading, detail, items, appearance } = module;
  const palette = resolveAnnouncementBarPalette(appearance);
  if (items.length === 0) return null;

  return (
    <AnnouncementBarFrame
      appearance={appearance}
      role="region"
      ariaLabel="Beneficios destacados"
      dataTemplate="announcement-bar-badges"
      contentClassName="flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-between"
    >
      {(heading || detail) ? (
        <div className="flex min-w-0 flex-col items-center justify-center gap-1 text-center sm:items-start sm:text-left">
          {heading ? (
            <span
              className={themeTypographyStyles.kicker("text-[10px]")}
              style={palette.mutedText}
            >
              {heading}
            </span>
          ) : null}
          {detail ? <span className={themeTypographyStyles.label("text-sm normal-case")}>{detail}</span> : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-wrap items-center justify-center gap-2.5 sm:justify-end">
        {items.map((item, idx) => {
          const Icon = ICON_MAP[item.icon] ?? DEFAULT_ICON;
          return (
            <span
              key={idx}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-1.5"
              style={palette.chipSoft}
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full border"
                style={palette.chip}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className={themeTypographyStyles.label("text-xs tracking-[0.16em]")}>{item.label}</span>
                {item.description ? (
                  <span className={cn("text-[11px] leading-tight")} style={palette.mutedText}>
                    {item.description}
                  </span>
                ) : null}
              </span>
            </span>
          );
        })}
      </div>
    </AnnouncementBarFrame>
  );
}
