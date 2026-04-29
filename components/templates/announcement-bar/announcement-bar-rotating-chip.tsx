"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils/cn";

type AnnouncementBarRotatingChipProps = {
  intervalMs: number;
  items: string[];
  style?: CSSProperties;
};

export function AnnouncementBarRotatingChip({
  intervalMs,
  items,
  style,
}: AnnouncementBarRotatingChipProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const advance = useCallback(() => {
    startTransition(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    });
  }, [items.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (items.length <= 1 || reducedMotion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      advance();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [advance, intervalMs, items.length, reducedMotion]);

  if (items.length === 0) {
    return null;
  }

  return (
    <span
      className="inline-flex min-h-8 min-w-[12rem] items-center justify-center rounded-full border px-3 py-1 text-center text-xs font-semibold uppercase tracking-[0.2em] sm:min-w-[14rem]"
      style={style}
    >
      <span
        key={`${activeIndex}-${items[activeIndex]}`}
        className={cn(
          "block whitespace-nowrap",
          reducedMotion ? undefined : "animate-in fade-in slide-in-from-bottom-1 duration-300",
        )}
      >
        {items[activeIndex]}
      </span>
    </span>
  );
}
