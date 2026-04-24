import type { ComponentType } from "react";

import { ProductCardClassic } from "@/components/templates/product-card/product-card-classic";
import { ProductCardCompact } from "@/components/templates/product-card/product-card-compact";
import { ProductCardEditorial } from "@/components/templates/product-card/product-card-editorial";
import { ProductCardPremiumCommerce } from "@/components/templates/product-card/product-card-premium-commerce";
import {
  resolveProductCardTemplateId,
  type ProductCardData,
  type ProductCardDisplayOptions,
  type ProductCardTemplateId,
} from "@/lib/templates/product-card-catalog";

/**
 * Registry de componentes de ProductCard — archivo separado del global registry.ts.
 *
 * `productCard` es una DEPENDENCIA de otros tipos de sección
 * (`productGrid`, `productDetail`, `catalogLayout`), NO una section autónoma.
 * Por eso este archivo es independiente y NO modifica `lib/templates/registry.ts`.
 *
 * Uso esperado:
 *   const ProductCard = resolveProductCardTemplate(cardVariant);
 *   <ProductCard product={productData} displayOptions={opts} />
 */

export interface ProductCardProps {
  product: ProductCardData;
  displayOptions?: ProductCardDisplayOptions | undefined;
}

export type ProductCardComponent = ComponentType<ProductCardProps>;

export const PRODUCT_CARD_TEMPLATES: Record<ProductCardTemplateId, ProductCardComponent> = {
  classic: ProductCardClassic,
  compact: ProductCardCompact,
  editorial: ProductCardEditorial,
  "premium-commerce": ProductCardPremiumCommerce,
};

/**
 * Resuelve el componente de card a renderizar a partir de un input opaco.
 * Nunca falla: si el templateId no matchea, devuelve el template default (`classic`).
 */
export function resolveProductCardTemplate(templateId: unknown): ProductCardComponent {
  return PRODUCT_CARD_TEMPLATES[resolveProductCardTemplateId(templateId)];
}
