import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type {
  StorefrontFetchInput,
  StorefrontManualPaymentRequest,
  StorefrontManualPaymentResult,
  StorefrontOrderByTokenResult,
} from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

export async function getOrderByToken(
  input: StorefrontFetchInput,
  token: string,
): Promise<StorefrontOrderByTokenResult> {
  const context = resolveStorefrontRequestContext(input);

  return requestStorefrontApi<StorefrontOrderByTokenResult>({
    path: STOREFRONT_API_PATHS.orderByToken(token),
    context,
    method: "GET",
    next: buildStorefrontGetNextOptions("order-by-token", context.host, { token }, context.tenantSlug),
  });
}

export async function postManualPayment(
  input: StorefrontFetchInput,
  token: string,
  payload: StorefrontManualPaymentRequest,
): Promise<StorefrontManualPaymentResult> {
  const context = resolveStorefrontRequestContext(input);

  return requestStorefrontApi<StorefrontManualPaymentResult, StorefrontManualPaymentRequest>({
    path: STOREFRONT_API_PATHS.manualPayment(token),
    context,
    method: "POST",
    body: payload,
  });
}
