import { headers } from "next/headers";

import { STOREFRONT_TECHNICAL_NAME, STOREFRONT_VERSION } from "@/lib/config/storefront";
import { getServerEnvSnapshot } from "@/lib/env/server-env";
import {
  STOREFRONT_LEGACY_PREVIEW_HEADER,
  STOREFRONT_PREVIEW_HEADER,
  normalizeStorefrontPreviewToken,
  readStorefrontPreviewTokenFromCookieHeader,
} from "@/lib/preview/storefront-preview";
import { createRequestId } from "@/lib/runtime/request-id";
import { resolveRequestHostFromHeaders } from "@/lib/tenancy/resolve-request-host";

export type StorefrontRequestContext = {
  host: string;
  requestId: string;
  storefrontVersion: string;
  tenantSlug?: string;
  previewToken?: string;
};

export type StorefrontRuntimeSnapshot = {
  apiBaseUrl: string | null;
  context: StorefrontRequestContext;
  hasApiBaseUrl: boolean;
};

export async function getStorefrontRuntimeSnapshot(): Promise<StorefrontRuntimeSnapshot> {
  const headerStore = await headers();
  const env = getServerEnvSnapshot();
  const previewToken =
    normalizeStorefrontPreviewToken(headerStore.get(STOREFRONT_PREVIEW_HEADER)) ??
    normalizeStorefrontPreviewToken(headerStore.get(STOREFRONT_LEGACY_PREVIEW_HEADER)) ??
    readStorefrontPreviewTokenFromCookieHeader(headerStore.get("cookie"));

  const context: StorefrontRequestContext = {
    host: resolveRequestHostFromHeaders(headerStore),
    requestId: createRequestId(),
    storefrontVersion:
      env.storefrontVersionOverride ??
      `${STOREFRONT_TECHNICAL_NAME}@${STOREFRONT_VERSION}`,
    ...(previewToken ? { previewToken } : {}),
  };

  return {
    apiBaseUrl: env.pymeApiBaseUrl,
    context,
    hasApiBaseUrl: env.pymeApiBaseUrl !== null,
  };
}
