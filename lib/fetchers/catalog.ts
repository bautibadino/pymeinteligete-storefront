import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type { StorefrontCatalog, StorefrontCatalogQuery, StorefrontFetchInput } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

export async function getCatalog(
  input: StorefrontFetchInput,
  query?: StorefrontCatalogQuery,
): Promise<StorefrontCatalog> {
  const context = resolveStorefrontRequestContext(input);
  const requestOptions = {
    path: STOREFRONT_API_PATHS.catalog,
    context,
    method: "GET" as const,
    next: buildStorefrontGetNextOptions("catalog", context.host, query),
    ...(query ? { query } : {}),
  };

  return requestStorefrontApi<StorefrontCatalog>(requestOptions);
}
