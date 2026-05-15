import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type { StorefrontFetchInput, StorefrontProductDetail } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

const STOREFRONT_PRODUCT_CACHE_NAMESPACE = "product:pricing-v2";
const STOREFRONT_PRICING_CUTOVER_VERSION = "pricing-2026-05-15";

type ProductDetailResponse =
  | StorefrontProductDetail
  | {
      product?: StorefrontProductDetail;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapProductDetail(response: ProductDetailResponse): StorefrontProductDetail {
  if (isRecord(response) && isRecord(response.product)) {
    return response.product as unknown as StorefrontProductDetail;
  }

  return response as StorefrontProductDetail;
}

export async function getProduct(
  input: StorefrontFetchInput,
  slug: string,
): Promise<StorefrontProductDetail> {
  const context = resolveStorefrontRequestContext(input);

  const response = await requestStorefrontApi<ProductDetailResponse>({
    path: STOREFRONT_API_PATHS.product(slug),
    context,
    method: "GET",
    query: {
      _sv: STOREFRONT_PRICING_CUTOVER_VERSION,
    },
    next: buildStorefrontGetNextOptions(
      STOREFRONT_PRODUCT_CACHE_NAMESPACE,
      context.host,
      { slug, _sv: STOREFRONT_PRICING_CUTOVER_VERSION },
      context.tenantSlug,
    ),
  });

  return unwrapProductDetail(response);
}
