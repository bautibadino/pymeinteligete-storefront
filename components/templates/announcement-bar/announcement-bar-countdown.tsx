"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { TimerReset } from "lucide-react";

import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { themeTypographyStyles } from "@/lib/theme/typography";
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

  const { message, label, endsAt, completedMessage, cta, appearance } = module;
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
        <span className={themeTypographyStyles.label("text-sm tracking-[0.02em] normal-case")}>{completedMessage}</span>
      </AnnouncementBarFrame>
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
    <AnnouncementBarFrame
      appearance={appearance}
      role="timer"
      ariaLabel={`Cuenta regresiva: ${message}`}
      dataTemplate="announcement-bar-countdown"
      contentClassName="flex-wrap justify-center gap-3 sm:justify-between"
    >
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-3 sm:justify-start">
        {label ? (
          <span
            className={themeTypographyStyles.kicker("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px]")}
            style={palette.chip}
          >
            <TimerReset className="size-3" aria-hidden="true" />
            {label}
          </span>
        ) : null}

        <span className={themeTypographyStyles.label("text-center text-sm tracking-[0.01em] normal-case sm:text-left")}>{message}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        <span className="flex items-baseline gap-1.5 rounded-full border px-3 py-1.5" style={palette.chipSoft}>
          {visibleSegments.map(({ label: segmentLabel, value }, idx) => (
            <span key={segmentLabel} className="flex items-baseline gap-1">
              <span className="font-heading text-base font-bold tabular-nums">{value}</span>
              <span className={themeTypographyStyles.label("text-[10px] tracking-[0.18em]")} style={palette.mutedText}>
                {segmentLabel}
              </span>
              {idx < visibleSegments.length - 1 ? (
                <span className="px-0.5 text-xs" style={palette.separator}>
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
              "inline-flex min-h-9 items-center justify-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
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
