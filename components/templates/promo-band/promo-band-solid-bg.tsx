import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PromoBandBuilderModule } from "@/lib/modules/promo-band";

/**
 * PromoBand Solid BG — fondo de color plano.
 * Usa el accent token del tenant por defecto. Si `content.bgColor`
 * está presente se aplica como inline style (soporte de CSS vars o
 * valores calculados del backend). El texto siempre usa
 * `text-accent-contrast` para garantizar legibilidad WCAG.
 */
export function PromoBandSolidBg({ module }: { module: PromoBandBuilderModule }) {
  const { content, id } = module;
  const { title, subtitle, description, bgColor, cta } = content;

  const sectionStyle = bgColor ? { backgroundColor: bgColor } : undefined;

  return (
    <section
      aria-labelledby={`promo-band-${id}-title`}
      className={`overflow-hidden rounded-xl shadow-tenant${bgColor ? "" : " bg-accent"}`}
      style={sectionStyle}
      data-template="promo-band-solid-bg"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-8 py-14 text-center md:px-12 md:py-20">
        {subtitle ? (
          <span className="inline-flex w-fit items-center rounded-pill bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent-contrast">
            {subtitle}
          </span>
        ) : null}

        <h2
          id={`promo-band-${id}-title`}
          className="font-heading text-3xl font-bold leading-tight text-accent-contrast md:text-5xl"
        >
          {title}
        </h2>

        {description ? (
          <p className="max-w-prose text-base leading-relaxed text-accent-contrast/80 md:text-lg">
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
                cta.variant !== "secondary"
                  ? "bg-white text-accent hover:bg-white/90"
                  : "border-white/50 text-accent-contrast hover:bg-white/10"
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
    </section>
  );
}
