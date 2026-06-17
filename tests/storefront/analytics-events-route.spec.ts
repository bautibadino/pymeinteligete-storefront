import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/storefront/v1/analytics/events/route";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

vi.mock("@/lib/runtime/storefront-request-context", () => ({
  getStorefrontRuntimeSnapshot: vi.fn(),
}));

const getStorefrontRuntimeSnapshotMock = vi.mocked(getStorefrontRuntimeSnapshot);

describe("storefront analytics events proxy route", () => {
  beforeEach(() => {
    getStorefrontRuntimeSnapshotMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("proxyea el evento al ERP con headers multi-tenant", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { accepted: true, delivered: true } }), {
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
        requestId: "req_analytics_1",
        storefrontVersion: "storefront@test",
        tenantSlug: "bym",
      },
    });

    const body = {
      eventName: "InitiateCheckout",
      eventId: "evt_1",
      path: "/checkout",
      value: 120000,
      currency: "ARS",
    };

    const response = await POST(
      new Request("https://storefront.test/api/storefront/v1/analytics/events", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: "_fbp=fb.1.123; sf_fbc=fb.1.saved; _ga=GA1.1.987654321.123456789",
          "user-agent": "Mozilla/5.0 Test Browser",
          "x-forwarded-for": "203.0.113.10, 10.0.0.1",
          "x-real-ip": "203.0.113.11",
        },
        body: JSON.stringify(body),
      }),
    );

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://erp.pyme.test/api/storefront/v1/analytics/events",
    );

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(init?.cache).toBe("no-store");
    expect(init?.body).toBe(
      JSON.stringify({
        ...body,
        user: {
          fbp: "fb.1.123",
          fbc: "fb.1.saved",
          clientId: "987654321.123456789",
          clientUserAgent: "Mozilla/5.0 Test Browser",
          clientIpAddress: "203.0.113.10",
        },
      }),
    );

    const headers = init?.headers as Headers;
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-storefront-host")).toBe("bym.pyme.test");
    expect(headers.get("x-storefront-version")).toBe("storefront@test");
    expect(headers.get("x-request-id")).toBe("req_analytics_1");
    expect(headers.get("x-tenant-slug")).toBe("bym");
    expect(headers.get("user-agent")).toBe("Mozilla/5.0 Test Browser");
    expect(headers.get("x-forwarded-for")).toBe("203.0.113.10, 10.0.0.1");
    expect(headers.get("x-real-ip")).toBe("203.0.113.11");

    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { accepted: true, delivered: true },
    });
  });

  it("responde 500 si falta la API base", async () => {
    getStorefrontRuntimeSnapshotMock.mockResolvedValue({
      apiBaseUrl: null,
      hasApiBaseUrl: false,
      context: {
        host: "bym.pyme.test",
        requestId: "req_analytics_2",
        storefrontVersion: "storefront@test",
      },
    });

    const response = await POST(
      new Request("https://storefront.test/api/storefront/v1/analytics/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventName: "Purchase", path: "/checkout/confirmacion" }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "No se pudo resolver la API base de la plataforma para analytics.",
      code: "MISSING_API_BASE_URL",
    });
  });

  it("filtra PageView de bots antes de reenviar al ERP", async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);
    getStorefrontRuntimeSnapshotMock.mockResolvedValue({
      apiBaseUrl: "https://erp.pyme.test",
      hasApiBaseUrl: true,
      context: {
        host: "bym.pyme.test",
        requestId: "req_analytics_3",
        storefrontVersion: "storefront@test",
      },
    });

    const response = await POST(
      new Request("https://storefront.test/api/storefront/v1/analytics/events", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
        body: JSON.stringify({
          eventName: "PageView",
          path: "/catalogo",
        }),
      }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        accepted: false,
        delivered: false,
        reason: "bot_user_agent_filtered",
      },
    });
  });
});
