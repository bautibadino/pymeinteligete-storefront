import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type {
  StorefrontFetchInput,
  StorefrontPaymentMethod,
  StorefrontPaymentMethods,
} from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

type PaymentMethodsApiData =
  | StorefrontPaymentMethod[]
  | StorefrontPaymentMethods
  | { paymentMethods?: StorefrontPaymentMethod[] | null };

export async function getPaymentMethods(
  input: StorefrontFetchInput,
): Promise<StorefrontPaymentMethods> {
  const context = resolveStorefrontRequestContext(input);
  const data = await requestStorefrontApi<PaymentMethodsApiData>({
    path: STOREFRONT_API_PATHS.paymentMethods,
    context,
    method: "GET",
    next: buildStorefrontGetNextOptions(
      "payment-methods",
      context.host,
      undefined,
      context.tenantSlug,
    ),
  });

  if (Array.isArray(data)) {
    return { paymentMethods: data, items: data };
  }

  if (Array.isArray(data.paymentMethods)) {
    return { paymentMethods: data.paymentMethods, items: data.paymentMethods };
  }

  const paymentMethods =
    "items" in data && Array.isArray(data.items) ? data.items : [];

  return {
    ...data,
    paymentMethods,
    items: paymentMethods,
  };
}
