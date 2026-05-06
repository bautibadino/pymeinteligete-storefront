import { z } from "zod";

import {
  ProductCardDisplayOptionsSchema,
  isProductCardStockBadgeTone,
  resolveProductCardTemplateId,
  type ProductCardData,
  type ProductCardDisplayOptions,
} from "@/lib/templates/product-card-catalog";

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
  cardVariant: z.enum(["classic", "compact", "editorial", "premium-commerce", "spotlight-commerce"]),
  cardDisplayOptions: ProductCardDisplayOptionsSchema.optional(),
  showViewAllLink: z.boolean().optional(),
  viewAllHref: z.string().optional(),
  viewAllLabel: z.string().optional(),
});

export type ProductGridContent = z.infer<typeof ProductGridContentSchema>;
export type ProductGridSource = z.infer<typeof ProductGridSourceSchema>;

// ─── Variants ───────────────────────────────────────────────────────────────

export type ProductGridVariant =
  | "grid-3"
  | "grid-4"
  | "carousel-arrows"
  | "masonry"
  | "spotlight-carousel";

export const PRODUCT_GRID_VARIANTS: readonly ProductGridVariant[] = [
  "grid-3",
  "grid-4",
  "carousel-arrows",
  "masonry",
  "spotlight-carousel",
] as const;

// ─── Module type ────────────────────────────────────────────────────────────

export interface ProductGridModule {
  id: string;
  type: "productGrid";
  variant: ProductGridVariant;
  content: ProductGridContent;
  /**
   * Datos comerciales resueltos server-side por host.
   * No forma parte del content editable del builder.
   */
  products?: ProductCardData[];
  carouselMeta?: {
    empresaId?: string;
    tenantSlug?: string;
    installmentsLabel?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
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

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const values = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);

  return values.length > 0 ? values : undefined;
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

function normalizeProductGridSource(value: unknown): ProductGridSource {
  if (!isRecord(value)) {
    return { type: "featured" };
  }

  switch (value.type) {
    case "collection": {
      const collectionId = readString(value.collectionId);
      return collectionId ? { type: "collection", collectionId } : { type: "featured" };
    }
    case "category": {
      const categorySlug = readString(value.categorySlug);
      return categorySlug ? { type: "category", categorySlug } : { type: "featured" };
    }
    case "handpicked": {
      const productIds = readStringArray(value.productIds);
      return productIds ? { type: "handpicked", productIds } : { type: "featured" };
    }
    case "newest": {
      const limit = readPositiveInteger(value.limit, 100);
      return limit === undefined ? { type: "newest" } : { type: "newest", limit };
    }
    case "featured":
    default:
      return { type: "featured" };
  }
}

export function normalizeProductGridContent(input: unknown): ProductGridContent {
  const content = isRecord(input) ? input : {};
  const normalized: ProductGridContent = {
    source: normalizeProductGridSource(content.source),
    cardVariant: resolveProductCardTemplateId(content.cardVariant),
  };
  const title = readString(content.title);
  const subtitle = readString(content.subtitle);
  const limit = readPositiveInteger(content.limit, 100);
  const cardDisplayOptions = readDisplayOptions(content.cardDisplayOptions);
  const showViewAllLink = readBoolean(content.showViewAllLink);
  const viewAllHref = readString(content.viewAllHref);
  const viewAllLabel = readString(content.viewAllLabel);

  if (title) normalized.title = title;
  if (subtitle) normalized.subtitle = subtitle;
  if (limit !== undefined) normalized.limit = limit;
  if (cardDisplayOptions) normalized.cardDisplayOptions = cardDisplayOptions;
  if (showViewAllLink !== undefined) normalized.showViewAllLink = showViewAllLink;
  if (viewAllHref) normalized.viewAllHref = viewAllHref;
  if (viewAllLabel) normalized.viewAllLabel = viewAllLabel;

  return normalized;
}
