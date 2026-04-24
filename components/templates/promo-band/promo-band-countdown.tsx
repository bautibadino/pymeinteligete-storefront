"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PromoBandBuilderModule } from "@/lib/modules/promo-band";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function calculateTimeLeft(endsAt: string): TimeLeft {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: false,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * PromoBand Countdown — cuenta regresiva + CTA.
 * Componente cliente porque necesita setInterval.
 * Aplica `rerender-use-ref-transient-values`: el intervalo se maneja
 * con ref para evitar re-subscripciones innecesarias.
 */
export function PromoBandCountdown({ module }: { module: PromoBandBuilderModule }) {
  const { content, id } = module;
  const { title, subtitle, description, cta, endsAt } = content;

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!endsAt) return;

    setTimeLeft(calculateTimeLeft(endsAt));

    intervalRef.current = setInterval(() => {
      const next = calculateTimeLeft(endsAt);
      setTimeLeft(next);
      if (next.expired && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endsAt]);

  return (
    <section
      aria-labelledby={`promo-band-${id}-title`}
      className="overflow-hidden rounded-xl border border-border bg-panel shadow-tenant"
      data-template="promo-band-countdown"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-8 py-12 text-center md:px-12 md:py-16">
        {subtitle ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-primary-soft px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            <Clock className="size-3" aria-hidden="true" />
            {subtitle}
          </span>
        ) : null}

        <h2
          id={`promo-band-${id}-title`}
          className="font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl"
        >
          {title}
        </h2>

        {description ? (
          <p className="max-w-prose text-base leading-relaxed text-muted">{description}</p>
        ) : null}

        {endsAt ? (
          <div
            aria-live="polite"
            aria-label="Tiempo restante"
            className="flex items-center gap-2 md:gap-4"
            suppressHydrationWarning
          >
            {(["days", "hours", "minutes", "seconds"] as const).map((unit, i) => (
              <div key={unit} className="flex items-center gap-2 md:gap-4">
                {i > 0 ? (
                  <span className="text-2xl font-bold text-muted md:text-4xl" aria-hidden="true">
                    :
                  </span>
                ) : null}
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="min-w-[3ch] rounded-lg bg-panel-strong px-3 py-2 text-center font-mono text-2xl font-bold tabular-nums text-foreground shadow-tenant md:min-w-[4ch] md:px-4 md:py-3 md:text-4xl"
                    suppressHydrationWarning
                  >
                    {timeLeft ? pad(timeLeft[unit]) : "--"}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                    {unit === "days"
                      ? "días"
                      : unit === "hours"
                        ? "hrs"
                        : unit === "minutes"
                          ? "min"
                          : "seg"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {timeLeft?.expired ? (
          <p className="text-sm font-medium text-muted">La oferta ha finalizado.</p>
        ) : null}

        {cta && !timeLeft?.expired ? (
          <div className="pt-2">
            <Button asChild size="lg" variant={cta.variant === "secondary" ? "outline" : "default"}>
              <Link href={cta.href as Route}>
                {cta.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
