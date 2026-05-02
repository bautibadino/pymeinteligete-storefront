"use client";

import { useEffect, useState } from "react";

import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { cn } from "@/lib/utils/cn";

import { AnnouncementBarFrame } from "@/components/templates/announcement-bar/announcement-bar-frame";

const SPEED_INTERVAL_MS: Record<"slow" | "normal" | "fast", number> = {
  slow: 4500,
  normal: 3200,
  fast: 2200,
};

/**
 * AnnouncementBarScroll — marquee horizontal con múltiples mensajes.
 *
 * Usa el keyframe `@keyframes ab-marquee` de `app/globals.css`.
 * Los mensajes se duplican para el loop continuo sin corte visual.
 */
export function AnnouncementBarScroll({ module }: { module: AnnouncementBarModule }) {
  if (module.variant !== "scroll") return null;

  const {
    messages,
    speed = "normal",
    pauseOnHover = true,
    appearance,
  } = module;
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  if (messages.length === 0) return null;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (messages.length <= 1 || reducedMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % Math.max(messages.length, 1));
    }, SPEED_INTERVAL_MS[speed]);

    return () => window.clearInterval(timer);
  }, [messages.length, pauseOnHover, reducedMotion, speed]);

  return (
    <AnnouncementBarFrame
      appearance={appearance}
      role="region"
      ariaLabel="Anuncios en desplazamiento"
      dataTemplate="announcement-bar-scroll"
      contentClassName="justify-center py-3 text-center"
    >
      <div className="relative mx-auto h-10 w-full max-w-3xl overflow-hidden sm:h-7">
        {messages.map((msg, idx) => (
          <span
            key={`${msg}-${idx}`}
            className={cn(
              "absolute inset-0 flex w-full items-center justify-center px-3 text-center text-sm font-medium leading-snug transition-all duration-500 ease-out sm:px-4 sm:text-[0.95rem]",
              reducedMotion ? undefined : "motion-safe:animate-in motion-safe:fade-in",
            )}
            style={{
              transform: `translateX(${(idx - activeIndex) * 100}%)`,
              opacity: idx === activeIndex ? 1 : 0,
            }}
          >
            <span>{msg}</span>
          </span>
        ))}
      </div>

      <ul className="sr-only">
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </AnnouncementBarFrame>
  );
}
