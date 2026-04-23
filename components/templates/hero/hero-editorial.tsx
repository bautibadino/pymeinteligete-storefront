import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { HeroModule } from "@/lib/modules";

/**
 * Hero Editorial — tipografía dominante, centrado, sin imagen.
 * Pensado para marcas premium, boutique y servicios donde la
 * estética va por composición tipográfica y respiración.
 * El título usa una escala más grande y spacing generoso.
 */
export function HeroEditorial({ module }: { module: HeroModule }) {
  const { eyebrow, title, description, primaryAction, secondaryAction } = module;

  return (
    <section
      aria-labelledby={`hero-${module.id}-title`}
      className="relative overflow-hidden rounded-xl border border-border bg-panel px-6 py-16 shadow-tenant md:px-12 md:py-24 lg:py-28"
      data-template="hero-editorial"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        {eyebrow ? (
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
            {eyebrow}
          </span>
        ) : null}

        <h2
          id={`hero-${module.id}-title`}
          className="font-heading text-5xl font-semibold leading-[1.02] text-foreground md:text-7xl"
        >
          {title}
        </h2>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
          {description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {primaryAction ? (
            <Button asChild size="lg">
              <Link href={primaryAction.href as Route}>
                {primaryAction.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button asChild variant="link" size="lg">
              <Link href={secondaryAction.href as Route}>{secondaryAction.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
      />
    </section>
  );
}
