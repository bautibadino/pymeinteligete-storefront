export const STOREFRONT_PREVIEW_QUERY_PARAM = "preview";
export const STOREFRONT_PREVIEW_TENANT_QUERY_PARAM = "tenantSlug";
export const STOREFRONT_PREVIEW_COOKIE = "__preview_token";
export const STOREFRONT_PREVIEW_TENANT_COOKIE = "__preview_tenant_slug";
export const STOREFRONT_PREVIEW_HEADER = "x-preview-token";
export const STOREFRONT_LEGACY_PREVIEW_HEADER = "x-storefront-preview-token";

const MAX_PREVIEW_TOKEN_LENGTH = 2048;
const MAX_TENANT_SLUG_LENGTH = 128;

export function normalizeStorefrontPreviewToken(value: string | null | undefined): string | null {
  const token = value?.trim();

  if (!token || token.length > MAX_PREVIEW_TOKEN_LENGTH || /[\r\n]/.test(token)) {
    return null;
  }

  return token;
}

export function normalizeStorefrontTenantSlug(value: string | null | undefined): string | null {
  const tenantSlug = value?.trim().toLowerCase();

  if (
    !tenantSlug ||
    tenantSlug.length > MAX_TENANT_SLUG_LENGTH ||
    /[\r\n]/.test(tenantSlug) ||
    !/^[a-z0-9][a-z0-9-]*$/.test(tenantSlug)
  ) {
    return null;
  }

  return tenantSlug;
}

export function readStorefrontPreviewTokenFromCookieHeader(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = part.trim().split("=");

    if (rawName !== STOREFRONT_PREVIEW_COOKIE) {
      continue;
    }

    const rawValue = rawValueParts.join("=");

    try {
      return normalizeStorefrontPreviewToken(decodeURIComponent(rawValue));
    } catch {
      return normalizeStorefrontPreviewToken(rawValue);
    }
  }

  return null;
}

export function readStorefrontTenantSlugFromCookieHeader(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = part.trim().split("=");

    if (rawName !== STOREFRONT_PREVIEW_TENANT_COOKIE) {
      continue;
    }

    const rawValue = rawValueParts.join("=");

    try {
      return normalizeStorefrontTenantSlug(decodeURIComponent(rawValue));
    } catch {
      return normalizeStorefrontTenantSlug(rawValue);
    }
  }

  return null;
}

export function buildStorefrontPreviewCookieHeader(token: string): string {
  return `${STOREFRONT_PREVIEW_COOKIE}=${encodeURIComponent(token)}`;
}

export function buildStorefrontPreviewTenantCookieHeader(tenantSlug: string): string {
  return `${STOREFRONT_PREVIEW_TENANT_COOKIE}=${encodeURIComponent(tenantSlug)}`;
}
