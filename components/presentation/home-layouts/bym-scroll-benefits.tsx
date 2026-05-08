"use client";

import { motion, useReducedMotion } from "framer-motion";

export type BymBenefitCard = {
  icon?: string;
  title: string;
  description?: string;
};

type BymScrollBenefitsProps = {
  benefits: BymBenefitCard[];
};

export function BymScrollBenefits({ benefits }: BymScrollBenefitsProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = reduceMotion === false;

  if (benefits.length === 0) {
    return null;
  }

  return (
    <section
      className="relative z-10 overflow-hidden bg-zinc-950 px-6 py-12 text-white sm:px-8 lg:px-12"
      aria-label="Beneficios"
    >
      <motion.div
        className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        {...(shouldAnimate
          ? {
              initial: { x: -48, opacity: 0.85 },
              whileInView: { x: 0, opacity: 1 },
              transition: { duration: 0.75, ease: "easeOut" as const },
              viewport: { once: true, amount: 0.25 },
            }
          : {})}
      >
        {benefits.map((benefit, index) => (
          <motion.article
            key={`${benefit.title}-${index}`}
            className="min-w-[78vw] snap-start border border-white/15 bg-white/10 p-5 backdrop-blur sm:min-w-[22rem] lg:min-w-[24rem]"
            {...(shouldAnimate
              ? {
                  initial: { x: -32, opacity: 0 },
                  whileInView: { x: 0, opacity: 1 },
                  transition: { duration: 0.55, delay: index * 0.08, ease: "easeOut" as const },
                  viewport: { once: true, amount: 0.3 },
                }
              : {})}
          >
            {benefit.icon ? (
              <span
                className="mb-6 inline-flex h-10 w-10 items-center justify-center border border-white/25 text-xs font-semibold uppercase"
                aria-hidden="true"
                data-benefit-icon={benefit.icon}
              >
                {benefit.icon.slice(0, 2)}
              </span>
            ) : null}
            <h2 className="text-xl font-semibold leading-tight text-white">{benefit.title}</h2>
            {benefit.description ? (
              <p className="mt-3 text-sm leading-6 text-zinc-200">{benefit.description}</p>
            ) : null}
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
