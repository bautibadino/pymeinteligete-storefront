import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { themeTypographyStyles } from "@/lib/theme";
import type { RichTextBuilderModule } from "@/lib/modules/rich-text";
import { RichTextBody } from "./rich-text-body";

/**
 * RichText — Image Right, Text Left
 *
 * Layout 50/50 espejado: texto a la izquierda, imagen a la derecha.
 * Ideal para alternar bloques en secciones de storytelling.
 */
export function RichTextImageRightTextLeft({ module }: { module: RichTextBuilderModule }) {
  const { content } = module;
  const { eyebrow, title, body, imageUrl, imageAlt, cta } = content;

  return (
    <section
      aria-labelledby={title ? `rt-${module.id}-title` : undefined}
      className="py-16"
      data-template="rich-text-image-right-text-left"
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Texto — orden DOM primero, visual izquierda en desktop */}
          <div className="flex flex-col gap-4">
            {eyebrow ? (
              <span
                className={themeTypographyStyles.eyebrow(
                  "inline-flex w-fit items-center rounded-pill bg-primary-soft px-3 py-1 text-xs text-primary",
                )}
              >
                {eyebrow}
              </span>
            ) : null}

            {title ? (
              <h2
                id={`rt-${module.id}-title`}
                className="font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl"
              >
                {title}
              </h2>
            ) : null}

            <RichTextBody html={body} />

            {cta ? (
              <div className="mt-4">
                <Button
                  asChild
                  variant={cta.variant === "secondary" ? "outline" : cta.variant === "link" ? "ghost" : "default"}
                  size="lg"
                >
                  <Link href={cta.href as Route}>{cta.label}</Link>
                </Button>
              </div>
            ) : null}
          </div>

          {/* Imagen — orden DOM segundo, visual derecha en desktop */}
          <div className="overflow-hidden rounded-xl bg-panel-strong">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt ?? ""}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div
                aria-hidden="true"
                className="aspect-[4/3] bg-gradient-to-br from-primary-soft to-accent-soft"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
