"use client";

import { useEffect, useState } from "react";

import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { cn } from "@/lib/utils/cn";

import { AnnouncementBarFrame } from "@/components/templates/announcement-bar/announcement-bar-frame";

/**
 * AnnouncementBarRotating — Mensajes cambiando uno por uno
 * 
 * Un solo mensaje centrado que cambia cada X segundos.
 * SIN chips. SIN pills. Solo texto plano centrado.
 */
export function AnnouncementBarRotating({ module }: { module: AnnouncementBarModule }) {
  if (module.variant !== "rotating") return null;

  const { messages, speed = "normal", motion, appearance } = module;
  const intervalMs =
    motion?.rotationIntervalMs ??
    (speed === "fast" ? 2000 : speed === "slow" ? 5000 : 3500);

  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

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
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, messages.length, reducedMotion]);

  if (messages.length === 0) return null;

  return (
    <AnnouncementBarFrame
      appearance={appearance}
      role="region"
      ariaLabel="Anuncios rotativos"
      dataTemplate="announcement-bar-rotating"
      contentClassName="justify-center py-3 text-center"
    >
      <div className="relative mx-auto h-10 w-full max-w-3xl overflow-hidden sm:h-7">
        {messages.map((msg, idx) => (
          <span
            key={idx}
            className={cn(
              "absolute inset-0 flex w-full items-center justify-center px-3 text-center text-sm font-medium leading-snug transition-all duration-500 ease-out sm:px-4 sm:text-[0.95rem]",
              reducedMotion ? undefined : "motion-safe:animate-in motion-safe:fade-in",
            )}
            style={{
              transform: `translateY(${(idx - activeIndex) * 100}%)`,
              opacity: idx === activeIndex ? 1 : 0,
            }}
          >
            {msg}
          </span>
        ))}
      </div>
    </AnnouncementBarFrame>
  );
}
