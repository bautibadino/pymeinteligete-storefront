import type { StorefrontBootstrap } from "@/lib/storefront-api";

import type { TenantSeoRequestContext } from "@/lib/seo/types";
import { getStringValue, pickFirstString } from "@/lib/seo/utils";

function normalizeBaseUrl(candidate: string, protocol: "http" | "https"): URL | null {
  const trimmed = candidate.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed.includes("://") ? trimmed : `${protocol}://${trimmed}`);
  } catch {
    return null;
  }
}

export function resolveCanonicalBaseUrl(
  bootstrap: StorefrontBootstrap | null,
  requestContext: TenantSeoRequestContext,
): URL {
  const tenant = bootstrap?.tenant;
  const seo = bootstrap?.seo;

  const candidate = pickFirstString(
    getStringValue(seo, "canonicalUrl"),
    getStringValue(tenant, "canonicalUrl"),
    getStringValue(seo, "canonicalDomain"),
    getStringValue(tenant, "canonicalDomain"),
    getStringValue(tenant, "canonicalHost"),
    getStringValue(seo, "canonicalHost"),
    getStringValue(tenant, "host"),
    requestContext.requestOrigin.toString(),
  );

  const resolved = candidate ? normalizeBaseUrl(candidate, requestContext.protocol) : null;

  return resolved ?? requestContext.requestOrigin;
}

export function buildCanonicalUrl(baseUrl: URL, pathname = "/"): string {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new URL(normalizedPathname, baseUrl).toString();
}
