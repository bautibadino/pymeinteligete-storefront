import { headers } from "next/headers";

import { STOREFRONT_TECHNICAL_NAME, STOREFRONT_VERSION } from "@/lib/config/storefront";
import { getServerEnvSnapshot } from "@/lib/env/server-env";
import { createRequestId } from "@/lib/runtime/request-id";
import { resolveRequestHostFromHeaders } from "@/lib/tenancy/resolve-request-host";

export type StorefrontRequestContext = {
  host: string;
  requestId: string;
  storefrontVersion: string;
  tenantSlug?: string;
};

export type StorefrontRuntimeSnapshot = {
  apiBaseUrl: string | null;
  context: StorefrontRequestContext;
  hasApiBaseUrl: boolean;
};

export async function getStorefrontRuntimeSnapshot(): Promise<StorefrontRuntimeSnapshot> {
  const headerStore = await headers();
  const env = getServerEnvSnapshot();

  const context: StorefrontRequestContext = {
    host: resolveRequestHostFromHeaders(headerStore),
    requestId: createRequestId(),
    storefrontVersion:
      env.storefrontVersionOverride ??
      `${STOREFRONT_TECHNICAL_NAME}@${STOREFRONT_VERSION}`,
  };

  return {
    apiBaseUrl: env.pymeApiBaseUrl,
    context,
    hasApiBaseUrl: env.pymeApiBaseUrl !== null,
  };
}
