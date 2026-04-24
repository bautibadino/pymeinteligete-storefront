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
 * TrustBar Compact Strip — strip compacto con ícono inline y separadores verticales.
 * Ocupa poco espacio vertical. Ideal bajo el header o announcement bar.
 */
export function TrustBarCompactStrip({ module }: { module: TrustBarModule }) {
  const { content, id } = module;
  const { items, alignment = "center" } = content;

  return (
    <section
      aria-label="Ventajas y beneficios"
      data-template="trust-bar-compact-strip"
      className="border-b border-border bg-panel py-2.5"
    >
      <div className="mx-auto max-w-screen-xl overflow-x-auto px-4">
        <ul
          className={`flex min-w-max items-center gap-0 sm:min-w-0 sm:flex-wrap ${
            alignment === "center" ? "sm:justify-center" : "sm:justify-start"
          }`}
          aria-label="Lista de ventajas"
        >
          {items.map((item, index) => {
            const Icon = ICON_MAP[item.icon];
            const isLast = index === items.length - 1;
            return (
              <li key={`${id}-strip-${index}`} className="flex items-center">
                <div className="flex items-center gap-1.5 px-3 py-0.5">
                  <Icon
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-primary"
                  />
                  <span className="whitespace-nowrap text-xs font-medium text-foreground">
                    {item.title}
                  </span>
                </div>
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="h-3 w-px shrink-0 bg-border"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
