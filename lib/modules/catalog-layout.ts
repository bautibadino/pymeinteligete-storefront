import { z } from "zod";

import type { ProductCardDisplayOptions } from "@/lib/templates/product-card-catalog";

/**
 * Definición de tipos e interfaces para el módulo CatalogLayout del builder.
 *
 * Este archivo es la fuente de verdad de tipos y schemas Zod para el
 * sistema de plantillas (Ola 2). El renderer de módulos legacy (ModuleRenderer)
 * no conoce este tipo; es exclusivo del sistema builder.
 */

export const CATALOG_LAYOUT_VARIANTS = [
  "filters-sidebar",
  "filters-top",
  "infinite-scroll",
  "paginated-classic",
] as const;

export type CatalogLayoutVariant = (typeof CATALOG_LAYOUT_VARIANTS)[number];

export const CatalogLayoutContentSchema = z.object({
  cardVariant: z.enum(["classic", "compact", "editorial", "premium-commerce"]),
  cardDisplayOptions: z
    .object({
      showBrand: z.boolean().optional(),
      showBadges: z.boolean().optional(),
      showInstallments: z.boolean().optional(),
      showCashDiscount: z.boolean().optional(),
      showAddToCart: z.boolean().optional(),
    })
    .optional(),
  filters: z
    .object({
      brand: z.boolean().optional(),
      priceRange: z.boolean().optional(),
      category: z.boolean().optional(),
      availability: z.boolean().optional(),
      rating: z.boolean().optional(),
    })
    .optional(),
  sort: z
    .object({
      options: z.array(z.enum(["relevance", "priceAsc", "priceDesc", "newest", "popular"])),
      default: z.enum(["relevance", "priceAsc", "priceDesc", "newest", "popular"]),
    })
    .optional(),
  perPage: z.number().min(1).max(96).optional(),
});

export type CatalogLayoutContent = z.infer<typeof CatalogLayoutContentSchema>;

export interface CatalogLayoutModule {
  id: string;
  type: "catalogLayout";
  variant: CatalogLayoutVariant;
  content: CatalogLayoutContent;
}
