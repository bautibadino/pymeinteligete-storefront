/**
 * Catálogo de templates CatalogLayout — metadata pura (sin JSX).
 *
 * Seguro de importar en tests unitarios (Node/Vitest sin React)
 * y en server code que sólo necesite saber qué templates existen
 * (endpoints de descubrimiento, validación del bootstrap, editor ERP).
 *
 * Los componentes React viven en `components/templates/catalog-layout/`.
 * El registro de componentes vive en `lib/templates/catalog-layout-registry.ts`.
 */

import { z } from "zod";

import type { CatalogLayoutVariant } from "@/lib/modules/catalog-layout";
import { CATALOG_LAYOUT_VARIANTS } from "@/lib/modules/catalog-layout";

// ─── IDs y defaults ─────────────────────────────────────────────────────────

export type CatalogLayoutTemplateId = CatalogLayoutVariant;

export const CATALOG_LAYOUT_TEMPLATE_IDS: readonly CatalogLayoutTemplateId[] = CATALOG_LAYOUT_VARIANTS;

export const DEFAULT_CATALOG_LAYOUT_TEMPLATE_ID: CatalogLayoutTemplateId = "filters-sidebar";

// ─── Schema Zod del contenido ────────────────────────────────────────────────

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

// ─── Descriptores ────────────────────────────────────────────────────────────

export type CatalogLayoutTemplateDescriptor = {
  id: CatalogLayoutTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
  contentSchema: typeof CatalogLayoutContentSchema;
};

export const CATALOG_LAYOUT_TEMPLATE_DESCRIPTORS: Record<
  CatalogLayoutTemplateId,
  CatalogLayoutTemplateDescriptor
> = {
  "filters-sidebar": {
    id: "filters-sidebar",
    label: "Filtros lateral",
    description: "Filtros a la izquierda + grilla de productos a la derecha. Layout clásico de e-commerce.",
    bestFor: ["catálogos grandes", "tiendas con muchos filtros", "desktop-first"],
    thumbnailUrl: "/template-thumbnails/catalog-layout-filters-sidebar.svg",
    contentSchema: CatalogLayoutContentSchema,
  },
  "filters-top": {
    id: "filters-top",
    label: "Filtros arriba",
    description: "Barra de filtros horizontal arriba + grilla de productos debajo. Compacto y limpio.",
    bestFor: ["catálogos medianos", "mobile-first", "tiendas con pocos filtros"],
    thumbnailUrl: "/template-thumbnails/catalog-layout-filters-top.svg",
    contentSchema: CatalogLayoutContentSchema,
  },
  "infinite-scroll": {
    id: "infinite-scroll",
    label: "Scroll infinito",
    description: "Scroll infinito con filtros arriba. Carga productos al llegar al final de la página.",
    bestFor: ["experiencias discovery", "catálogos muy grandes", "usuarios que exploran"],
    thumbnailUrl: "/template-thumbnails/catalog-layout-infinite-scroll.svg",
    contentSchema: CatalogLayoutContentSchema,
  },
  "paginated-classic": {
    id: "paginated-classic",
    label: "Paginado clásico",
    description: "Paginado tradicional + filtros lateral. Control explícito de página y resultados.",
    bestFor: ["SEO-first", "catálogos medianos", "usuarios que buscan algo específico"],
    thumbnailUrl: "/template-thumbnails/catalog-layout-paginated-classic.svg",
    contentSchema: CatalogLayoutContentSchema,
  },
};

// ─── Guardas y resolvers ─────────────────────────────────────────────────────

export function isCatalogLayoutTemplateId(value: unknown): value is CatalogLayoutTemplateId {
  return typeof value === "string" && (CATALOG_LAYOUT_TEMPLATE_IDS as readonly string[]).includes(value);
}

/**
 * Devuelve un `CatalogLayoutTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined.
 */
export function resolveCatalogLayoutTemplateId(value: unknown): CatalogLayoutTemplateId {
  return isCatalogLayoutTemplateId(value) ? value : DEFAULT_CATALOG_LAYOUT_TEMPLATE_ID;
}
