import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { themeTypographyStyles } from "@/lib/theme";
import type { RichTextBuilderModule } from "@/lib/modules/rich-text";
import { RichTextBody } from "./rich-text-body";

/**
 * RichText — Two Column
 *
 * Título a ancho completo + cuerpo dividido en 2 columnas.
 * Layout editorial compacto. Sin imagen.
 */
export function RichTextTwoColumn({ module }: { module: RichTextBuilderModule }) {
  const { content } = module;
  const { eyebrow, title, body, cta } = content;

  return (
    <section
      aria-labelledby={title ? `rt-${module.id}-title` : undefined}
      className="py-16"
      data-template="rich-text-two-column"
    >
      <div className="mx-auto max-w-5xl px-4">
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
            className="font-heading mb-8 text-3xl font-semibold leading-tight text-foreground md:text-4xl"
          >
            {title}
          </h2>
        ) : null}

        <div className="columns-1 gap-10 md:columns-2">
          <RichTextBody html={body} />
        </div>

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
