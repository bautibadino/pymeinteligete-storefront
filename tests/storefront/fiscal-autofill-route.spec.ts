import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/fiscal/autofill/route";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

vi.mock("@/lib/runtime/storefront-request-context", () => ({
  getStorefrontRuntimeSnapshot: vi.fn(),
}));

const getStorefrontRuntimeSnapshotMock = vi.mocked(getStorefrontRuntimeSnapshot);

describe("fiscal autofill storefront route", () => {
  beforeEach(() => {
    getStorefrontRuntimeSnapshotMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("proxyea la consulta fiscal al ERP preservando query params y contexto de storefront", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ customer: { name: "Juan Perez" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);
    getStorefrontRuntimeSnapshotMock.mockResolvedValue({
      apiBaseUrl: "https://erp.pyme.test",
      hasApiBaseUrl: true,
      context: {
        host: "bym.localhost",
        requestId: "req_fiscal_autofill_1",
        storefrontVersion: "storefront@test",
        tenantSlug: "bym",
      },
    });

    await GET(new Request("https://storefront.test/api/fiscal/autofill?id=20123456789&source=checkout"));

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://erp.pyme.test/api/storefront/v1/fiscal/autofill?id=20123456789&source=checkout",
    );

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = init?.headers as Headers;
    expect(headers.get("x-storefront-host")).toBe("bym.localhost");
    expect(headers.get("x-tenant-slug")).toBe("bym");
  });
});
