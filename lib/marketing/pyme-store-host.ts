import { STOREFRONT_HEADERS } from "@/lib/contracts/storefront-v1";
import {
  normalizeStorefrontTenantSlug,
  readStorefrontTenantSlugFromCookieHeader,
} from "@/lib/preview/storefront-preview";

const PYME_STORE_MARKETING_DOMAIN = "pymeinteligente.store";
const PYME_STORE_MARKETING_WWW_DOMAIN = `www.${PYME_STORE_MARKETING_DOMAIN}`;
const PYME_STORE_MARKETING_VERCEL_HOST = "pymeinteligete-storefront.vercel.app";
const LOCAL_MARKETING_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function getPrimaryHostCandidate(candidate: string): string {
  return candidate.split(",")[0]?.trim() ?? "";
}

export function normalizePymeStoreHost(candidate: string | null | undefined): string | null {
  if (!candidate) {
    return null;
  }

  const primaryCandidate = getPrimaryHostCandidate(candidate);

  if (!primaryCandidate) {
    return null;
  }

  try {
    const withProtocol = primaryCandidate.includes("://")
      ? primaryCandidate
      : `http://${primaryCandidate}`;
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");

    return hostname || null;
  } catch {
    return null;
  }
}

export function isPymeStoreMarketingHost(candidate: string | null | undefined): boolean {
  const normalizedHost = normalizePymeStoreHost(candidate);

  return (
    normalizedHost === PYME_STORE_MARKETING_DOMAIN ||
    normalizedHost === PYME_STORE_MARKETING_WWW_DOMAIN ||
    normalizedHost === PYME_STORE_MARKETING_VERCEL_HOST ||
    (normalizedHost !== null && LOCAL_MARKETING_HOSTS.has(normalizedHost))
  );
}

/**
 * Preview/dev: si el middleware envió `tenantSlug` por query, hay header o cookie
 * explícitos y debe renderizarse el storefront multi-tenant aunque el host sea
 * localhost (que por defecto muestra la landing comercial de PyME Store).
 */
export function hasExplicitStorefrontTenantSlug(headers: Headers): boolean {
  const fromHeader = normalizeStorefrontTenantSlug(headers.get(STOREFRONT_HEADERS.tenantSlug));

  if (fromHeader) {
    return true;
  }

  return Boolean(readStorefrontTenantSlugFromCookieHeader(headers.get("cookie")));
}

export function shouldServePymeStoreMarketingLanding(host: string | null | undefined, headers: Headers): boolean {
  if (hasExplicitStorefrontTenantSlug(headers)) {
    return false;
  }

  return isPymeStoreMarketingHost(host);
}

/**
 * Loopback sin dominio de tienda: conviene repetir `tenantSlug` en la query de
 * links internos porque la cookie preview puede no viajar (nueva pestaña) o la
 * request no haber pasado nunca por `?tenantSlug=`.
 */
export function shouldAppendTenantSlugForLocalDevHost(host: string | null | undefined): boolean {
  const normalized = normalizePymeStoreHost(host);

  return normalized !== null && LOCAL_MARKETING_HOSTS.has(normalized);
}

export function appendTenantSlugForLocalDevHref(
  pathWithSearch: string,
  host: string | null | undefined,
  tenantSlug: string | null | undefined,
): string {
  if (!shouldAppendTenantSlugForLocalDevHost(host)) {
    return pathWithSearch;
  }

  const slug = tenantSlug?.trim().toLowerCase();

  if (!slug) {
    return pathWithSearch;
  }

  let parsed: URL;

  try {
    parsed = new URL(pathWithSearch, "http://local.invalid");
  } catch {
    return pathWithSearch;
  }

  if (parsed.searchParams.has("tenantSlug")) {
    return pathWithSearch;
  }

  parsed.searchParams.set("tenantSlug", slug);

  return `${parsed.pathname}${parsed.search}`;
}

export type LocalDevLinkHref =
  | string
  | { pathname: string; query?: Record<string, string | string[] | undefined> };

export function withLocalDevTenantSlugHref(
  host: string | null | undefined,
  tenantSlug: string | null | undefined,
  href: LocalDevLinkHref,
): LocalDevLinkHref {
  if (!shouldAppendTenantSlugForLocalDevHost(host)) {
    return href;
  }

  const slug = tenantSlug?.trim().toLowerCase();

  if (!slug) {
    return href;
  }

  if (typeof href === "string") {
    return appendTenantSlugForLocalDevHref(href, host, slug);
  }

  const mergedQuery = { ...(href.query ?? {}) };

  if (mergedQuery.tenantSlug !== undefined && mergedQuery.tenantSlug !== "") {
    return href;
  }

  return {
    pathname: href.pathname,
    query: {
      ...mergedQuery,
      tenantSlug: slug,
    },
  };
}

export function getPymeStoreCanonicalUrl(pathname = "/"): string {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new URL(normalizedPathname, `https://${PYME_STORE_MARKETING_WWW_DOMAIN}`).toString();
}

export function isPymeStoreHost(candidate: string | null | undefined): boolean {
  return isPymeStoreMarketingHost(candidate);
}
