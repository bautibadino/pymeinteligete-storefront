"use client";

import { useEffect, useState } from "react";

import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calcTimeLeft(endsAt: string): TimeLeft | null {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * AnnouncementBarCountdown — countdown hasta `endsAt`.
 *
 * Al expirar: muestra `completedMessage` si existe, o se oculta.
 * Degrada a banner estático cuando el countdown termina.
 */
export function AnnouncementBarCountdown({ module }: { module: AnnouncementBarModule }) {
  if (module.variant !== "countdown") return null;

  const { message, endsAt, completedMessage } = module;

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(endsAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(endsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (timeLeft === null) {
    if (!completedMessage) return null;
    return (
      <div
        role="banner"
        aria-label="Promoción finalizada"
        data-template="announcement-bar-countdown-completed"
        className="flex min-h-9 items-center justify-center bg-accent px-4 py-2 text-sm font-medium text-background"
      >
        {completedMessage}
      </div>
    );
  }

  const segments: { label: string; value: string }[] = [
    { label: "días", value: pad(timeLeft.days) },
    { label: "hs", value: pad(timeLeft.hours) },
    { label: "min", value: pad(timeLeft.minutes) },
    { label: "seg", value: pad(timeLeft.seconds) },
  ];

  const visibleSegments = timeLeft.days > 0 ? segments : segments.slice(1);

  return (
    <div
      role="timer"
      aria-label={`Cuenta regresiva: ${message}`}
      data-template="announcement-bar-countdown"
      className="flex min-h-9 flex-wrap items-center justify-center gap-3 bg-accent px-4 py-2 text-sm font-medium text-background"
    >
      <span>{message}</span>
      <span aria-hidden="true" className="opacity-60">·</span>
      <span className="flex items-baseline gap-2">
        {visibleSegments.map(({ label, value }, idx) => (
          <span key={label} className="flex items-baseline gap-1">
            <span className="font-heading text-base font-bold tabular-nums">{value}</span>
            <span className="text-xs opacity-75">{label}</span>
            {idx < visibleSegments.length - 1 ? (
              <span className="opacity-60">:</span>
            ) : null}
          </span>
        ))}
      </span>
    </div>
  );
}
