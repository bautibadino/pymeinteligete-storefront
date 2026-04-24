import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PromoBandBuilderModule } from "@/lib/modules/promo-band";

/**
 * PromoBand Split CTA — layout 50/50.
 * Imagen a la izquierda, texto + CTA a la derecha.
 * Degradación elegante si no hay imagen: columna única centrada.
 */
export function PromoBandSplitCta({ module }: { module: PromoBandBuilderModule }) {
  const { content, id } = module;
  const { title, subtitle, description, imageUrl, cta } = content;

  return (
    <section
      aria-labelledby={`promo-band-${id}-title`}
      className="overflow-hidden rounded-xl border border-border bg-panel shadow-tenant"
      data-template="promo-band-split-cta"
    >
      <div className={`grid md:grid-cols-2 ${imageUrl ? "" : "justify-items-center"}`}>
        {imageUrl ? (
          <div className="relative min-h-[240px] overflow-hidden md:min-h-[320px]">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}

        <div
          className={`flex flex-col justify-center gap-4 p-8 md:p-12 ${
            imageUrl ? "" : "max-w-2xl text-center"
          }`}
        >
          {subtitle ? (
            <span className="inline-flex w-fit items-center rounded-pill bg-primary-soft px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
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

          {cta ? (
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
      </div>
    </section>
  );
}
