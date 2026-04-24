import { z } from "zod";

import { ProductCardDisplayOptionsSchema } from "@/lib/templates/product-card-catalog";

/**
 * Definición de tipos e interfaces para el módulo ProductGrid del builder.
 *
 * Este archivo es la fuente de verdad de tipos y schemas Zod para el
 * sistema de plantillas (Ola 2). El renderer de módulos legacy (ModuleRenderer)
 * sigue usando los tipos legacy de `module-schema.ts`.
 *
 * ProductGrid consume ProductCard como dependencia visual:
 *   - `cardVariant` selecciona el template de card.
 *   - `cardDisplayOptions` controla qué campos mostrar en cada card.
 */

// ─── Source schemas ─────────────────────────────────────────────────────────

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
export type ProductGridSource = z.infer<typeof ProductGridSourceSchema>;

// ─── Variants ───────────────────────────────────────────────────────────────

export type ProductGridVariant = "grid-3" | "grid-4" | "carousel-arrows" | "masonry";

export const PRODUCT_GRID_VARIANTS: readonly ProductGridVariant[] = [
  "grid-3",
  "grid-4",
  "carousel-arrows",
  "masonry",
] as const;

// ─── Module type ────────────────────────────────────────────────────────────

export interface ProductGridModule {
  id: string;
  type: "productGrid";
  variant: ProductGridVariant;
  content: ProductGridContent;
}
