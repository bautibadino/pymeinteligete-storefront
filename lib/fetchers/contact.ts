import { requestStorefrontApi } from "@/lib/api/client";
import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type { StorefrontRequestContext } from "@/lib/runtime/storefront-request-context";
import type {
  StorefrontContactFormSubmissionRequest,
  StorefrontContactFormSubmissionResult,
} from "@/lib/types/storefront";

export async function postContactForm(
  context: StorefrontRequestContext,
  request: StorefrontContactFormSubmissionRequest,
): Promise<StorefrontContactFormSubmissionResult> {
  return requestStorefrontApi<
    StorefrontContactFormSubmissionResult,
    StorefrontContactFormSubmissionRequest
  >({
    path: STOREFRONT_API_PATHS.contact,
    context,
    method: "POST",
    body: request,
    cache: "no-store",
  });
}
