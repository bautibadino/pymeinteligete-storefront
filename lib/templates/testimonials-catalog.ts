import { z } from "zod";

import type { TestimonialsModule } from "@/lib/modules/testimonials";

/**
 * Catálogo de templates de Testimonios — solo metadata y schemas.
 * Sin importar componentes JSX; seguro en tests Node y endpoints de descubrimiento.
 *
 * Reglas no negociables:
 *   - Sin referencias a tenant, host ni env-vars.
 *   - Sin hex literals (los tokens son CSS vars; el render usa Tailwind).
 *   - `resolveTestimonialsTemplateId` nunca falla: degrada al default.
 */

// ─── IDs ───────────────────────────────────────────────────────────────────

export type TestimonialsTemplateId = TestimonialsModule["variant"];

export const TESTIMONIALS_TEMPLATE_IDS: readonly TestimonialsTemplateId[] = [
  "carousel",
  "grid",
  "masonry",
  "single-quote",
];

export const DEFAULT_TESTIMONIALS_TEMPLATE_ID: TestimonialsTemplateId = "carousel";

// ─── Descriptors ───────────────────────────────────────────────────────────

export type TestimonialsTemplateDescriptor = {
  id: TestimonialsTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
  contentSchema: z.ZodTypeAny;
};

const TestimonialsItemSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const TestimonialsContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(TestimonialsItemSchema).min(1),
});

export type TestimonialsContent = z.infer<typeof TestimonialsContentSchema>;

export const TESTIMONIALS_TEMPLATE_DESCRIPTORS: Record<
  TestimonialsTemplateId,
  TestimonialsTemplateDescriptor
> = {
  carousel: {
    id: "carousel",
    label: "Carrusel",
    description:
      "Carousel horizontal con flechas nativas y scroll-snap. Un testimonio a la vez; ideal para destacar cada voz.",
    bestFor: [
      "home con muchos testimonios",
      "mobile-first",
      "marcas que quieren impacto individual",
    ],
    thumbnailUrl: "/template-thumbnails/testimonials-carousel.svg",
    contentSchema: TestimonialsContentSchema,
  },
  grid: {
    id: "grid",
    label: "Grilla",
    description:
      "Grilla 2×2 o 3×2 de tarjetas. Muestra varios testimonios de un vistazo.",
    bestFor: ["páginas de producto", "landing pages", "tiendas con muchas reseñas"],
    thumbnailUrl: "/template-thumbnails/testimonials-grid.svg",
    contentSchema: TestimonialsContentSchema,
  },
  masonry: {
    id: "masonry",
    label: "Masonry",
    description:
      "Layout asimétrico en columnas CSS masonry. Máxima variedad visual para testimonios de distinto largo.",
    bestFor: ["marcas premium", "páginas de equipo", "agencias creativas"],
    thumbnailUrl: "/template-thumbnails/testimonials-masonry.svg",
    contentSchema: TestimonialsContentSchema,
  },
  "single-quote": {
    id: "single-quote",
    label: "Cita destacada",
    description:
      "Un testimonio único, centrado y grande. Máximo impacto para el caso de éxito más representativo.",
    bestFor: [
      "hero sections complementarias",
      "testimonios de referentes",
      "páginas de servicios profesionales",
    ],
    thumbnailUrl: "/template-thumbnails/testimonials-single-quote.svg",
    contentSchema: TestimonialsContentSchema,
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

export function isTestimonialsTemplateId(value: unknown): value is TestimonialsTemplateId {
  return (
    typeof value === "string" &&
    (TESTIMONIALS_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `TestimonialsTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined.
 */
export function resolveTestimonialsTemplateId(value: unknown): TestimonialsTemplateId {
  return isTestimonialsTemplateId(value) ? value : DEFAULT_TESTIMONIALS_TEMPLATE_ID;
}

// ─── SVG placeholder helper ────────────────────────────────────────────────

/**
 * Genera el string SVG de un thumbnail placeholder.
 * Usado internamente para producir los archivos de `public/template-thumbnails/`.
 * No se llama en runtime de renderizado — los thumbnails son estáticos.
 */
export function buildThumbnailSvg({
  label,
  accent = "#6366f1",
  rows = 2,
  cols = 2,
}: {
  label: string;
  accent?: string;
  rows?: number;
  cols?: number;
}): string {
  const w = 200;
  const h = 120;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`,
    `  <rect width="${w}" height="${h}" fill="#f8fafc" rx="8"/>`,
    Array.from({ length: rows * cols }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const gw = (w - 24) / cols;
      const gh = (h - 32) / rows;
      const x = 12 + col * gw + 4;
      const y = 12 + row * gh + 4;
      return `  <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(gw - 8).toFixed(1)}" height="${(gh - 8).toFixed(1)}" fill="${accent}22" rx="4"/>`;
    }).join("\n"),
    `  <text x="${w / 2}" y="${h - 8}" font-size="10" fill="#64748b" text-anchor="middle" font-family="sans-serif">${label}</text>`,
    "</svg>",
  ].join("\n");
}
