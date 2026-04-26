import { NextResponse, type NextRequest } from "next/server";

import {
  STOREFRONT_LEGACY_PREVIEW_HEADER,
  STOREFRONT_PREVIEW_COOKIE,
  STOREFRONT_PREVIEW_HEADER,
  STOREFRONT_PREVIEW_QUERY_PARAM,
  normalizeStorefrontPreviewToken,
} from "@/lib/preview/storefront-preview";

export function middleware(request: NextRequest) {
  const queryPreviewToken = normalizeStorefrontPreviewToken(
    request.nextUrl.searchParams.get(STOREFRONT_PREVIEW_QUERY_PARAM),
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
