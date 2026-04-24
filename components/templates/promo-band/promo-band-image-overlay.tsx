import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PromoBandBuilderModule } from "@/lib/modules/promo-band";

/**
 * PromoBand Image Overlay — imagen full-bleed con overlay semitransparente.
 * El overlay usa `rgba()` negro para mantener contraste WCAG en cualquier
 * preset del tenant. Sin imagen, cae a un gradiente de tokens CSS.
 */
export function PromoBandImageOverlay({ module }: { module: PromoBandBuilderModule }) {
  const { content, id } = module;
  const { title, subtitle, description, imageUrl, cta } = content;

  return (
    <section
      aria-labelledby={`promo-band-${id}-title`}
      className="relative overflow-hidden rounded-xl shadow-tenant"
      data-template="promo-band-image-overlay"
    >
      <div className="relative min-h-[280px] md:min-h-[380px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-primary to-accent"
          />
        )}

        {/* rgba() permitido para overlays — regla 0-hex-en-JSX */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.55)" }}
        />

        <div className="relative flex min-h-[280px] flex-col items-center justify-center gap-5 px-8 py-12 text-center text-white md:min-h-[380px] md:px-12 md:py-16">
          {subtitle ? (
            <span className="inline-flex w-fit items-center rounded-pill bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white">
              {subtitle}
            </span>
          ) : null}

          <h2
            id={`promo-band-${id}-title`}
            className="font-heading text-3xl font-bold leading-tight md:text-5xl"
          >
            {title}
          </h2>

          {description ? (
            <p className="max-w-prose text-base leading-relaxed opacity-90 md:text-lg">
              {description}
            </p>
          ) : null}

          {cta ? (
            <div className="pt-2">
              <Button
                asChild
                size="lg"
                variant={cta.variant === "secondary" ? "outline" : "default"}
                className={
                  cta.variant === "secondary"
                    ? "border-white/40 bg-white/10 text-white hover:bg-white/20"
                    : undefined
                }
              >
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
