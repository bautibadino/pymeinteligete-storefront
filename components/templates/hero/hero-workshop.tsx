import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { HeroModule } from "@/lib/modules";

/**
 * Hero Workshop — imagen full-bleed con overlay oscuro.
 * Ideal para marcas industriales/automotive (BYM) donde la
 * foto de contexto (taller, lubricentro, fábrica) carga la
 * identidad visual. El overlay usa black rgba fijo para
 * legibilidad consistente en cualquier preset.
 */
export function HeroWorkshop({ module }: { module: HeroModule }) {
  const { eyebrow, title, description, image, primaryAction, secondaryAction } = module;

  return (
    <section
      aria-labelledby={`hero-${module.id}-title`}
      className="relative overflow-hidden rounded-xl shadow-tenant"
      data-template="hero-workshop"
    >
      <div className="relative min-h-[480px] md:min-h-[560px]">
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-primary to-accent"
          />
        )}

        {/*
          Overlay fijo (negro con alpha) para que el texto sea legible
          en cualquier preset del tenant sin romper contraste WCAG.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10"
        />

        <div className="relative flex min-h-[480px] flex-col justify-end p-8 md:min-h-[560px] md:p-12 lg:p-16">
          <div className="flex max-w-2xl flex-col gap-4 text-white">
            {eyebrow ? (
              <span className="inline-flex w-fit items-center rounded-pill bg-primary px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground">
                {eyebrow}
              </span>
            ) : null}

            <h2
              id={`hero-${module.id}-title`}
              className="font-heading text-4xl font-bold leading-[1.05] md:text-6xl"
            >
              {title}
            </h2>

            <p className="max-w-prose text-base leading-relaxed opacity-90 md:text-lg">
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
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link href={secondaryAction.href as Route}>{secondaryAction.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
