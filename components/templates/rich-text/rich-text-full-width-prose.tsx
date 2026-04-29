import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { themeTypographyStyles } from "@/lib/theme";
import type { RichTextBuilderModule } from "@/lib/modules/rich-text";
import { RichTextBody } from "./rich-text-body";

/**
 * RichText — Full Width Prose
 *
 * Contenido centrado, ancho medio, tipografía editorial.
 * Sin imagen. Ideal para artículos, políticas y páginas "Sobre nosotros".
 */
export function RichTextFullWidthProse({ module }: { module: RichTextBuilderModule }) {
  const { content } = module;
  const { eyebrow, title, body, cta } = content;

  return (
    <section
      aria-labelledby={title ? `rt-${module.id}-title` : undefined}
      className="py-16"
      data-template="rich-text-full-width-prose"
    >
      <div className="mx-auto max-w-2xl px-4">
        {eyebrow ? (
          <span
            className={themeTypographyStyles.eyebrow(
              "mb-4 inline-flex items-center rounded-pill bg-primary-soft px-3 py-1 text-xs text-primary",
            )}
          >
            {eyebrow}
          </span>
        ) : null}

        {title ? (
          <h2
            id={`rt-${module.id}-title`}
            className="font-heading mb-6 text-3xl font-semibold leading-tight text-foreground md:text-4xl"
          >
            {title}
          </h2>
        ) : null}

        <RichTextBody html={body} />

        {cta ? (
          <div className="mt-8">
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
    </section>
  );
}
