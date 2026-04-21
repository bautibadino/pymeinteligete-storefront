import { STOREFRONT_TECHNICAL_NAME, STOREFRONT_VERSION } from "@/lib/config/storefront";
import { createRequestId } from "@/lib/runtime/request-id";
import type { StorefrontRequestContext } from "@/lib/runtime/storefront-request-context";
import type { StorefrontFetchInput } from "@/lib/types/storefront";

export function resolveStorefrontRequestContext(
  input: StorefrontFetchInput,
): StorefrontRequestContext {
  if (typeof input !== "string") {
    return input;
  }

  return {
    host: input,
    requestId: createRequestId(),
    storefrontVersion: `${STOREFRONT_TECHNICAL_NAME}@${STOREFRONT_VERSION}`,
  };
}
