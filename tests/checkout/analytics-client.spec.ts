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
        meta: { enabled: true, pixelId: "px_789" },
        google: { enabled: false },
      },
      { anonymous_id: "anon_1", email: "compras@bym.test" },
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
        externalId: "compras@bym.test",
        fbp: "fb.1.123",
      },
    });
  });

  it("dispara ttq y enriquece el payload server-side con ttp y ttclid", () => {
    const ttq = {
      load: vi.fn(),
      page: vi.fn(),
      track: vi.fn(),
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    (globalThis as any).window = {
      location: {
        pathname: "/checkout",
        search: "?step=payment",
      },
      ttq,
    };
    (globalThis as any).document = {
      cookie: "_ttp=ttp_cookie_value",
    };
    vi.stubGlobal("fetch", fetchMock);

    const bridge = installStorefrontAnalyticsBridge(
      {
        meta: { enabled: false },
        google: { enabled: false },
        tiktok: { enabled: true, pixelId: "D8IURFJC77U450KRIBUG" },
      },
      {
        anonymous_id: "anon_1",
        ttclid: "ttclid_query_value",
      },
    );

    bridge?.track({
      event: "AddToCart",
      metaPayload: {
        content_ids: ["prod_1"],
        content_type: "product",
        currency: "ARS",
        eventId: "evt_tt_1",
        items: [{ id: "prod_1", name: "Producto", price: 15000, quantity: 1 }],
        value: 15000,
      },
      options: { eventId: "evt_tt_1" },
      serverEvent: "AddToCart",
      tiktokEvent: "AddToCart",
      tiktokPayload: {
        content_id: "prod_1",
        content_type: "product",
        currency: "ARS",
        value: 15000,
      },
    });

    expect(ttq.track).toHaveBeenCalledWith(
      "AddToCart",
      expect.objectContaining({
        content_id: "prod_1",
        currency: "ARS",
        value: 15000,
      }),
    );
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      eventName: "AddToCart",
      eventId: "evt_tt_1",
      user: {
        externalId: "anon_1",
        ttclid: "ttclid_query_value",
        ttp: "ttp_cookie_value",
      },
    });
  });

  it("deriva un payload TikTok deduplicable aunque el caller sólo provea el payload commerce compartido", () => {
    const ttq = {
      load: vi.fn(),
      page: vi.fn(),
      track: vi.fn(),
    };

    (globalThis as any).window = {
      location: {
        href: "https://bym.pyme.test/producto/prod-1",
        pathname: "/producto/prod-1",
        search: "",
      },
      ttq,
    };

    const bridge = installStorefrontAnalyticsBridge(
      {
        meta: { enabled: false },
        google: { enabled: false },
        tiktok: { enabled: true, pixelId: "D8IURFJC77U450KRIBUG" },
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
        items: [{ id: "prod_1", name: "Cubierta 205/55R16", price: 15000, quantity: 2 }],
        value: 30000,
      },
      options: { eventId: "evt_tt_derived_1" },
      serverEvent: null,
    });

    expect(ttq.track).toHaveBeenCalledWith(
      "AddToCart",
      expect.objectContaining({
        content_id: "prod_1",
        content_ids: ["prod_1"],
        content_name: "Cubierta 205/55R16",
        content_type: "product",
        currency: "ARS",
        description: "Cubierta 205/55R16",
        event_id: "evt_tt_derived_1",
        quantity: 2,
        url: "https://bym.pyme.test/producto/prod-1",
        value: 30000,
      }),
    );
  });

  it("no golpea el proxy interno si el tenant no tiene analytics activos", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    (globalThis as any).window = {
      location: {
        pathname: "/checkout",
        search: "",
      },
    };
    vi.stubGlobal("fetch", fetchMock);

    const bridge = installStorefrontAnalyticsBridge(
      {
        meta: { enabled: false },
        google: { enabled: false },
        tiktok: { enabled: false },
      },
      { anonymous_id: "anon_disabled" },
    );

    bridge?.track({
      event: "Contact",
      metaEvent: "Contact",
      metaPayload: {
        eventId: "contact_disabled",
        content_name: "Sin analytics",
      },
      options: { eventId: "contact_disabled" },
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("encola eventos de Meta aunque el pixel todavía no haya cargado en el browser", () => {
    (globalThis as any).window = {
      location: {
        pathname: "/checkout",
        search: "",
      },
    };

    const bridge = installStorefrontAnalyticsBridge(
      {
        meta: { enabled: true, pixelId: "px_456" },
        google: { enabled: false },
      },
      { anonymous_id: "anon_2" },
    );

    bridge?.track({
      event: "AddToCart",
      metaEvent: "AddToCart",
      metaPayload: {
        content_ids: ["prod_2"],
        currency: "ARS",
        value: 12500,
      },
    });

    const fbq = (globalThis as any).window.fbq;

    expect(typeof fbq).toBe("function");
    expect(fbq.queue).toEqual([
      ["init", "px_456"],
      ["track", "AddToCart", { content_ids: ["prod_2"], currency: "ARS", value: 12500 }],
    ]);
  });
});
