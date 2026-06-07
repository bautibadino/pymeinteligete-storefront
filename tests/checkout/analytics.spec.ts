import { describe, expect, it, vi } from "vitest";

import { extractAnalyticsCookies } from "@/lib/analytics/cookies";
import {
  buildAddPaymentInfoPayload,
  buildAddShippingInfoPayload,
  buildAddToCartPayload,
  buildContactPayload,
  buildInitiateCheckoutPayload,
  buildLeadPayload,
  buildPurchasePayload,
  buildSearchPayload,
  buildSelectItemPayload,
  buildViewItemListPayload,
  buildViewItemPayload,
} from "@/lib/analytics/events";
import { enrichAnalyticsIdentity, resolveAnalyticsIdentity } from "@/lib/analytics/identity";
import { resolveStorefrontAnalyticsConfig } from "@/lib/analytics/config";
import { getOrCreateStoredValue, markTrackedEvent } from "@/lib/analytics/storage";
import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

function createStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

function order(overrides: Partial<StorefrontOrderByTokenResult> = {}): StorefrontOrderByTokenResult {
  return {
    orderId: "ord_1",
    orderNumber: "000123",
    status: "approved",
    isPaid: true,
    total: 15200,
    createdAt: "2026-05-03T13:00:00.000Z",
    customer: {
      name: "Juan Perez",
      email: "juan@test.com",
      phone: "3515550000",
    },
    shippingAddress: {
      street: "Belgrano",
      number: "123",
      city: "Corral de Bustos",
      province: "Cordoba",
      postalCode: "2645",
    },
    items: [
      {
        productId: "prod_1",
        description: "Producto 1",
        quantity: 2,
        unitPrice: 5000,
        total: 10000,
      },
      {
        productId: "prod_2",
        description: "Producto 2",
        quantity: 1,
        unitPrice: 5200,
        total: 5200,
      },
    ],
    payment: {
      provider: "mercadopago",
      reference: "pay_123",
    },
    ...overrides,
  };
}

describe("resolveStorefrontAnalyticsConfig", () => {
  it("extrae Pixel y GA desde el bootstrap runtime sin depender de env", () => {
    const config = resolveStorefrontAnalyticsConfig({
      analytics: {
        pixel: {
          enabled: true,
          pixelId: "123456789",
        },
        google: {
          enabled: true,
          measurementId: "G-TEST123",
        },
      },
    });

    expect(config).toEqual({
      meta: {
        enabled: true,
        pixelId: "123456789",
      },
      google: {
        enabled: true,
        measurementId: "G-TEST123",
      },
      tiktok: {
        enabled: false,
      },
    });
  });

  it("tolera variantes legacy del payload analytics", () => {
    const config = resolveStorefrontAnalyticsConfig({
      analytics: {
        pixelId: "legacy-pixel",
        ga: {
          gaId: "G-LEGACY",
        },
      },
    });

    expect(config.meta).toEqual({
      enabled: true,
      pixelId: "legacy-pixel",
    });
    expect(config.google).toEqual({
      enabled: true,
      measurementId: "G-LEGACY",
    });
  });

  it("resuelve TikTok host-driven desde bootstrap sin hardcodes por tenant", () => {
    const config = resolveStorefrontAnalyticsConfig({
      analytics: {
        tiktok: {
          enabled: true,
          pixelId: "D8IURFJC77U450KRIBUG",
        },
      },
    });

    expect(config.tiktok).toEqual({
      enabled: true,
      pixelId: "D8IURFJC77U450KRIBUG",
    });
  });
});

describe("extractAnalyticsCookies", () => {
  it("extrae _fbp, arma _fbc desde fbclid y normaliza ga_client_id", () => {
    const persistFbc = vi.fn();

    const cookies = extractAnalyticsCookies({
      cookie: "_fbp=fbp.123; _ga=GA1.1.987654321.123456789",
      search: "?fbclid=fbclid-123",
      hostname: "tienda.demo.com",
      now: () => 1714742400000,
      persistFbc,
      readStoredFbc: () => undefined,
    });

    expect(cookies.fbp).toBe("fbp.123");
    expect(cookies.fbc).toBe("fb.2.1714742400000.fbclid-123");
    expect(cookies.ga_client_id).toBe("987654321.123456789");
    expect(persistFbc).toHaveBeenCalledWith("fb.2.1714742400000.fbclid-123");
  });

  it("usa el fbc persistido cuando la landing actual ya no tiene fbclid", () => {
    const cookies = extractAnalyticsCookies({
      cookie: "",
      search: "",
      hostname: "tienda.demo.com",
      readStoredFbc: () => "fb.1.111.saved",
    });

    expect(cookies.fbc).toBe("fb.1.111.saved");
  });

  it("extrae _ttp desde cookie y ttclid desde query string", () => {
    const persistTtclid = vi.fn();

    const cookies = extractAnalyticsCookies({
      cookie: "_ttp=ttp_cookie_value",
      search: "?ttclid=ttclid_query_value",
      hostname: "tienda.demo.com",
      persistTtclid,
      readStoredFbc: () => undefined,
      readStoredTtclid: () => undefined,
    });

    expect(cookies.ttp).toBe("ttp_cookie_value");
    expect(cookies.ttclid).toBe("ttclid_query_value");
    expect(persistTtclid).toHaveBeenCalledWith("ttclid_query_value");
  });
});

describe("enrichAnalyticsIdentity", () => {
  it("normaliza datos del comprador y preserva ids existentes para matching server-side", () => {
    const identity = enrichAnalyticsIdentity(
      {
        anonymous_id: "anon_1",
        fbp: "fb.1.123",
      },
      {
        name: "  Juan Perez  ",
        email: "  Juan.Perez+compras@Example.COM ",
        phone: " +54 9 351 555-1234 ",
        city: " Corral de Bustos ",
        province: " Córdoba ",
        postalCode: " 2645 ",
        taxId: " 20-12345678-9 ",
      },
    );

    expect(identity).toEqual({
      anonymous_id: "anon_1",
      fbp: "fb.1.123",
      email: "juan.perez+compras@example.com",
      phone: "5493515551234",
      first_name: "juan",
      last_name: "perez",
      city: "corral de bustos",
      province: "córdoba",
      postal_code: "2645",
      tax_id: "20123456789",
    });
  });

  it("preserva ttp y ttclid cuando enriquece identidad de analytics", () => {
    const identity = enrichAnalyticsIdentity(
      {
        anonymous_id: "anon_1",
        ttclid: "ttclid_query_value",
        ttp: "ttp_cookie_value",
      },
      {
        email: " buyer@example.com ",
      },
    );

    expect(identity).toEqual({
      anonymous_id: "anon_1",
      email: "buyer@example.com",
      ttclid: "ttclid_query_value",
      ttp: "ttp_cookie_value",
    });
  });
});

describe("resolveAnalyticsIdentity", () => {
  it("propaga ttclid dentro de la identidad resuelta y lo persiste para navegación posterior", () => {
    const persistCookie = vi.fn();
    const storage = createStorage();

    const identity = resolveAnalyticsIdentity({
      cookie: "_ttp=ttp_cookie_value",
      hostname: "tienda.demo.com",
      persistCookie,
      randomId: () => "anon_1",
      search: "?ttclid=ttclid_query_value",
      storage,
    });

    expect(identity).toMatchObject({
      anonymous_id: "anon_1",
      ttclid: "ttclid_query_value",
      ttp: "ttp_cookie_value",
    });
    expect(storage.getItem("storefront.analytics.ttclid")).toBe("ttclid_query_value");
    expect(persistCookie).toHaveBeenCalledWith(
      "sf_ttclid",
      "ttclid_query_value",
      60 * 60 * 24 * 365,
    );
  });
});

describe("storage helpers", () => {
  it("reutiliza ids persistidos para mantener estabilidad entre renders", () => {
    const storage = createStorage();
    const factory = vi.fn(() => "generated-id");

    expect(getOrCreateStoredValue(storage, "payment:tok_1", factory)).toBe("generated-id");
    expect(getOrCreateStoredValue(storage, "payment:tok_1", factory)).toBe("generated-id");
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("marca eventos una sola vez por storage key", () => {
    const storage = createStorage();

    expect(markTrackedEvent(storage, "purchase:000123")).toBe(true);
    expect(markTrackedEvent(storage, "purchase:000123")).toBe(false);
  });
});

describe("analytics payload builders", () => {
  const catalogItems = [
    {
      id: "prod_1",
      name: "Cubierta 205/55R16",
      price: 5000,
      quantity: 1,
      brand: "Hankook",
      category: "Neumaticos",
    },
    {
      id: "prod_2",
      name: "Aceite 10W40",
      price: 5200,
      quantity: 1,
      brand: "Elaion",
      category: "Lubricantes",
    },
  ];

  it("arma ViewItemList para catálogo con datos reales de productos", () => {
    const payload = buildViewItemListPayload({
      eventId: "list_catalogo_1",
      listId: "catalogo",
      listName: "Catalogo",
      items: catalogItems,
    });

    expect(payload).toMatchObject({
      eventId: "list_catalogo_1",
      item_list_id: "catalogo",
      item_list_name: "Catalogo",
      content_type: "product_group",
      content_ids: ["prod_1", "prod_2"],
      currency: "ARS",
    });
    expect(payload.items[0]).toMatchObject({
      id: "prod_1",
      name: "Cubierta 205/55R16",
      brand: "Hankook",
      category: "Neumaticos",
    });
  });

  it("arma SelectItem preservando posición/lista", () => {
    const payload = buildSelectItemPayload({
      eventId: "select_prod_1",
      index: 3,
      item: catalogItems[0],
      listId: "catalogo",
      listName: "Catalogo",
    });

    expect(payload).toMatchObject({
      eventId: "select_prod_1",
      item_list_id: "catalogo",
      item_list_name: "Catalogo",
      index: 3,
      content_ids: ["prod_1"],
      value: 5000,
    });
  });

  it("arma ViewItem/ViewContent para PDP", () => {
    const payload = buildViewItemPayload({
      eventId: "view_prod_1",
      item: catalogItems[0],
    });

    expect(payload).toMatchObject({
      eventId: "view_prod_1",
      value: 5000,
      currency: "ARS",
      content_type: "product",
      content_ids: ["prod_1"],
      content_name: "Cubierta 205/55R16",
    });
  });

  it("arma AddToCart con cantidad y valor total", () => {
    const payload = buildAddToCartPayload({
      eventId: "cart_prod_1",
      item: catalogItems[0],
      quantity: 2,
    });

    expect(payload).toMatchObject({
      eventId: "cart_prod_1",
      value: 10000,
      currency: "ARS",
      content_ids: ["prod_1"],
      num_items: 2,
    });
    expect(payload.items).toEqual([
      {
        id: "prod_1",
        name: "Cubierta 205/55R16",
        price: 5000,
        quantity: 2,
        brand: "Hankook",
        category: "Neumaticos",
      },
    ]);
  });

  it("arma Search con término y cantidad de resultados", () => {
    const payload = buildSearchPayload({
      eventId: "search_205",
      searchTerm: "205/55 r16",
      resultsCount: 12,
    });

    expect(payload).toEqual({
      eventId: "search_205",
      search_string: "205/55 r16",
      content_category: "catalog",
      results_count: 12,
    });
  });

  it("arma InitiateCheckout con items y total", () => {
    const payload = buildInitiateCheckoutPayload({
      eventId: "checkout_tok_1",
      value: 15200,
      orderToken: "tok_1",
      items: [
        { id: "prod_1", name: "Producto 1", price: 5000, quantity: 2 },
        { id: "prod_2", name: "Producto 2", price: 5200, quantity: 1 },
      ],
    });

    expect(payload).toMatchObject({
      eventId: "checkout_tok_1",
      value: 15200,
      currency: "ARS",
      content_type: "product",
      order_token: "tok_1",
      num_items: 3,
      content_ids: ["prod_1", "prod_2"],
    });
  });

  it("arma AddPaymentInfo con el método seleccionado", () => {
    const payload = buildAddPaymentInfoPayload({
      eventId: "payment_tok_1",
      methodLabel: "Transferencia bancaria",
      orderToken: "tok_1",
      value: 15200,
      items: [{ id: "prod_1", name: "Producto 1", price: 15200, quantity: 1 }],
    });

    expect(payload.payment_type).toBe("Transferencia bancaria");
    expect(payload.content_ids).toEqual(["prod_1"]);
    expect(payload.order_token).toBe("tok_1");
  });

  it("arma AddShippingInfo con método y costo de envío", () => {
    const payload = buildAddShippingInfoPayload({
      eventId: "shipping_andreani_1",
      shippingTier: "Andreani domicilio",
      shippingAmount: 4200,
      value: 19400,
      items: catalogItems,
    });

    expect(payload).toMatchObject({
      eventId: "shipping_andreani_1",
      shipping_tier: "Andreani domicilio",
      shipping: 4200,
      value: 19400,
      currency: "ARS",
      content_ids: ["prod_1", "prod_2"],
    });
  });

  it("arma Purchase desde la orden confirmada", () => {
    const payload = buildPurchasePayload(order());

    expect(payload).toMatchObject({
      eventId: "000123",
      value: 15200,
      currency: "ARS",
      content_ids: ["prod_1", "prod_2"],
      num_items: 3,
    });
    expect(payload.items).toEqual([
      { id: "prod_1", name: "Producto 1", price: 5000, quantity: 2 },
      { id: "prod_2", name: "Producto 2", price: 5200, quantity: 1 },
    ]);
  });

  it("arma Contact con superficie y medio para confirmación/manual payment", () => {
    const payload = buildContactPayload({
      eventId: "contact_manual_tok_1_whatsapp",
      surface: "checkout-confirmation",
      method: "whatsapp",
      orderToken: "tok_1",
      orderNumber: "000123",
      label: "Enviar comprobante",
    });

    expect(payload).toEqual({
      eventId: "contact_manual_tok_1_whatsapp",
      content_name: "Enviar comprobante",
      content_category: "checkout-confirmation",
      contact_method: "whatsapp",
      order_token: "tok_1",
      order_number: "000123",
    });
  });

  it("arma Lead para formulario de contacto general", () => {
    const payload = buildLeadPayload({
      eventId: "lead_contacto_1",
      label: "Formulario de contacto",
      method: "form",
      surface: "contact-page",
    });

    expect(payload).toEqual({
      eventId: "lead_contacto_1",
      content_name: "Formulario de contacto",
      content_category: "contact-page",
      contact_method: "form",
    });
  });
});
