/**
 * Catálogo de templates FAQ — metadata pura (sin JSX).
 *
 * Seguro de importar en tests unitarios (Node/Vitest sin React)
 * y en server code que sólo necesite saber qué templates existen
 * (endpoints de descubrimiento, validación del bootstrap, editor ERP).
 *
 * Los componentes React viven en `components/templates/faq/`.
 * El registro de componentes vive en `lib/templates/registry.ts`.
 */

import { z } from "zod";

import type { FaqVariant } from "@/lib/modules/faq";

// ─── IDs y defaults ─────────────────────────────────────────────────────────

export type FaqTemplateId = FaqVariant;

export const FAQ_TEMPLATE_IDS: readonly FaqTemplateId[] = [
  "accordion",
  "two-column",
  "search",
  "categories",
];

export const DEFAULT_FAQ_TEMPLATE_ID: FaqTemplateId = "accordion";

// ─── Schema Zod del contenido ────────────────────────────────────────────────

export const FaqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
});

export const FaqContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(FaqItemSchema).min(1),
});

export type FaqContent = z.infer<typeof FaqContentSchema>;

// ─── Descriptores ────────────────────────────────────────────────────────────

export type FaqTemplateDescriptor = {
  id: FaqTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
  contentSchema: typeof FaqContentSchema;
};

export const FAQ_TEMPLATE_DESCRIPTORS: Record<FaqTemplateId, FaqTemplateDescriptor> = {
  accordion: {
    id: "accordion",
    label: "Acordeón",
    description: "Preguntas apiladas con respuesta expandible. Clásico y escaneable.",
    bestFor: ["página de soporte", "productos con muchos detalles", "ayuda al checkout"],
    thumbnailUrl: "/template-thumbnails/faq-accordion.svg",
    contentSchema: FaqContentSchema,
  },
  "two-column": {
    id: "two-column",
    label: "Dos columnas",
    description: "Q&A dispuestos en grilla de 2 columnas, sin colapso. Denso y escaneable.",
    bestFor: ["páginas informativas", "secciones cortas de FAQ", "about us"],
    thumbnailUrl: "/template-thumbnails/faq-two-column.svg",
    contentSchema: FaqContentSchema,
  },
  search: {
    id: "search",
    label: "Buscador",
    description: "Input de búsqueda que filtra preguntas en tiempo real con tags de categoría.",
    bestFor: ["bases de conocimiento grandes", "soporte técnico", "más de 10 preguntas"],
    thumbnailUrl: "/template-thumbnails/faq-search.svg",
    contentSchema: FaqContentSchema,
  },
  categories: {
    id: "categories",
    label: "Por categorías",
    description: "Preguntas agrupadas en tabs por categoría. Ideal cuando hay múltiples temas.",
    bestFor: ["e-commerce con envíos/pagos/devoluciones", "multi-tema", "soporte estructurado"],
    thumbnailUrl: "/template-thumbnails/faq-categories.svg",
    contentSchema: FaqContentSchema,
  },
};

// ─── Guardas y resolvers ─────────────────────────────────────────────────────

export function isFaqTemplateId(value: unknown): value is FaqTemplateId {
  return typeof value === "string" && (FAQ_TEMPLATE_IDS as readonly string[]).includes(value);
}

/**
 * Devuelve un `FaqTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined.
 */
export function resolveFaqTemplateId(value: unknown): FaqTemplateId {
  return isFaqTemplateId(value) ? value : DEFAULT_FAQ_TEMPLATE_ID;
}
