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
 * TrustBar Inline — 3-4 items horizontales con ícono, título y subtítulo.
 * Fondo claro, layout clásico e-commerce. Sin scroll, colapsa a columna en mobile.
 */
export function TrustBarInline({ module }: { module: TrustBarModule }) {
  const { content, id } = module;
  const { items, alignment = "center" } = content;

  return (
    <section
      aria-label="Ventajas y beneficios"
      data-template="trust-bar-inline"
      className="border-y border-border bg-panel py-6"
    >
      <div
        className={`mx-auto flex max-w-screen-xl flex-col gap-6 px-4 sm:flex-row sm:flex-wrap sm:gap-4 ${
          alignment === "center" ? "sm:justify-center" : "sm:justify-start"
        }`}
      >
        {items.map((item, index) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <div
              key={`${id}-item-${index}`}
              className="flex items-start gap-3 sm:flex-1 sm:basis-40"
            >
              <div
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
              >
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold leading-snug text-foreground">
                  {item.title}
                </span>
                {item.subtitle ? (
                  <span className="text-xs leading-relaxed text-muted">{item.subtitle}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
