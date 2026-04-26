export const STOREFRONT_PREVIEW_QUERY_PARAM = "preview";
export const STOREFRONT_PREVIEW_COOKIE = "__preview_token";
export const STOREFRONT_PREVIEW_HEADER = "x-preview-token";
export const STOREFRONT_LEGACY_PREVIEW_HEADER = "x-storefront-preview-token";

const MAX_PREVIEW_TOKEN_LENGTH = 2048;

export function normalizeStorefrontPreviewToken(value: string | null | undefined): string | null {
  const token = value?.trim();

  if (!token || token.length > MAX_PREVIEW_TOKEN_LENGTH || /[\r\n]/.test(token)) {
    return null;
  }

  return token;
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

export function buildStorefrontPreviewCookieHeader(token: string): string {
  return `${STOREFRONT_PREVIEW_COOKIE}=${encodeURIComponent(token)}`;
}
