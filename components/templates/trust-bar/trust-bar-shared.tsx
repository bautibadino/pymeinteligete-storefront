"use client";

import {
  BadgeCheck,
  Clock,
  CreditCard,
  Headset,
  Package,
  RefreshCw,
  Shield,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useReducedMotion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils/cn";
import type { TrustBarModule } from "@/lib/modules/trust-bar";

export const TRUST_BAR_ICON_MAP: Record<TrustBarModule["content"]["items"][number]["icon"], LucideIcon> =
  {
    truck: Truck,
    shield: Shield,
    "credit-card": CreditCard,
    clock: Clock,
    "badge-check": BadgeCheck,
    headset: Headset,
    package: Package,
    "refresh-cw": RefreshCw,
  };

export function useTrustMotion() {
  const reduceMotion = useReducedMotion();

  const containerVariants: Variants = reduceMotion
    ? {
        hidden: {},
        visible: {},
      }
    : {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.055,
          },
        },
      };

  const itemVariants: Variants = reduceMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.24,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

  return { reduceMotion, containerVariants, itemVariants };
}

export function getAlignmentClass(alignment: "center" | "left") {
  return alignment === "center" ? "justify-center" : "justify-start";
}

export function trustItemSurfaceClassName(compact = false) {
  return cn(
    "relative overflow-hidden border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)]",
    "shadow-[0_18px_38px_-32px_rgba(15,23,42,0.42)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/70",
    compact ? "rounded-[20px]" : "rounded-[24px]",
  );
}

export function TrustIconBadge({
  icon: Icon,
  compact = false,
}: {
  icon: LucideIcon;
  compact?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-[16px] border border-primary/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(255,255,255,0.2)),linear-gradient(180deg,rgba(250,204,21,0.16)_0%,rgba(234,179,8,0.08)_100%)] text-primary",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
        compact ? "h-9 w-9 rounded-[14px]" : "h-11 w-11",
      )}
    >
      <Icon className={cn(compact ? "size-4" : "size-[18px]")} />
    </div>
  );
}
