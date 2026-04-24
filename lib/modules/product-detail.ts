import { z } from "zod";

/**
 * Tipos del módulo ProductDetail — sistema builder (Ola 2).
 *
 * Este archivo define la forma del dato que reciben los componentes
 * de template de ficha de producto. Es independiente del sistema legacy
 * de módulos (`module-schema.ts`) y corresponde al contrato de
 * `SectionType = "productDetail"` de la Capa C (presentation).
 *
 * No importar desde `@/lib/modules/index.ts` — ese barrel es legacy.
 * Importar directamente desde `@/lib/modules/product-detail`.
 */

// ---------------------------------------------------------------------------
// Content schema (configuración visual — editable desde el editor)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Data interfaces (producto real — proviene de la API, no del editor)
// ---------------------------------------------------------------------------

export interface ProductDetailImage {
  url: string;
  alt?: string;
}

export interface ProductDetailSpecification {
  label: string;
  value: string;
}

export interface ProductDetailPrice {
  amount: number;
  currency: string;
  formatted: string;
}

export interface ProductDetailInstallments {
  count: number;
  amount: number;
  formatted: string;
  interestFree: boolean;
}

export interface ProductDetailCashDiscount {
  percent: number;
  formatted: string;
}

export interface ProductDetailBadge {
  label: string;
  tone?: "info" | "success" | "warning" | "accent";
}

export interface ProductDetailStock {
  available: boolean;
  label?: string;
}

/**
 * Datos del producto que cada variante de ficha consume.
 * Provienen de la API del producto (no del contentSchema del módulo).
 * TODO: integrar fetch real desde `/api/storefront/v1/products/{slug}`.
 */
export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  description?: string;
  images: ProductDetailImage[];
  price: ProductDetailPrice;
  compareAtPrice?: { amount: number; formatted: string };
  installments?: ProductDetailInstallments;
  cashDiscount?: ProductDetailCashDiscount;
  stock?: ProductDetailStock;
  badges?: ProductDetailBadge[];
  specifications?: ProductDetailSpecification[];
  href: string;
}

// ---------------------------------------------------------------------------
// Module type
// ---------------------------------------------------------------------------

export type ProductDetailVariant =
  | "gallery-specs"
  | "cards-features"
  | "accordion-details"
  | "editorial";

export interface ProductDetailModule {
  id: string;
  type: "productDetail";
  variant: ProductDetailVariant;
  content: ProductDetailContent;
  /** Datos del producto actual. TODO: fetch real. */
  product?: ProductDetailData;
  /** Productos relacionados para el bloque "relacionados". TODO: fetch real. */
  relatedProducts?: ProductCardData[];
}

// ---------------------------------------------------------------------------
// Dependencia: ProductCard para bloques relacionados
// ---------------------------------------------------------------------------

import type { ProductCardData } from "@/lib/templates/product-card-catalog";
