/**
 * Catálogo de templates de Category Tile — Ola 2, A4.
 *
 * Este archivo es seguro de importar en tests unitarios (vitest corre
 * en Node sin plugin de React) y en server code que sólo necesite saber
 * qué templates existen (endpoints de descubrimiento, validación del
 * bootstrap, editor del ERP).
 *
 * Los componentes React viven en:
 *   components/templates/category-tile/category-tile-<variant>.tsx
 *
 * Reglas no negociables:
 *   - Sin imports de React ni de Next.js.
 *   - Sin referencias a tenant, host ni env-vars.
 *   - 0 hex literales.
 */

import { z } from "zod";

import type { CategoryTileItem, CategoryTileModule, CategoryTileTemplateId } from "@/lib/modules/category-tile";

export type { CategoryTileTemplateId };

// ---------------------------------------------------------------------------
// IDs
// ---------------------------------------------------------------------------

export const CATEGORY_TILE_TEMPLATE_IDS: readonly CategoryTileTemplateId[] = [
  "grid-cards",
  "rail-horizontal",
  "masonry",
  "compact-list",
];

export const DEFAULT_CATEGORY_TILE_TEMPLATE_ID: CategoryTileTemplateId = "grid-cards";

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export function isCategoryTileTemplateId(value: unknown): value is CategoryTileTemplateId {
  return (
    typeof value === "string" &&
    (CATEGORY_TILE_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `CategoryTileTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined.
 */
export function resolveCategoryTileTemplateId(value: unknown): CategoryTileTemplateId {
  return isCategoryTileTemplateId(value) ? value : DEFAULT_CATEGORY_TILE_TEMPLATE_ID;
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const CategoryTileItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  imageUrl: z.string().url().optional(),
  icon: z.string().optional(),
});

/** Schema compartido para todas las variantes (el contenido es el mismo). */
const CategoryTileBaseContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  tiles: z.array(CategoryTileItemSchema).min(1),
});

export type CategoryTileContent = z.infer<typeof CategoryTileBaseContentSchema>;

/**
 * Schemas por variante — misma estructura, mantenidos separados
 * para que el editor del ERP pueda discriminar por variante si en
 * el futuro se añaden campos específicos a una variante.
 */
export const CATEGORY_TILE_CONTENT_SCHEMAS: Record<
  CategoryTileTemplateId,
  typeof CategoryTileBaseContentSchema
> = {
  "grid-cards": CategoryTileBaseContentSchema,
  "rail-horizontal": CategoryTileBaseContentSchema,
  masonry: CategoryTileBaseContentSchema,
  "compact-list": CategoryTileBaseContentSchema,
};

/**
 * Valida el contenido de un category-tile para la variante dada.
 * Devuelve `{ success, data, error }` (resultado Zod safeParse).
 */
export function validateCategoryTileContent(
  variant: CategoryTileTemplateId,
  content: unknown,
) {
  return CATEGORY_TILE_CONTENT_SCHEMAS[variant].safeParse(content);
}

// ---------------------------------------------------------------------------
// Default content
// ---------------------------------------------------------------------------

const DEFAULT_TILES: CategoryTileItem[] = [
  { label: "Categoría 1", href: "/catalogo/categoria-1" },
  { label: "Categoría 2", href: "/catalogo/categoria-2" },
  { label: "Categoría 3", href: "/catalogo/categoria-3" },
  { label: "Categoría 4", href: "/catalogo/categoria-4" },
];

export const defaultCategoryTileContent: CategoryTileContent = {
  title: "¿Qué estás buscando?",
  subtitle: "Explorá nuestras categorías",
  tiles: DEFAULT_TILES,
};

// ---------------------------------------------------------------------------
// Descriptores
// ---------------------------------------------------------------------------

export type TemplateDescriptor = {
  id: CategoryTileTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
};

export const CATEGORY_TILE_TEMPLATE_DESCRIPTORS: Record<
  CategoryTileTemplateId,
  TemplateDescriptor
> = {
  "grid-cards": {
    id: "grid-cards",
    label: "Grid de tarjetas",
    description:
      "Grid 3×2 o 4×2 con imagen de categoría y label sobre overlay. Layout clásico e-commerce.",
    bestFor: [
      "catálogos con imágenes de alta calidad",
      "tiendas con pocas categorías principales",
      "home de e-commerce generalista",
    ],
    thumbnailUrl: "/template-thumbnails/category-tile-grid-cards.svg",
  },
  "rail-horizontal": {
    id: "rail-horizontal",
    label: "Rail horizontal",
    description:
      "Scroll horizontal en cualquier viewport con tiles circulares o cuadradas. Ideal para mobile.",
    bestFor: [
      "mobile-first",
      "muchas categorías",
      "UX rápida para explorar",
    ],
    thumbnailUrl: "/template-thumbnails/category-tile-rail-horizontal.svg",
  },
  masonry: {
    id: "masonry",
    label: "Masonry",
    description:
      "Layout asimétrico con hero tile grande y secundarios pequeños. Impacto visual fuerte.",
    bestFor: [
      "home con imagen premium",
      "catálogos con categoría principal destacada",
      "marcas de lifestyle",
    ],
    thumbnailUrl: "/template-thumbnails/category-tile-masonry.svg",
  },
  "compact-list": {
    id: "compact-list",
    label: "Lista compacta",
    description:
      "Lista vertical con ícono + label. Sin imágenes. Máxima densidad, mobile-friendly.",
    bestFor: [
      "listados de categorías numerosas",
      "mobile sin imágenes de categoría",
      "UX minimalista",
    ],
    thumbnailUrl: "/template-thumbnails/category-tile-compact-list.svg",
  },
};

// ---------------------------------------------------------------------------
// Default module (para bootstrapear un tenant nuevo)
// ---------------------------------------------------------------------------

export const defaultCategoryTileModule: CategoryTileModule = {
  id: "sec_cats_default",
  type: "categoryTile",
  variant: DEFAULT_CATEGORY_TILE_TEMPLATE_ID,
  title: "¿Qué estás buscando?",
  subtitle: "Explorá nuestras categorías",
  tiles: DEFAULT_TILES,
};
