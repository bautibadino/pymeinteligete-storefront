"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function LandingReveal({ children, className, delay = 0 }: LandingRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = prefersReducedMotion === false;

  return (
    <motion.div
      className={cn("will-change-auto", className)}
      initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
      transition={{ delay, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-12% 0px" }}
      {...(shouldAnimate ? { whileInView: { opacity: 1, y: 0 } } : {})}
    >
      {children}
    </motion.div>
  );
}

export const PymeStoreLandingMotion = LandingReveal;
