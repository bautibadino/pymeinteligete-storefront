import type { PresentationRenderContext } from "@/components/presentation/render-context";
import type { StorefrontCatalogProduct } from "@/lib/storefront-api";

type ProductExperienceLike = {
  bootstrap: PresentationRenderContext["bootstrap"];
  product: PresentationRenderContext["product"];
  relatedProducts?: StorefrontCatalogProduct[];
  runtime: {
    context: {
      host: string;
    };
  };
};

export function buildProductPresentationContext(
  experience: ProductExperienceLike,
): PresentationRenderContext {
  return {
    host: experience.runtime.context.host,
    ...(experience.bootstrap !== undefined ? { bootstrap: experience.bootstrap } : {}),
    ...(experience.product ? { product: experience.product } : {}),
    ...(experience.relatedProducts && experience.relatedProducts.length > 0
      ? { products: experience.relatedProducts }
      : {}),
  };
}
