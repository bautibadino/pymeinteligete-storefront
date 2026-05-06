import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/reviews/summary/route";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

vi.mock("@/lib/runtime/storefront-request-context", () => ({
  getStorefrontRuntimeSnapshot: vi.fn(),
}));

const getStorefrontRuntimeSnapshotMock = vi.mocked(getStorefrontRuntimeSnapshot);

describe("reviews summary storefront route", () => {
  beforeEach(() => {
    getStorefrontRuntimeSnapshotMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("proxyea la request al ERP con headers de storefront y preserva el body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ averageRating: 4.8, totalReviews: 127 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);
    getStorefrontRuntimeSnapshotMock.mockResolvedValue({
      apiBaseUrl: "https://erp.pyme.test",
      hasApiBaseUrl: true,
      context: {
        host: "bym.pyme.test",
        requestId: "req_reviews_1",
        storefrontVersion: "storefront@test",
        tenantSlug: "bym",
      },
    });

    const response = await GET(
      new Request("https://storefront.test/api/reviews/summary?empresaId=empresa-123"),
    );

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://erp.pyme.test/api/reviews/summary?empresaId=empresa-123",
    );

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.cache).toBe("no-store");

    const headers = init?.headers as Headers;
    expect(headers.get("x-storefront-host")).toBe("bym.pyme.test");
    expect(headers.get("x-storefront-version")).toBe("storefront@test");
    expect(headers.get("x-request-id")).toBe("req_reviews_1");
    expect(headers.get("x-tenant-slug")).toBe("bym");

    await expect(response.json()).resolves.toEqual({ averageRating: 4.8, totalReviews: 127 });
  });

  it("prioriza tenantSlug explícito cuando llega desde el carrusel", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ averageRating: 4.8, totalReviews: 127 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);
    getStorefrontRuntimeSnapshotMock.mockResolvedValue({
      apiBaseUrl: "https://erp.pyme.test",
      hasApiBaseUrl: true,
      context: {
        host: "localhost",
        requestId: "req_reviews_3",
        storefrontVersion: "storefront@test",
      },
    });

    await GET(
      new Request("https://storefront.test/api/reviews/summary?tenantSlug=bym-demo"),
    );

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = init?.headers as Headers;
    expect(headers.get("x-tenant-slug")).toBe("bym-demo");
  });

  it("responde 500 si falta PYME_API_BASE_URL", async () => {
    getStorefrontRuntimeSnapshotMock.mockResolvedValue({
      apiBaseUrl: null,
      hasApiBaseUrl: false,
      context: {
        host: "bym.pyme.test",
        requestId: "req_reviews_2",
        storefrontVersion: "storefront@test",
      },
    });

    const response = await GET(new Request("https://storefront.test/api/reviews/summary"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "No se pudo resolver la API base de la plataforma para reviews.",
      code: "MISSING_API_BASE_URL",
    });
  });
});
