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
 * TrustBar Rail Denso — scroll horizontal en mobile, grid en desktop.
 * Permite mostrar 4-6 ventajas sin colapsar el layout. Mobile-first.
 */
export function TrustBarRailDense({ module }: { module: TrustBarModule }) {
  const { content, id } = module;
  const { items, alignment = "center" } = content;
  const { reduceMotion, containerVariants, itemVariants } = useTrustMotion();

  return (
    <section
      aria-label="Ventajas y beneficios"
      data-template="trust-bar-rail-dense"
      className="bg-panel py-3"
    >
      <div className="mx-auto max-w-screen-xl px-4">
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={containerVariants}
          className={`flex gap-3 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0 ${getAlignmentClass(
            alignment,
          )}`}
          aria-label="Lista de ventajas"
        >
          {items.map((item, index) => {
            const Icon = TRUST_BAR_ICON_MAP[item.icon];
            return (
              <motion.li
                key={`${id}-rail-${index}`}
                variants={itemVariants}
                {...(!reduceMotion ? { whileHover: { y: -1 } } : {})}
                className={`${trustItemSurfaceClassName(true)} flex min-w-[224px] shrink-0 items-start gap-3 px-3.5 py-3 sm:min-w-[208px] sm:shrink`}
              >
                <TrustIconBadge icon={Icon} compact />
                <div className="min-w-0 space-y-0.5">
                  <span className="block truncate text-[13px] font-semibold leading-4 tracking-[-0.01em] text-foreground">
                    {item.title}
                  </span>
                  {item.subtitle ? (
                    <span className="block truncate text-[11.5px] leading-4 text-muted">
                      {item.subtitle}
                    </span>
                  ) : null}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
