import { NextResponse } from "next/server";

import { buildStorefrontHeaders } from "@/lib/api/headers";
import { STOREFRONT_INTERNAL_ERROR_CODES } from "@/lib/contracts/storefront-v1";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const runtime = await getStorefrontRuntimeSnapshot();

  if (!runtime.apiBaseUrl) {
    return NextResponse.json(
      {
        error: "No se pudo resolver la API base de la plataforma para reviews.",
        code: STOREFRONT_INTERNAL_ERROR_CODES.missingApiBaseUrl,
      },
      { status: 500 },
    );
  }

  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL("/api/reviews/summary", `${runtime.apiBaseUrl}/`);
  const empresaId = requestUrl.searchParams.get("empresaId");
  const tenantSlug = requestUrl.searchParams.get("tenantSlug");
  const headers = buildStorefrontHeaders({
    context: tenantSlug
      ? { ...runtime.context, tenantSlug }
      : runtime.context,
  });

  if (empresaId) {
    upstreamUrl.searchParams.set("empresaId", empresaId);
  }

  try {
    const response = await fetch(upstreamUrl, {
      cache: "no-store",
      headers,
    });
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "cache-control": "no-store",
        "content-type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "No se pudieron obtener las reseñas para este carrusel.",
        code: STOREFRONT_INTERNAL_ERROR_CODES.network,
      },
      { status: 502 },
    );
  }
}
