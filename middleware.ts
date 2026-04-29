import { NextResponse, type NextRequest } from "next/server";

import { STOREFRONT_HEADERS } from "@/lib/contracts/storefront-v1";
import {
  STOREFRONT_LEGACY_PREVIEW_HEADER,
  STOREFRONT_PREVIEW_COOKIE,
  STOREFRONT_PREVIEW_HEADER,
  STOREFRONT_PREVIEW_QUERY_PARAM,
  STOREFRONT_PREVIEW_TENANT_QUERY_PARAM,
  normalizeStorefrontPreviewToken,
  normalizeStorefrontTenantSlug,
} from "@/lib/preview/storefront-preview";

/**
 * Middleware de preview para el Site Builder.
 *
 * - Si `?preview=<token>` está en la URL, setea cookie efímera.
 * - Propaga el token como header de request para server components/fetchers.
 */
export function middleware(request: NextRequest) {
  const queryPreviewToken = normalizeStorefrontPreviewToken(
    request.nextUrl.searchParams.get(STOREFRONT_PREVIEW_QUERY_PARAM),
  );
  const queryTenantSlug = normalizeStorefrontTenantSlug(
    request.nextUrl.searchParams.get(STOREFRONT_PREVIEW_TENANT_QUERY_PARAM),
  );
  const cookiePreviewToken = normalizeStorefrontPreviewToken(
    request.cookies.get(STOREFRONT_PREVIEW_COOKIE)?.value,
  );
  const previewToken = queryPreviewToken ?? cookiePreviewToken;
  const requestHeaders = new Headers(request.headers);

  if (previewToken) {
    requestHeaders.set(STOREFRONT_PREVIEW_HEADER, previewToken);
    requestHeaders.set(STOREFRONT_LEGACY_PREVIEW_HEADER, previewToken);
  }

  if (queryTenantSlug) {
    requestHeaders.set(STOREFRONT_HEADERS.tenantSlug, queryTenantSlug);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (queryPreviewToken) {
    response.cookies.set({
      name: STOREFRONT_PREVIEW_COOKIE,
      value: queryPreviewToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 15,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
