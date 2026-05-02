"use client";

import { motion } from "framer-motion";
import type { TrustBarModule } from "@/lib/modules/trust-bar";
import {
  getAlignmentClass,
  TRUST_BAR_ICON_MAP,
  TrustIconBadge,
  trustItemSurfaceClassName,
  useTrustMotion,
} from "./trust-bar-shared";

/**
 * TrustBar Inline — 3-4 items horizontales con ícono, título y subtítulo.
 * Fondo claro, layout clásico e-commerce. Sin scroll, colapsa a columna en mobile.
 */
export function TrustBarInline({ module }: { module: TrustBarModule }) {
  const { content, id } = module;
  const { items, alignment = "center" } = content;
  const { reduceMotion, containerVariants, itemVariants } = useTrustMotion();

  return (
    <section
      aria-label="Ventajas y beneficios"
      data-template="trust-bar-inline"
      className="bg-panel py-4"
    >
      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={containerVariants}
        className={`mx-auto grid max-w-screen-xl gap-3 px-4 sm:grid-cols-2 lg:grid-cols-3 ${getAlignmentClass(
          alignment,
        )}`}
      >
        {items.map((item, index) => {
          const Icon = TRUST_BAR_ICON_MAP[item.icon];
          return (
            <motion.li
              key={`${id}-item-${index}`}
              variants={itemVariants}
              {...(!reduceMotion ? { whileHover: { y: -1 } } : {})}
              className={`${trustItemSurfaceClassName()} px-4 py-3`}
            >
              <div className="flex items-start gap-3">
                <TrustIconBadge icon={Icon} />
                <div className="min-w-0 space-y-1">
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
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
