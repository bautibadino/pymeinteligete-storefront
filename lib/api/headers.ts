import { STOREFRONT_HEADERS } from "@/lib/contracts/storefront-v1";
import { getServerEnvSnapshot } from "@/lib/env/server-env";
import type { StorefrontRequestContext } from "@/lib/runtime/storefront-request-context";

type StorefrontHeaderOptions = {
  context: StorefrontRequestContext;
  idempotencyKey?: string;
  headers?: HeadersInit;
};

export function buildStorefrontHeaders({
  context,
  idempotencyKey,
  headers,
}: StorefrontHeaderOptions): Headers {
  const resolvedHeaders = new Headers(headers);
  const env = getServerEnvSnapshot();

  resolvedHeaders.set("accept", "application/json");
  resolvedHeaders.set(STOREFRONT_HEADERS.host, context.host);
  resolvedHeaders.set(STOREFRONT_HEADERS.version, context.storefrontVersion);
  resolvedHeaders.set(STOREFRONT_HEADERS.requestId, context.requestId);

  if (context.tenantSlug) {
    resolvedHeaders.set(STOREFRONT_HEADERS.tenantSlug, context.tenantSlug);
  }

  if (idempotencyKey) {
    resolvedHeaders.set(STOREFRONT_HEADERS.idempotencyKey, idempotencyKey);
  }

  if (env.storefrontCatalogSecret) {
    resolvedHeaders.set(STOREFRONT_HEADERS.secret, env.storefrontCatalogSecret);
  }

  return resolvedHeaders;
}
