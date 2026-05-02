"use client";

import { motion } from "framer-motion";
import type { TrustBarModule } from "@/lib/modules/trust-bar";
import {
  getAlignmentClass,
  TRUST_BAR_ICON_MAP,
  TrustIconBadge,
  useTrustMotion,
} from "./trust-bar-shared";

/**
 * TrustBar Compact Strip — strip compacto con ícono inline y separadores verticales.
 * Ocupa poco espacio vertical. Ideal bajo el header o announcement bar.
 */
export function TrustBarCompactStrip({ module }: { module: TrustBarModule }) {
  const { content, id } = module;
  const { items, alignment = "center" } = content;
  const { reduceMotion, containerVariants, itemVariants } = useTrustMotion();

  return (
    <section
      aria-label="Ventajas y beneficios"
      data-template="trust-bar-compact-strip"
      className="bg-panel py-2.5"
    >
      <div className="mx-auto max-w-screen-xl overflow-x-auto px-4">
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.45 }}
          variants={containerVariants}
          className={`flex min-w-max items-center gap-1 rounded-full border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.92)_100%)] px-2 py-1.5 shadow-[0_16px_36px_-34px_rgba(15,23,42,0.55)] sm:min-w-0 sm:flex-wrap ${getAlignmentClass(
            alignment,
          )}`}
          aria-label="Lista de ventajas"
        >
          {items.map((item, index) => {
            const Icon = TRUST_BAR_ICON_MAP[item.icon];
            const isLast = index === items.length - 1;
            return (
              <motion.li
                key={`${id}-strip-${index}`}
                variants={itemVariants}
                {...(!reduceMotion ? { whileHover: { y: -1 } } : {})}
                className="flex items-center"
              >
                <div className="flex items-center gap-2 rounded-full px-2 py-0.5">
                  <TrustIconBadge icon={Icon} compact />
                  <div className="space-y-0.5">
                    <span className="block whitespace-nowrap text-[12px] font-semibold leading-4 tracking-[-0.01em] text-foreground">
                      {item.title}
                    </span>
                    {item.subtitle ? (
                      <span className="block whitespace-nowrap text-[10.5px] leading-3.5 text-muted">
                        {item.subtitle}
                      </span>
                    ) : null}
                  </div>
                </div>
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="h-7 w-px shrink-0 bg-border/70"
                  />
                ) : null}
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
