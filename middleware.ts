import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware de preview para el Site Builder.
 *
 * - Si ?preview=<token> está en la URL: setea cookie efímera __preview_token.
 * - Si la cookie existe: propaga el token como header x-preview-token para
 *   que los server components y fetchers lo consuman.
 */
export function middleware(request: NextRequest) {
  const previewToken = request.nextUrl.searchParams.get("preview");
  const response = NextResponse.next();

  if (previewToken) {
    response.cookies.set("__preview_token", previewToken, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    response.headers.set("x-preview-token", previewToken);
  } else {
    const existingToken = request.cookies.get("__preview_token")?.value;
    if (existingToken) {
      response.headers.set("x-preview-token", existingToken);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
