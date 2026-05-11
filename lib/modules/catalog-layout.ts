import { z } from "zod";
import type { StorefrontCatalogFacets, StorefrontCategory } from "@/lib/storefront-api";

import {
  isProductCardStockBadgeTone,
  resolveProductCardTemplateId,
  type ProductCardData,
  type ProductCardDisplayOptions,
} from "@/lib/templates/product-card-catalog";

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

export const CATALOG_LAYOUT_SORT_OPTIONS = [
  "relevance",
  "priceAsc",
  "priceDesc",
  "newest",
  "popular",
] as const;

export type CatalogLayoutSortOption = (typeof CATALOG_LAYOUT_SORT_OPTIONS)[number];
export const CATALOG_LAYOUT_DENSITIES = ["compact", "comfortable"] as const;
export type CatalogLayoutDensity = (typeof CATALOG_LAYOUT_DENSITIES)[number];

export const CatalogLayoutSortOptionSchema = z.enum(CATALOG_LAYOUT_SORT_OPTIONS);
export const CatalogLayoutDensitySchema = z.enum(CATALOG_LAYOUT_DENSITIES);

export const CatalogLayoutSortSchema = z
  .object({
    options: z.array(CatalogLayoutSortOptionSchema).min(1),
    default: CatalogLayoutSortOptionSchema,
  })
  .superRefine((sort, ctx) => {
    if (!sort.options.includes(sort.default)) {
      ctx.addIssue({
        code: "custom",
        path: ["default"],
        message: "sort.default debe estar incluido en sort.options",
      });
    }
  });

export const CatalogLayoutFiltersSchema = z.object({
  brand: z.boolean().optional(),
  priceRange: z.boolean().optional(),
  category: z.boolean().optional(),
  availability: z.boolean().optional(),
  rating: z.boolean().optional(),
});

export const CatalogLayoutContentSchema = z.object({
  cardVariant: z.enum(["classic", "compact", "editorial", "premium-commerce", "spotlight-commerce"]),
  density: CatalogLayoutDensitySchema.optional(),
  cardDisplayOptions: z
    .object({
      showBrand: z.boolean().optional(),
      showBadges: z.boolean().optional(),
      showInstallments: z.boolean().optional(),
      showCashDiscount: z.boolean().optional(),
      showStockBadge: z.boolean().optional(),
      stockBadgeTone: z.enum(["slate", "forest", "ocean", "amber"]).optional(),
      showAddToCart: z.boolean().optional(),
    })
    .optional(),
  filters: CatalogLayoutFiltersSchema.optional(),
  sort: CatalogLayoutSortSchema.optional(),
  perPage: z.number().min(1).max(96).optional(),
});

export type CatalogLayoutContent = z.infer<typeof CatalogLayoutContentSchema>;
export type CatalogLayoutFilters = z.infer<typeof CatalogLayoutFiltersSchema>;
export type CatalogLayoutSort = z.infer<typeof CatalogLayoutSortSchema>;

export interface CatalogLayoutModule {
  id: string;
  type: "catalogLayout";
  variant: CatalogLayoutVariant;
  content: CatalogLayoutContent;
  /**
   * Productos resueltos desde `/api/storefront/v1/catalog`.
   * Runtime-only: no se persiste en presentation.
   */
  products?: ProductCardData[];
  /**
   * Categorías públicas resueltas por host.
   * Runtime-only: se usan para construir filtros descubribles.
   */
  categories?: StorefrontCategory[];
  /**
   * Facets globales resueltos desde el catálogo activo.
   * Runtime-only: evitan derivar filtros desde la página parcial de productos.
   */
  facets?: StorefrontCatalogFacets;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function readPositiveInteger(value: unknown, max: number): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return undefined;
  }

  if (value < 1) {
    return 1;
  }

  return Math.min(value, max);
}

function readDisplayOptions(value: unknown): ProductCardDisplayOptions | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const displayOptions: ProductCardDisplayOptions = {};
  const showBrand = readBoolean(value.showBrand);
  const showBadges = readBoolean(value.showBadges);
  const showInstallments = readBoolean(value.showInstallments);
  const showCashDiscount = readBoolean(value.showCashDiscount);
  const showAddToCart = readBoolean(value.showAddToCart);
  const showStockBadge = readBoolean(value.showStockBadge);
  const stockBadgeTone = isProductCardStockBadgeTone(value.stockBadgeTone)
    ? value.stockBadgeTone
    : undefined;

  if (showBrand !== undefined) displayOptions.showBrand = showBrand;
  if (showBadges !== undefined) displayOptions.showBadges = showBadges;
  if (showInstallments !== undefined) displayOptions.showInstallments = showInstallments;
  if (showCashDiscount !== undefined) displayOptions.showCashDiscount = showCashDiscount;
  if (showAddToCart !== undefined) displayOptions.showAddToCart = showAddToCart;
  if (showStockBadge !== undefined) displayOptions.showStockBadge = showStockBadge;
  if (stockBadgeTone !== undefined) displayOptions.stockBadgeTone = stockBadgeTone;

  return Object.keys(displayOptions).length > 0 ? displayOptions : undefined;
}

function isCatalogLayoutDensity(value: unknown): value is CatalogLayoutDensity {
  return typeof value === "string" && (CATALOG_LAYOUT_DENSITIES as readonly string[]).includes(value);
}

function readFilters(value: unknown): CatalogLayoutFilters | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const filters: CatalogLayoutFilters = {};
  const brand = readBoolean(value.brand);
  const priceRange = readBoolean(value.priceRange);
  const category = readBoolean(value.category);
  const availability = readBoolean(value.availability);
  const rating = readBoolean(value.rating);

  if (brand !== undefined) filters.brand = brand;
  if (priceRange !== undefined) filters.priceRange = priceRange;
  if (category !== undefined) filters.category = category;
  if (availability !== undefined) filters.availability = availability;
  if (rating !== undefined) filters.rating = rating;

  return Object.keys(filters).length > 0 ? filters : undefined;
}

function isCatalogLayoutSortOption(value: unknown): value is CatalogLayoutSortOption {
  return (
    typeof value === "string" &&
    (CATALOG_LAYOUT_SORT_OPTIONS as readonly string[]).includes(value)
  );
}

function readSort(value: unknown): CatalogLayoutSort | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const configuredOptions = Array.isArray(value.options)
    ? value.options.filter(isCatalogLayoutSortOption)
    : [];
  const options = [...new Set(configuredOptions)];

  if (options.length === 0) {
    return undefined;
  }

  const fallbackSort = options[0];
  if (!fallbackSort) {
    return undefined;
  }

  const defaultSort: CatalogLayoutSortOption = isCatalogLayoutSortOption(value.default) && options.includes(value.default)
    ? value.default
    : fallbackSort;

  return {
    options,
    default: defaultSort,
  };
}

export function normalizeCatalogLayoutContent(input: unknown): CatalogLayoutContent {
  const content = isRecord(input) ? input : {};
  const normalized: CatalogLayoutContent = {
    cardVariant: resolveProductCardTemplateId(content.cardVariant),
    density: isCatalogLayoutDensity(content.density) ? content.density : "compact",
  };
  const cardDisplayOptions = readDisplayOptions(content.cardDisplayOptions);
  const filters = readFilters(content.filters);
  const sort = readSort(content.sort);
  const perPage = readPositiveInteger(content.perPage, 96);

  if (cardDisplayOptions) normalized.cardDisplayOptions = cardDisplayOptions;
  if (filters) normalized.filters = filters;
  if (sort) normalized.sort = sort;
  if (perPage !== undefined) normalized.perPage = perPage;

  return normalized;
}
