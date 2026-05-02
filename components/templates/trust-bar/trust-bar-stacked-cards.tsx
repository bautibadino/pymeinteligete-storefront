"use client";

import { motion } from "framer-motion";
import type { TrustBarModule } from "@/lib/modules/trust-bar";
import {
  TRUST_BAR_ICON_MAP,
  TrustIconBadge,
  trustItemSurfaceClassName,
  useTrustMotion,
} from "./trust-bar-shared";

/**
 * TrustBar Stacked Cards — 3 cards con sombra y presencia visual destacada.
 * Cada ventaja tiene protagonismo propio. Ideal para tiendas premium.
 */
export function TrustBarStackedCards({ module }: { module: TrustBarModule }) {
  const { content, id } = module;
  const { items } = content;
  const { reduceMotion, containerVariants, itemVariants } = useTrustMotion();

  return (
    <section
      aria-label="Ventajas y beneficios"
      data-template="trust-bar-stacked-cards"
      className="bg-background py-6"
    >
      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={containerVariants}
        className="mx-auto grid max-w-screen-xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item, index) => {
          const Icon = TRUST_BAR_ICON_MAP[item.icon];
          return (
            <motion.li
              key={`${id}-card-${index}`}
              variants={itemVariants}
              {...(!reduceMotion ? { whileHover: { y: -2 } } : {})}
            >
              <article
                className={`${trustItemSurfaceClassName()} h-full min-h-[132px] px-4 py-4`}
              >
                <div className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <TrustIconBadge icon={Icon} />
                    <span className="rounded-full border border-border/60 bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Beneficio
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="block text-[15px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground">
                      {item.title}
                    </span>
                    {item.subtitle ? (
                      <span className="block text-[12.5px] leading-5 text-muted">
                        {item.subtitle}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
