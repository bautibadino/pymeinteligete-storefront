"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { cn } from "@/lib/utils/cn";

import { AnnouncementBarFrame, resolveAnnouncementBarPalette } from "@/components/templates/announcement-bar/announcement-bar-frame";

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

  const { message, endsAt, completedMessage, cta, appearance } = module;
  const palette = resolveAnnouncementBarPalette(appearance);

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
      <AnnouncementBarFrame
        appearance={appearance}
        role="region"
        ariaLabel="Promoción finalizada"
        dataTemplate="announcement-bar-countdown-completed"
        contentClassName="justify-center"
      >
        <span className="text-sm font-medium leading-tight">{completedMessage}</span>
      </AnnouncementBarFrame>
    );
  }

  const segments: { label: string; value: string }[] = [
    { label: "dd", value: pad(timeLeft.days) },
    { label: "hh", value: pad(timeLeft.hours) },
    { label: "mm", value: pad(timeLeft.minutes) },
    { label: "ss", value: pad(timeLeft.seconds) },
  ];

  return (
    <AnnouncementBarFrame
      appearance={appearance}
      role="timer"
      ariaLabel={`Cuenta regresiva: ${message}`}
      dataTemplate="announcement-bar-countdown"
      contentClassName="justify-center text-center sm:min-h-10 sm:pr-32"
    >
      <div className="flex min-w-0 flex-1 items-center justify-center px-2 sm:px-12">
        <span className="text-sm font-medium leading-tight sm:text-[0.95rem]">
          {message}
        </span>
      </div>

      <div className="mt-1 flex justify-center sm:absolute sm:right-5 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">
        <span className="inline-flex items-baseline gap-1">
          {segments.map(({ label: segmentLabel, value }, idx) => (
            <span key={segmentLabel} className="inline-flex items-baseline gap-0.5">
              <span className="font-heading text-xs font-bold tabular-nums sm:text-sm">{value}</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.04em]" style={palette.mutedText}>
                {segmentLabel}
              </span>
              {idx < segments.length - 1 ? (
                <span className="px-0.5 text-[10px]" style={palette.separator}>
                  :
                </span>
              ) : null}
            </span>
          ))}
        </span>
        {cta ? (
          <Link
            href={cta.href as Route}
            className={cn(
              "ml-3 inline-flex min-h-8 items-center justify-center px-2 py-1 text-xs font-semibold underline-offset-4 transition-opacity duration-200 hover:underline hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              cta.variant === "link" ? "underline-offset-4 hover:underline" : undefined,
            )}
            style={
              cta.variant === "secondary"
                ? palette.ctaSecondary
                : cta.variant === "link"
                  ? palette.ctaLink
                  : palette.ctaPrimary
            }
          >
            {cta.label}
          </Link>
        ) : null}
      </div>
    </AnnouncementBarFrame>
  );
}
