import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type { StorefrontCategory, StorefrontFetchInput } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

export async function getCategories(input: StorefrontFetchInput): Promise<StorefrontCategory[]> {
  const context = resolveStorefrontRequestContext(input);

  return requestStorefrontApi<StorefrontCategory[]>({
    path: STOREFRONT_API_PATHS.categories,
    context,
    method: "GET",
    next: buildStorefrontGetNextOptions("categories", context.host),
  });
}
