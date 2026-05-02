import {
  extractRelatedCatalogProductsFromDetail,
  type PresentationRenderContext,
} from "@/components/presentation/render-context";
import type {
  StorefrontCatalogProduct,
  StorefrontPaymentMethods,
} from "@/lib/storefront-api";
import type {
  ProductDetailRuntimeContent,
} from "@/lib/modules/product-detail";
import type { Presentation, SectionInstance } from "@/lib/types/presentation";

type ProductExperienceLike = {
  bootstrap: PresentationRenderContext["bootstrap"];
  product: PresentationRenderContext["product"];
  relatedProducts?: StorefrontCatalogProduct[];
  paymentMethods?: StorefrontPaymentMethods | null;
  runtime: {
    context: {
      host: string;
    };
  };
};

function buildProductDetailRuntimeContent(
  experience: ProductExperienceLike,
): ProductDetailRuntimeContent {
  return {
    ...(experience.paymentMethods?.paymentMethods?.length
      ? { paymentMethods: experience.paymentMethods.paymentMethods }
      : {}),
    ...(experience.bootstrap?.commerce.shipping?.message
      ? { shippingMessage: experience.bootstrap.commerce.shipping.message }
      : {}),
    ...(typeof experience.bootstrap?.features.reviewsEnabled === "boolean"
      ? { reviewsEnabled: experience.bootstrap.features.reviewsEnabled }
      : {}),
  };
}

function hydrateProductDetailSection(
  section: SectionInstance,
  runtimeContent: ProductDetailRuntimeContent,
): SectionInstance {
  if (section.type !== "productDetail") {
    return section;
  }

  return {
    ...section,
    content: {
      ...(typeof section.content === "object" && section.content !== null ? section.content : {}),
      ...runtimeContent,
    },
  };
}

export function hydrateProductPresentationWithRuntimeSignals(
  presentation: Presentation | null | undefined,
  experience: ProductExperienceLike,
): Presentation | null | undefined {
  if (!presentation) {
    return presentation;
  }

  const runtimeContent = buildProductDetailRuntimeContent(experience);
  if (Object.keys(runtimeContent).length === 0) {
    return presentation;
  }

  const productSections = presentation.pages.product.sections;
  if (productSections.length === 0) {
    return presentation;
  }

  return {
    ...presentation,
    pages: {
      ...presentation.pages,
      product: {
        ...presentation.pages.product,
        sections: productSections.map((section) =>
          hydrateProductDetailSection(section, runtimeContent),
        ),
      },
    },
  };
}

export function buildProductPresentationContext(
  experience: ProductExperienceLike,
): PresentationRenderContext {
  const relatedFromDetail = extractRelatedCatalogProductsFromDetail(experience.product);
  const mergedProducts = [...(experience.relatedProducts ?? []), ...relatedFromDetail].filter((product, index, collection) => {
    const stableId = `${product.productId}:${product.slug}`;
    return collection.findIndex((candidate) => `${candidate.productId}:${candidate.slug}` === stableId) === index;
  });

  return {
    host: experience.runtime.context.host,
    ...(experience.bootstrap !== undefined ? { bootstrap: experience.bootstrap } : {}),
    ...(experience.product ? { product: experience.product } : {}),
    ...(experience.paymentMethods?.paymentMethods?.length
      ? { paymentMethods: experience.paymentMethods.paymentMethods }
      : {}),
    ...(mergedProducts.length > 0
      ? { products: mergedProducts }
      : {}),
  };
}
