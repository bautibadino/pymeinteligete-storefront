import { NextResponse } from "next/server";

import { buildStorefrontHeaders } from "@/lib/api/headers";
import { STOREFRONT_API_PATHS, STOREFRONT_INTERNAL_ERROR_CODES } from "@/lib/contracts/storefront-v1";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const runtime = await getStorefrontRuntimeSnapshot();

  if (!runtime.apiBaseUrl) {
    return NextResponse.json(
      {
        error: "No se pudo resolver la API base de la plataforma para generar el feed.",
        code: STOREFRONT_INTERNAL_ERROR_CODES.missingApiBaseUrl,
      },
      { status: 500 },
    );
  }

  const upstreamUrl = new URL(STOREFRONT_API_PATHS.facebookCatalog, `${runtime.apiBaseUrl}/`);
  const headers = buildStorefrontHeaders({ context: runtime.context });

  try {
    const response = await fetch(upstreamUrl, {
      method: "GET",
      cache: "no-store",
      headers,
    });
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "cache-control": response.headers.get("cache-control") ?? "s-maxage=3600, stale-while-revalidate",
        "content-type": response.headers.get("content-type") ?? "application/xml; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "No se pudo generar el feed de catálogo para este storefront.",
        code: STOREFRONT_INTERNAL_ERROR_CODES.network,
      },
      { status: 502 },
    );
  }
}
