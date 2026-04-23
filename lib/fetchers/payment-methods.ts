import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type {
  StorefrontFetchInput,
  StorefrontPaymentMethods,
} from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

export async function getPaymentMethods(
  input: StorefrontFetchInput,
): Promise<StorefrontPaymentMethods> {
  const context = resolveStorefrontRequestContext(input);

  return requestStorefrontApi<StorefrontPaymentMethods>({
    path: STOREFRONT_API_PATHS.paymentMethods,
    context,
    method: "GET",
    next: buildStorefrontGetNextOptions("payment-methods", context.host),
  });
}
