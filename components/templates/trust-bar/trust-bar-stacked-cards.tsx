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
 * TrustBar Stacked Cards — 3 cards con sombra y presencia visual destacada.
 * Cada ventaja tiene protagonismo propio. Ideal para tiendas premium.
 */
export function TrustBarStackedCards({ module }: { module: TrustBarModule }) {
  const { content, id } = module;
  const { items, alignment = "center" } = content;

  return (
    <section
      aria-label="Ventajas y beneficios"
      data-template="trust-bar-stacked-cards"
      className="bg-background py-10"
    >
      <div
        className={`mx-auto grid max-w-screen-xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 ${
          alignment === "center" ? "" : "lg:mr-auto"
        }`}
      >
        {items.map((item, index) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <div
              key={`${id}-card-${index}`}
              className="flex flex-col items-start gap-3 rounded-xl border border-border bg-panel p-6 shadow-tenant transition-shadow hover:shadow-md"
            >
              <div
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary"
              >
                <Icon className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold leading-snug text-foreground">
                  {item.title}
                </span>
                {item.subtitle ? (
                  <span className="text-sm leading-relaxed text-muted">{item.subtitle}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
