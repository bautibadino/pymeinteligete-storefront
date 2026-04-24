import { z } from "zod";

import type { RichTextContent, RichTextVariant } from "@/lib/modules/rich-text";

/**
 * Catálogo de variantes para secciones `richText`.
 *
 * Seguro de importar en tests unitarios (sin JSX / React).
 * Los componentes React viven en `components/templates/rich-text/`.
 *
 * Patrón análogo a `lib/templates/hero-catalog.ts`.
 */

// ---------------------------------------------------------------------------
// IDs
// ---------------------------------------------------------------------------

export type RichTextTemplateId = RichTextVariant;

export const RICH_TEXT_TEMPLATE_IDS: readonly RichTextTemplateId[] = [
  "full-width-prose",
  "two-column",
  "image-left-text-right",
  "image-right-text-left",
] as const;

export const DEFAULT_RICH_TEXT_TEMPLATE_ID: RichTextTemplateId = "full-width-prose";

// ---------------------------------------------------------------------------
// Descriptor
// ---------------------------------------------------------------------------

export type RichTextTemplateDescriptor = {
  id: RichTextTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
};

export const RICH_TEXT_TEMPLATE_DESCRIPTORS: Record<
  RichTextTemplateId,
  RichTextTemplateDescriptor
> = {
  "full-width-prose": {
    id: "full-width-prose",
    label: "Prose completo",
    description: "Contenido centrado, ancho medio, tipografía editorial. Ideal para artículos y páginas informativas.",
    bestFor: ["páginas 'Sobre nosotros'", "artículos", "contenido largo", "políticas"],
    thumbnailUrl: "/template-thumbnails/rich-text-full-width-prose.svg",
  },
  "two-column": {
    id: "two-column",
    label: "Dos columnas",
    description: "Texto dividido en dos columnas para una presentación editorial compacta.",
    bestFor: ["contenido editorial", "revistas", "blogs premium", "landing pages"],
    thumbnailUrl: "/template-thumbnails/rich-text-two-column.svg",
  },
  "image-left-text-right": {
    id: "image-left-text-right",
    label: "Imagen izquierda",
    description: "Imagen a la izquierda con texto e CTA a la derecha. Clásico 50/50.",
    bestFor: ["presentación de equipo", "historia de la empresa", "features"],
    thumbnailUrl: "/template-thumbnails/rich-text-image-left-text-right.svg",
  },
  "image-right-text-left": {
    id: "image-right-text-left",
    label: "Imagen derecha",
    description: "Texto a la izquierda con imagen a la derecha. Versión espejada del anterior.",
    bestFor: ["alternancia de bloques", "secciones intercaladas", "storytelling"],
    thumbnailUrl: "/template-thumbnails/rich-text-image-right-text-left.svg",
  },
};

// ---------------------------------------------------------------------------
// Zod content schema (§12 de 02-catalogo-secciones.md)
// ---------------------------------------------------------------------------

const CtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z.enum(["primary", "secondary", "link"]).optional(),
});

export const RichTextContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  body: z.string(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  cta: CtaSchema.optional(),
});

// ---------------------------------------------------------------------------
// Default content por variante
// ---------------------------------------------------------------------------

export function getDefaultRichTextContent(variant: RichTextTemplateId): RichTextContent {
  const base: RichTextContent = {
    title: "Título de la sección",
    body: "<p>Escribe aquí el contenido de tu sección. Puedes usar <strong>HTML básico</strong> o texto plano.</p>",
  };

  if (variant === "image-left-text-right" || variant === "image-right-text-left") {
    return { ...base, imageUrl: "", imageAlt: "" };
  }

  return base;
}

// ---------------------------------------------------------------------------
// Guards y resolvers
// ---------------------------------------------------------------------------

export function isRichTextTemplateId(value: unknown): value is RichTextTemplateId {
  return (
    typeof value === "string" &&
    (RICH_TEXT_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Nunca falla: degrada al default si el input no matchea.
 */
export function resolveRichTextTemplateId(value: unknown): RichTextTemplateId {
  return isRichTextTemplateId(value) ? value : DEFAULT_RICH_TEXT_TEMPLATE_ID;
}
