import { cookies } from "next/headers";

import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type { StorefrontBootstrap, StorefrontFetchInput } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

export async function getBootstrap(input: StorefrontFetchInput): Promise<StorefrontBootstrap> {
  const context = resolveStorefrontRequestContext(input);

  const cookieStore = await cookies();
  const previewToken = cookieStore.get("__preview_token")?.value;

  const extraHeaders = new Headers();
  if (previewToken) {
    extraHeaders.set("x-preview-token", previewToken);
  }

  return requestStorefrontApi<StorefrontBootstrap>({
    path: STOREFRONT_API_PATHS.bootstrap,
    context,
    method: "GET",
    headers: extraHeaders,
    next: buildStorefrontGetNextOptions("bootstrap", context.host),
  });
}
