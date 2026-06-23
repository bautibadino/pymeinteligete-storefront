"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function BymHeroParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.88, 0.55]);

  if (reduceMotion) {
    return (
      <div className="absolute inset-0 z-0 h-full w-full">{children}</div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ scale, y, opacity }}
      className="absolute inset-0 z-0 h-full w-full"
    >
      {children}
    </motion.div>
  );
}
