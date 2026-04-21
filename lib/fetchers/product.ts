import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type { StorefrontFetchInput, StorefrontProductDetail } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

export async function getProduct(
  input: StorefrontFetchInput,
  slug: string,
): Promise<StorefrontProductDetail> {
  const context = resolveStorefrontRequestContext(input);

  return requestStorefrontApi<StorefrontProductDetail>({
    path: STOREFRONT_API_PATHS.product(slug),
    context,
    method: "GET",
    next: buildStorefrontGetNextOptions("product", context.host, { slug }),
  });
}
