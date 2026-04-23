/**
 * Catálogo de templates ProductDetail — metadata pura (sin JSX).
 *
 * Seguro de importar en tests unitarios (Node/Vitest sin React)
 * y en server code que sólo necesite saber qué templates existen
 * (endpoints de descubrimiento, validación del bootstrap, editor ERP).
 *
 * Los componentes React viven en `components/templates/product-detail/`.
 * El registro global de componentes vive en `lib/templates/registry.ts`.
 */

import { z } from "zod";

import type { ProductDetailVariant } from "@/lib/modules/product-detail";

// ─── IDs y defaults ─────────────────────────────────────────────────────────

export type ProductDetailTemplateId = ProductDetailVariant;

export const PRODUCT_DETAIL_TEMPLATE_IDS: readonly ProductDetailTemplateId[] = [
  "gallery-specs",
  "cards-features",
  "accordion-details",
  "editorial",
];

export const DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID: ProductDetailTemplateId = "gallery-specs";

// ─── Schema Zod del contenido ────────────────────────────────────────────────

export const AccordionSectionSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

export const FeatureCardSchema = z.object({
  icon: z.string().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const ProductDetailContentSchema = z.object({
  showBreadcrumbs: z.boolean().optional(),
  showRelated: z.boolean().optional(),
  relatedSource: z.enum(["category", "brand", "collection"]).optional(),
  relatedLimit: z.number().min(1).max(12).optional(),
  accordionSections: z.array(AccordionSectionSchema).optional(),
  featureCards: z.array(FeatureCardSchema).optional(),
});

export type ProductDetailContent = z.infer<typeof ProductDetailContentSchema>;

// ─── Descriptores ────────────────────────────────────────────────────────────

export type ProductDetailTemplateDescriptor = {
  id: ProductDetailTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
  contentSchema: typeof ProductDetailContentSchema;
};

export const PRODUCT_DETAIL_TEMPLATE_DESCRIPTORS: Record<
  ProductDetailTemplateId,
  ProductDetailTemplateDescriptor
> = {
  "gallery-specs": {
    id: "gallery-specs",
    label: "Galería + Especificaciones",
    description:
      "Galería de imágenes a la izquierda y especificaciones con CTA a la derecha. Layout clásico de ficha de producto.",
    bestFor: ["e-commerce general", "productos técnicos", "catálogos con specs"],
    thumbnailUrl: "/template-thumbnails/product-detail-gallery-specs.svg",
    contentSchema: ProductDetailContentSchema,
  },
  "cards-features": {
    id: "cards-features",
    label: "Características en cards",
    description:
      "Galería arriba + grid de cards de características abajo. Ideal para destacar beneficios del producto.",
    bestFor: ["productos con múltiples beneficios", "electrónica", "herramientas"],
    thumbnailUrl: "/template-thumbnails/product-detail-cards-features.svg",
    contentSchema: ProductDetailContentSchema,
  },
  "accordion-details": {
    id: "accordion-details",
    label: "Acordeón de detalles",
    description:
      "Galería a la izquierda con descripción y acordeones expandibles para envío, devoluciones y detalles técnicos.",
    bestFor: ["productos complejos", "moda", "tiendas con políticas de envío extensas"],
    thumbnailUrl: "/template-thumbnails/product-detail-accordion-details.svg",
    contentSchema: ProductDetailContentSchema,
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    description:
      "Imagen hero grande + título + descripción en prosa + CTA flotante. Estética minimal para marcas premium.",
    bestFor: ["boutique", "moda", "lifestyle", "marcas premium"],
    thumbnailUrl: "/template-thumbnails/product-detail-editorial.svg",
    contentSchema: ProductDetailContentSchema,
  },
};

// ─── Guardas y resolvers ─────────────────────────────────────────────────────

export function isProductDetailTemplateId(
  value: unknown
): value is ProductDetailTemplateId {
  return (
    typeof value === "string" &&
    (PRODUCT_DETAIL_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `ProductDetailTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined.
 */
export function resolveProductDetailTemplateId(
  value: unknown
): ProductDetailTemplateId {
  return isProductDetailTemplateId(value) ? value : DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID;
}
