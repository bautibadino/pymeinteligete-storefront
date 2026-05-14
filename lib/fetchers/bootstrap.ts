import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import {
  STOREFRONT_LEGACY_PREVIEW_HEADER,
  STOREFRONT_PREVIEW_HEADER,
  buildStorefrontPreviewCookieHeader,
} from "@/lib/preview/storefront-preview";
import type { StorefrontNextOptions } from "@/lib/api/client";
import type { StorefrontBootstrap, StorefrontFetchInput } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions, readCachedStorefrontGet } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";
import type { StorefrontRequestContext } from "@/lib/runtime/storefront-request-context";

type BootstrapFetchCacheOptions = {
  cache?: RequestCache;
  next?: StorefrontNextOptions;
};

export function buildBootstrapFetchCacheOptions(
  context: StorefrontRequestContext,
): BootstrapFetchCacheOptions {
  if (context.previewToken) {
    return { cache: "no-store" };
  }

  return { next: buildStorefrontGetNextOptions("bootstrap", context.host, undefined, context.tenantSlug) };
}

function buildBootstrapPreviewHeaders(context: StorefrontRequestContext): HeadersInit | undefined {
  if (!context.previewToken) {
    return undefined;
  }

  return {
    [STOREFRONT_PREVIEW_HEADER]: context.previewToken,
    [STOREFRONT_LEGACY_PREVIEW_HEADER]: context.previewToken,
    cookie: buildStorefrontPreviewCookieHeader(context.previewToken),
  };
}

export async function getBootstrap(input: StorefrontFetchInput): Promise<StorefrontBootstrap> {
  const context = resolveStorefrontRequestContext(input);
  const previewHeaders = buildBootstrapPreviewHeaders(context);

  const fetchBootstrap = () => requestStorefrontApi<StorefrontBootstrap>({
      path: STOREFRONT_API_PATHS.bootstrap,
      context,
      method: "GET",
      ...(previewHeaders ? { headers: previewHeaders } : {}),
      ...buildBootstrapFetchCacheOptions(context),
    });

  if (context.previewToken) {
    return fetchBootstrap();
  }

  return readCachedStorefrontGet("bootstrap", context.host, undefined, context.tenantSlug, fetchBootstrap);
}
