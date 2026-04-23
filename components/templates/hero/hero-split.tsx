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
  const { eyebrow, title, description, image, primaryAction, secondaryAction } = module;

  return (
    <section
      aria-labelledby={`hero-${module.id}-title`}
      className="relative overflow-hidden rounded-xl border border-border bg-panel shadow-tenant"
      data-template="hero-split"
    >
      <div className="grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12 lg:gap-12">
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

          <p className="max-w-prose text-base leading-relaxed text-muted md:text-lg">
            {description}
          </p>

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
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-primary-soft to-accent-soft"
          />
        )}
      </div>
    </section>
  );
}
