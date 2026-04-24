import {
  Truck,
  Shield,
  CreditCard,
  Clock,
  BadgeCheck,
  Headset,
  Package,
  RefreshCw,
} from "lucide-react";
import type { TrustBarModule } from "@/lib/modules/trust-bar";

const ICON_MAP = {
  truck: Truck,
  shield: Shield,
  "credit-card": CreditCard,
  clock: Clock,
  "badge-check": BadgeCheck,
  headset: Headset,
  package: Package,
  "refresh-cw": RefreshCw,
} as const;

/**
 * TrustBar Rail Denso — scroll horizontal en mobile, grid en desktop.
 * Permite mostrar 4-6 ventajas sin colapsar el layout. Mobile-first.
 */
export function TrustBarRailDense({ module }: { module: TrustBarModule }) {
  const { content, id } = module;
  const { items, alignment = "center" } = content;

  return (
    <section
      aria-label="Ventajas y beneficios"
      data-template="trust-bar-rail-dense"
      className="border-y border-border bg-panel py-4"
    >
      <div className="mx-auto max-w-screen-xl px-4">
        <ul
          className={`flex gap-4 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0 ${
            alignment === "center" ? "sm:justify-center" : "sm:justify-start"
          }`}
          aria-label="Lista de ventajas"
        >
          {items.map((item, index) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <li
                key={`${id}-rail-${index}`}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-background px-3 py-2 sm:shrink"
              >
                <div
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary"
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="whitespace-nowrap text-xs font-semibold text-foreground">
                    {item.title}
                  </span>
                  {item.subtitle ? (
                    <span className="whitespace-nowrap text-xs text-muted">{item.subtitle}</span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
