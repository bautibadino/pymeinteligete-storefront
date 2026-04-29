import { headers } from "next/headers";

import { STOREFRONT_HEADERS } from "@/lib/contracts/storefront-v1";
import { normalizeStorefrontTenantSlug } from "@/lib/preview/storefront-preview";
import { resolveRequestHostFromHeaders } from "@/lib/tenancy/resolve-request-host";

import type { TenantSeoRequestContext } from "@/lib/seo/types";
import { isLocalhostHost } from "@/lib/seo/utils";

function getPrimaryHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const firstValue = value.split(",")[0]?.trim();

  return firstValue ? firstValue : null;
}

function resolveRequestHostWithPort(headerStore: Headers): string {
  const candidate =
    getPrimaryHeaderValue(headerStore.get("x-forwarded-host")) ??
    getPrimaryHeaderValue(headerStore.get("host"));

  if (!candidate) {
    throw new Error("No se pudo resolver el host de la request para SEO.");
  }

  return candidate;
}

function resolveProtocol(headerStore: Headers, resolvedHost: string): "http" | "https" {
  const forwardedProto = getPrimaryHeaderValue(headerStore.get("x-forwarded-proto"));

  if (forwardedProto === "http" || forwardedProto === "https") {
    return forwardedProto;
  }

  return isLocalhostHost(resolvedHost) ? "http" : "https";
}

export async function getTenantSeoRequestContext(): Promise<TenantSeoRequestContext> {
  const headerStore = await headers();
  const resolvedHost = resolveRequestHostFromHeaders(headerStore);
  const requestHost = resolveRequestHostWithPort(headerStore);
  const protocol = resolveProtocol(headerStore, resolvedHost);
  const tenantSlug = normalizeStorefrontTenantSlug(headerStore.get(STOREFRONT_HEADERS.tenantSlug));

  return {
    protocol,
    requestHost,
    resolvedHost,
    requestOrigin: new URL(`${protocol}://${requestHost}`),
    ...(tenantSlug ? { tenantSlug } : {}),
  };
}
