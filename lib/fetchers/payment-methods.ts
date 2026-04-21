import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type {
  StorefrontFetchInput,
  StorefrontPaymentMethod,
  StorefrontPaymentMethods,
} from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

type PaymentMethodsApiData = StorefrontPaymentMethod[] | StorefrontPaymentMethods;

export async function getPaymentMethods(
  input: StorefrontFetchInput,
): Promise<StorefrontPaymentMethods> {
  const context = resolveStorefrontRequestContext(input);
  const data = await requestStorefrontApi<PaymentMethodsApiData>({
    path: STOREFRONT_API_PATHS.paymentMethods,
    context,
    method: "GET",
    next: buildStorefrontGetNextOptions("payment-methods", context.host),
  });

  if (Array.isArray(data)) {
    return { items: data };
  }

  return data;
}
