import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type { StorefrontBootstrap, StorefrontFetchInput } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

export async function getBootstrap(input: StorefrontFetchInput): Promise<StorefrontBootstrap> {
  const context = resolveStorefrontRequestContext(input);

  return requestStorefrontApi<StorefrontBootstrap>({
    path: STOREFRONT_API_PATHS.bootstrap,
    context,
    method: "GET",
    next: buildStorefrontGetNextOptions("bootstrap", context.host),
  });
}
