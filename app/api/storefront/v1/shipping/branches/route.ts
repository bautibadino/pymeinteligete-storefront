import { NextResponse } from "next/server";

import { buildStorefrontHeaders } from "@/lib/api/headers";
import { STOREFRONT_API_PATHS, STOREFRONT_INTERNAL_ERROR_CODES } from "@/lib/contracts/storefront-v1";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const runtime = await getStorefrontRuntimeSnapshot();

  if (!runtime.apiBaseUrl) {
    return NextResponse.json(
      {
        error: "No se pudo resolver la API base de la plataforma para buscar sucursales.",
        code: STOREFRONT_INTERNAL_ERROR_CODES.missingApiBaseUrl,
      },
      { status: 500 },
    );
  }

  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(STOREFRONT_API_PATHS.shippingBranches, `${runtime.apiBaseUrl}/`);
  requestUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

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
        "cache-control": "no-store",
        "content-type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "No se pudieron obtener sucursales para este storefront.",
        code: STOREFRONT_INTERNAL_ERROR_CODES.network,
      },
      { status: 502 },
    );
  }
}
