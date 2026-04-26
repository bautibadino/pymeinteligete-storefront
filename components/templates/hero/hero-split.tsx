import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { HeroModule } from "@/lib/modules";

/**
 * Hero Split — layout clásico e-commerce.
 * Copy a la izquierda, imagen a la derecha. Si no hay imagen,
 * el layout colapsa a una columna y queda igual de elegante.
 */
export function HeroSplit({ module }: { module: HeroModule }) {
  const { eyebrow, title, subtitle, description, image, primaryAction, secondaryAction } = module;
  const body = subtitle ?? description;

  return (
    <section
      aria-labelledby={`hero-${module.id}-title`}
      className="relative isolate overflow-hidden rounded-xl border border-border bg-panel shadow-tenant"
      data-template="hero-split"
    >
      <div
        aria-hidden="true"
        className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-primary-soft blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-secondary-soft blur-3xl"
      />

      <div className="relative grid gap-8 p-7 md:grid-cols-[1fr_0.92fr] md:items-center md:p-12 lg:gap-14 lg:p-16">
        <div className="flex flex-col gap-4">
          {eyebrow ? (
            <span className="inline-flex w-fit items-center rounded-pill bg-primary-soft px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </span>
          ) : null}

          <h2
            id={`hero-${module.id}-title`}
            className="font-heading text-4xl font-semibold leading-[1.1] text-foreground md:text-5xl"
          >
            {title}
          </h2>

          {body ? (
            <p className="max-w-prose text-base leading-relaxed text-muted md:text-lg">
              {body}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            {primaryAction ? (
              <Button asChild size="lg">
                <Link href={primaryAction.href as Route}>
                  {primaryAction.label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button asChild variant="outline" size="lg">
                <Link href={secondaryAction.href as Route}>{secondaryAction.label}</Link>
              </Button>
            ) : null}
          </div>
        </div>

        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-panel-strong shadow-tenant">
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary-soft via-panel-strong to-secondary-soft shadow-tenant"
          >
            <div className="absolute left-6 top-6 h-16 w-28 rounded-pill bg-panel" />
            <div className="absolute bottom-7 left-7 right-7 grid gap-3">
              <div className="h-4 w-2/3 rounded-pill bg-border" />
              <div className="h-4 w-1/2 rounded-pill bg-border" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
