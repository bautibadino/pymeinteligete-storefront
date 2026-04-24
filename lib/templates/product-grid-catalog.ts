import { z } from "zod";

import type { ProductGridVariant } from "@/lib/modules/product-grid";
import { PRODUCT_GRID_VARIANTS } from "@/lib/modules/product-grid";
import {
  ProductCardDisplayOptionsSchema,
} from "@/lib/templates/product-card-catalog";

/**
 * Catálogo de templates ProductGrid — metadata pura (sin JSX).
 *
 * Seguro de importar en tests unitarios (Node/Vitest sin React)
 * y en server code que sólo necesite saber qué templates existen
 * (endpoints de descubrimiento, validación del bootstrap, editor ERP).
 *
 * Los componentes React viven en `components/templates/product-grid/`.
 * Este catálogo NO se registra en `lib/templates/registry.ts` porque
 * ProductGrid es una sección builder independiente.
 */

// ─── IDs y defaults ─────────────────────────────────────────────────────────

export type ProductGridTemplateId = ProductGridVariant;

export const PRODUCT_GRID_TEMPLATE_IDS: readonly ProductGridTemplateId[] = PRODUCT_GRID_VARIANTS;

export const DEFAULT_PRODUCT_GRID_TEMPLATE_ID: ProductGridTemplateId = "grid-3";

// ─── Source schemas (re-export para editor) ─────────────────────────────────

export const ProductGridSourceCollectionSchema = z.object({
  type: z.literal("collection"),
  collectionId: z.string().min(1),
});

export const ProductGridSourceCategorySchema = z.object({
  type: z.literal("category"),
  categorySlug: z.string().min(1),
});

export const ProductGridSourceHandpickedSchema = z.object({
  type: z.literal("handpicked"),
  productIds: z.array(z.string().min(1)).min(1),
});

export const ProductGridSourceFeaturedSchema = z.object({
  type: z.literal("featured"),
});

export const ProductGridSourceNewestSchema = z.object({
  type: z.literal("newest"),
  limit: z.number().int().min(1).max(100).optional(),
});

export const ProductGridSourceSchema = z.discriminatedUnion("type", [
  ProductGridSourceCollectionSchema,
  ProductGridSourceCategorySchema,
  ProductGridSourceHandpickedSchema,
  ProductGridSourceFeaturedSchema,
  ProductGridSourceNewestSchema,
]);

// ─── Content schema ─────────────────────────────────────────────────────────

export const ProductGridContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  source: ProductGridSourceSchema,
  limit: z.number().int().min(1).max(100).optional(),
  cardVariant: z.enum(["classic", "compact", "editorial", "premium-commerce"]),
  cardDisplayOptions: ProductCardDisplayOptionsSchema.optional(),
  showViewAllLink: z.boolean().optional(),
  viewAllHref: z.string().optional(),
  viewAllLabel: z.string().optional(),
});

export type ProductGridContent = z.infer<typeof ProductGridContentSchema>;

// ─── Descriptores ───────────────────────────────────────────────────────────

export type ProductGridTemplateDescriptor = {
  id: ProductGridTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
  contentSchema: typeof ProductGridContentSchema;
};

function buildThumbnailUrl(variant: ProductGridTemplateId): string {
  return `/template-thumbnails/product-grid-${variant}.svg`;
}

export const PRODUCT_GRID_TEMPLATE_DESCRIPTORS: Record<
  ProductGridTemplateId,
  ProductGridTemplateDescriptor
> = {
  "grid-3": {
    id: "grid-3",
    label: "Grilla 3 columnas",
    description:
      "Grid responsive de 3 columnas en desktop, 2 en tablet y 1 en mobile. Equilibrio visual ideal para catálogos medianos.",
    bestFor: ["home destacados", "categorías con pocos productos", "relacionados en ficha"],
    thumbnailUrl: buildThumbnailUrl("grid-3"),
    contentSchema: ProductGridContentSchema,
  },
  "grid-4": {
    id: "grid-4",
    label: "Grilla 4 columnas",
    description:
      "Grid responsive de 4 columnas en desktop, 3 en tablet, 2 en mobile. Máxima densidad para catálogos grandes.",
    bestFor: ["catálogos extensos", "resultados de búsqueda", "mayoristas"],
    thumbnailUrl: buildThumbnailUrl("grid-4"),
    contentSchema: ProductGridContentSchema,
  },
  "carousel-arrows": {
    id: "carousel-arrows",
    label: "Carrusel con flechas",
    description:
      "Scroll horizontal scrolleable con botones de navegación. Ideal para destacados en home sin ocupar mucho vertical.",
    bestFor: ["home destacados", "ofertas flash", "nuevos ingresos"],
    thumbnailUrl: buildThumbnailUrl("carousel-arrows"),
    contentSchema: ProductGridContentSchema,
  },
  masonry: {
    id: "masonry",
    label: "Masonry",
    description:
      "Grilla de altura variable con cards de diferentes proporciones. Estética editorial para marcas premium.",
    bestFor: ["marcas premium", "lookbooks", "editorial de producto"],
    thumbnailUrl: buildThumbnailUrl("masonry"),
    contentSchema: ProductGridContentSchema,
  },
};

// ─── Guardas y resolvers ────────────────────────────────────────────────────

export function isProductGridTemplateId(value: unknown): value is ProductGridTemplateId {
  return (
    typeof value === "string" &&
    (PRODUCT_GRID_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `ProductGridTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined.
 */
export function resolveProductGridTemplateId(value: unknown): ProductGridTemplateId {
  return isProductGridTemplateId(value) ? value : DEFAULT_PRODUCT_GRID_TEMPLATE_ID;
}
