import { NextResponse } from "next/server";

import { enrichServerAnalyticsPayload } from "@/lib/analytics/server";
import { buildStorefrontHeaders } from "@/lib/api/headers";
import { STOREFRONT_INTERNAL_ERROR_CODES } from "@/lib/contracts/storefront-v1";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const runtime = await getStorefrontRuntimeSnapshot();

  if (!runtime.apiBaseUrl) {
    return NextResponse.json(
      {
        error: "No se pudo resolver la API base de la plataforma para analytics.",
        code: STOREFRONT_INTERNAL_ERROR_CODES.missingApiBaseUrl,
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Body JSON inválido para analytics.",
        code: STOREFRONT_INTERNAL_ERROR_CODES.invalidJson,
      },
      { status: 400 },
    );
  }

  const upstreamUrl = new URL("/api/storefront/v1/analytics/events", `${runtime.apiBaseUrl}/`);
  const headers = buildStorefrontHeaders({ context: runtime.context });
  headers.set("content-type", "application/json");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");
  const cookieHeader = request.headers.get("cookie");
  const enrichedBody =
    typeof body === "object" && body !== null
      ? enrichServerAnalyticsPayload({
          body: body as Parameters<typeof enrichServerAnalyticsPayload>[0]["body"],
          cookieHeader,
          userAgent,
          forwardedFor,
          realIp,
        })
      : body;

  if (forwardedFor) {
    headers.set("x-forwarded-for", forwardedFor);
  }

  if (realIp) {
    headers.set("x-real-ip", realIp);
  }

  if (userAgent) {
    headers.set("user-agent", userAgent);
  }

  try {
    const response = await fetch(upstreamUrl, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify(enrichedBody),
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
        error: "No se pudieron enviar los analytics del storefront.",
        code: STOREFRONT_INTERNAL_ERROR_CODES.network,
      },
      { status: 502 },
    );
  }
}
