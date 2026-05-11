import { beforeEach, describe, expect, it, vi } from "vitest";

import { installStorefrontAnalyticsBridge } from "@/lib/analytics/client";

describe("storefront analytics client bridge", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { document?: unknown }).document;
  });

  it("permite enviar nombres distintos a Meta y GA4 sin duplicar server analytics", () => {
    const fbq = vi.fn();
    const gtag = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    (globalThis as any).window = {
      location: {
        pathname: "/checkout",
        search: "?step=payment",
      },
      fbq,
      gtag,
    };
    vi.stubGlobal("fetch", fetchMock);

    const bridge = installStorefrontAnalyticsBridge(
      {
        meta: { enabled: true, pixelId: "px_123" },
        google: { enabled: true, measurementId: "G-123" },
      },
      { anonymous_id: "anon_1", ga_client_id: "111.222", fbp: "fbp_1" },
    );

    bridge?.track({
      event: "InitiateCheckout",
      googleEvent: "begin_checkout",
      metaEvent: "InitiateCheckout",
      metaPayload: {
        content_ids: ["prod_1"],
        content_type: "product",
        currency: "ARS",
        eventId: "evt_1",
        value: 15000,
      },
      googlePayload: {
        currency: "ARS",
        eventId: "evt_1",
        items: [{ id: "prod_1", name: "Producto", price: 15000, quantity: 1 }],
        value: 15000,
      },
      options: { eventId: "evt_1" },
    });

    expect(fbq).toHaveBeenCalledWith(
      "track",
      "InitiateCheckout",
      expect.objectContaining({ content_ids: ["prod_1"], value: 15000 }),
      { eventID: "evt_1" },
    );
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "begin_checkout",
      expect.objectContaining({ currency: "ARS", event_id: "evt_1", value: 15000 }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      eventName: "InitiateCheckout",
      eventId: "evt_1",
      value: 15000,
      user: {
        clientId: "111.222",
        externalId: "anon_1",
        fbp: "fbp_1",
      },
    });
  });

  it("relee _ga desde document.cookie antes de enviar eventos server-side", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    (globalThis as any).window = {
      location: {
        pathname: "/producto/aceite",
        search: "",
      },
    };
    (globalThis as any).document = {
      cookie: "_ga=GA1.1.987654321.123456789; _fbp=fb.1.123",
    };
    vi.stubGlobal("fetch", fetchMock);

    const bridge = installStorefrontAnalyticsBridge(
      {
        meta: { enabled: false },
        google: { enabled: false },
      },
      { anonymous_id: "anon_1" },
    );

    bridge?.track({
      event: "AddToCart",
      metaEvent: "AddToCart",
      metaPayload: {
        content_ids: ["prod_1"],
        content_type: "product",
        currency: "ARS",
        eventId: "evt_2",
        items: [{ id: "prod_1", name: "Producto", price: 15000, quantity: 1 }],
        value: 15000,
      },
      options: { eventId: "evt_2" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      eventName: "AddToCart",
      user: {
        clientId: "987654321.123456789",
        externalId: "anon_1",
        fbp: "fb.1.123",
      },
    });
  });
});
