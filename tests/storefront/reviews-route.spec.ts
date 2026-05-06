import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/reviews/route";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

vi.mock("@/lib/runtime/storefront-request-context", () => ({
  getStorefrontRuntimeSnapshot: vi.fn(),
}));

const getStorefrontRuntimeSnapshotMock = vi.mocked(getStorefrontRuntimeSnapshot);

describe("reviews storefront route", () => {
  beforeEach(() => {
    getStorefrontRuntimeSnapshotMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("proxyea reviews al ERP preservando query params y tenantSlug", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
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
        requestId: "req_reviews_list_1",
        storefrontVersion: "storefront@test",
      },
    });

    await GET(
      new Request("https://storefront.test/api/reviews?tenantSlug=bym-demo&limit=12&minRating=4&hasComment=true"),
    );

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://erp.pyme.test/api/reviews?limit=12&minRating=4&hasComment=true",
    );

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = init?.headers as Headers;
    expect(headers.get("x-tenant-slug")).toBe("bym-demo");
    expect(headers.get("x-storefront-host")).toBe("localhost");
  });
});
