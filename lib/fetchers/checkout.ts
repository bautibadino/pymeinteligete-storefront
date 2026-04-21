import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type {
  StorefrontCheckoutRequest,
  StorefrontCheckoutResult,
  StorefrontFetchInput,
  StorefrontProcessPaymentRequest,
  StorefrontProcessPaymentResult,
} from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

export async function postCheckout(
  input: StorefrontFetchInput,
  payload: StorefrontCheckoutRequest,
): Promise<StorefrontCheckoutResult> {
  const context = resolveStorefrontRequestContext(input);

  return requestStorefrontApi<StorefrontCheckoutResult, StorefrontCheckoutRequest>({
    path: STOREFRONT_API_PATHS.checkout,
    context,
    method: "POST",
    body: payload,
  });
}

export async function processPayment(
  input: StorefrontFetchInput,
  payload: StorefrontProcessPaymentRequest,
): Promise<StorefrontProcessPaymentResult> {
  const context = resolveStorefrontRequestContext(input);

  return requestStorefrontApi<
    StorefrontProcessPaymentResult,
    StorefrontProcessPaymentRequest
  >({
    path: STOREFRONT_API_PATHS.processPayment,
    context,
    method: "POST",
    body: payload,
  });
}
