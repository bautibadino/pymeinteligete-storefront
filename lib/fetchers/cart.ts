import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type {
  StorefrontCartValidateRequest,
  StorefrontCartValidateResult,
  StorefrontFetchInput,
} from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

export async function postCartValidate(
  input: StorefrontFetchInput,
  payload: StorefrontCartValidateRequest,
): Promise<StorefrontCartValidateResult> {
  const context = resolveStorefrontRequestContext(input);

  return requestStorefrontApi<
    StorefrontCartValidateResult,
    StorefrontCartValidateRequest
  >({
    path: STOREFRONT_API_PATHS.cartValidate,
    context,
    method: "POST",
    body: payload,
  });
}
