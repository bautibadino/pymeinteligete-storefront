/**
 * Catálogo de variantes de ProductCard.
 *
 * `productCard` NO es una section autónoma del page-builder.
 * Es una dependencia que `productGrid`, `productDetail` y `catalogLayout`
 * referencian para elegir el estilo de cada tarjeta de producto.
 * Por eso NO aparece en `registry.ts` ni en `ModuleRenderer`.
 *
 * Este módulo exporta:
 *   - `ProductCardTemplateId` — tipo literal de los ids válidos.
 *   - `PRODUCT_CARD_TEMPLATE_IDS` — array readonly de los ids.
 *   - `DEFAULT_PRODUCT_CARD_TEMPLATE_ID` — fallback seguro.
 *   - `PRODUCT_CARD_TEMPLATE_DESCRIPTORS` — metadata para el editor.
 *   - `isProductCardTemplateId` — type guard.
 *   - `resolveProductCardTemplateId` — nunca falla, siempre devuelve un id válido.
 *   - `ProductCardData` — interface de datos que recibe cada variante.
 *   - `ProductCardDisplayOptions` — opciones de visualización opcionales.
 */

// ---------------------------------------------------------------------------
// Template IDs
// ---------------------------------------------------------------------------

export type ProductCardTemplateId =
  | "classic"
  | "compact"
  | "editorial"
  | "premium-commerce";

export const PRODUCT_CARD_TEMPLATE_IDS: readonly ProductCardTemplateId[] = [
  "classic",
  "compact",
  "editorial",
  "premium-commerce",
];

export const DEFAULT_PRODUCT_CARD_TEMPLATE_ID: ProductCardTemplateId = "classic";

// ---------------------------------------------------------------------------
// Descriptors (para el editor / endpoints de descubrimiento)
// ---------------------------------------------------------------------------

export type ProductCardTemplateDescriptor = {
  id: ProductCardTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
};

export const PRODUCT_CARD_TEMPLATE_DESCRIPTORS: Record<
  ProductCardTemplateId,
  ProductCardTemplateDescriptor
> = {
  classic: {
    id: "classic",
    label: "Clásico",
    description:
      "Imagen + marca + nombre + precio + botón «Agregar al carrito». Layout vertical estándar.",
    bestFor: ["catálogos generales", "tiendas mayoristas", "supermercados"],
    thumbnailUrl: "/template-thumbnails/product-card-classic.svg",
  },
  compact: {
    id: "compact",
    label: "Compacto",
    description:
      "Imagen chica + nombre + precio + CTA ícono. Ideal para grillas de 4 o 5 columnas.",
    bestFor: ["catálogos densos", "comparadores de precio", "mobile-first"],
    thumbnailUrl: "/template-thumbnails/product-card-compact.svg",
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    description:
      "Imagen grande + tipografía elegante + precio sutil. Estética minimal para marcas premium.",
    bestFor: ["boutique", "moda", "lifestyle", "marcas premium"],
    thumbnailUrl: "/template-thumbnails/product-card-editorial.svg",
  },
  "premium-commerce": {
    id: "premium-commerce",
    label: "Premium Commerce",
    description:
      "Badges, marca, imagen, nombre, cuotas, precio tachado, descuento contado y estado de stock. Paridad BYM.",
    bestFor: ["lubricentros", "mayoristas", "ferretería", "tiendas con cuotas"],
    thumbnailUrl: "/template-thumbnails/product-card-premium-commerce.svg",
  },
};

// ---------------------------------------------------------------------------
// Type guard y resolver
// ---------------------------------------------------------------------------

export function isProductCardTemplateId(
  value: unknown
): value is ProductCardTemplateId {
  return (
    typeof value === "string" &&
    (PRODUCT_CARD_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `ProductCardTemplateId` válido a partir de cualquier input.
 * Si no matchea, degrada al default. Nunca devuelve undefined ni lanza.
 */
export function resolveProductCardTemplateId(
  value: unknown
): ProductCardTemplateId {
  return isProductCardTemplateId(value) ? value : DEFAULT_PRODUCT_CARD_TEMPLATE_ID;
}

// ---------------------------------------------------------------------------
// Data interfaces
// ---------------------------------------------------------------------------

export interface ProductCardPrice {
  amount: number;
  currency: string;
  formatted: string;
}

export interface ProductCardInstallments {
  count: number;
  amount: number;
  formatted: string;
  interestFree: boolean;
}

export interface ProductCardCashDiscount {
  percent: number;
  formatted: string;
}

export interface ProductCardBadge {
  label: string;
  tone?: "info" | "success" | "warning" | "accent";
}

export interface ProductCardStock {
  available: boolean;
  label?: string;
}

/**
 * Datos del producto que cada variante de card consume.
 * Provienen de la API del producto (no del contentSchema del módulo).
 */
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  imageUrl?: string;
  price: ProductCardPrice;
  compareAtPrice?: { amount: number; formatted: string };
  installments?: ProductCardInstallments;
  cashDiscount?: ProductCardCashDiscount;
  badges?: ProductCardBadge[];
  stock?: ProductCardStock;
  href: string;
}

/**
 * Opciones de visualización que el productGrid (u otro contenedor) puede
 * pasar a la card para controlar qué campos mostrar.
 */
export interface ProductCardDisplayOptions {
  showBrand?: boolean;
  showBadges?: boolean;
  showInstallments?: boolean;
  showCashDiscount?: boolean;
  showAddToCart?: boolean;
}
