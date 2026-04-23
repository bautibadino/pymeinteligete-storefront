import { describe, expect, it } from "vitest";

import { resolveNotFoundPolicy } from "@/lib/seo/not-found-policy";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

function bootstrap(status: StorefrontBootstrap["tenant"]["status"]): StorefrontBootstrap {
  return {
    requestContext: { requestId: "req_1", storefrontVersion: "test", apiVersion: "v1" },
    tenant: {
      tenantSlug: "test",
      empresaId: "emp_1",
      status,
      resolvedHost: "test.com",
      resolvedBy: "custom_domain",
    },
    branding: {
      storeName: "Test",
      colors: { primary: "#111827" },
    },
    theme: { preset: "default", layout: "commerce" },
    seo: {},
    navigation: { headerLinks: [], footerColumns: [] },
    home: { modules: [] },
    commerce: { payment: { visibleMethods: [] } },
    features: {
      reviewsEnabled: false,
      compareEnabled: false,
      wishlistEnabled: false,
      contactBarEnabled: false,
      searchEnabled: false,
    },
    pages: [],
  };
}

describe("resolveNotFoundPolicy", () => {
  it("muestra error de plataforma cuando fetchError es true", () => {
    const policy = resolveNotFoundPolicy("acme.com", null, true);

    expect(policy.statusLabel).toBe("Sin resolver");
    expect(policy.title).toBe("No pudimos contactar la plataforma");
    expect(policy.description).toContain("acme.com");
  });

  it("muestra tienda no encontrada cuando no hay bootstrap y no hubo fetchError", () => {
    const policy = resolveNotFoundPolicy("acme.com", null, false);

    expect(policy.statusLabel).toBe("Sin resolver");
    expect(policy.title).toBe("Tienda no encontrada");
  });

  it("muestra deshabilitada para shopStatus disabled", () => {
    const policy = resolveNotFoundPolicy("acme.com", bootstrap("disabled"), false);

    expect(policy.statusLabel).toBe("No disponible");
    expect(policy.title).toBe("Tienda deshabilitada");
  });

  it("muestra borrador para shopStatus draft", () => {
    const policy = resolveNotFoundPolicy("acme.com", bootstrap("draft"), false);

    expect(policy.statusLabel).toBe("En preparación");
    expect(policy.title).toBe("Tienda en borrador");
  });

  it("muestra pausada para shopStatus paused", () => {
    const policy = resolveNotFoundPolicy("acme.com", bootstrap("paused"), false);

    expect(policy.statusLabel).toBe("Pausada");
    expect(policy.title).toBe("Tienda pausada");
  });

  it("muestra página no encontrada para shopStatus active", () => {
    const policy = resolveNotFoundPolicy("acme.com", bootstrap("active"), false);

    expect(policy.statusLabel).toBe("No encontrada");
    expect(policy.title).toBe("Página no encontrada");
  });
});
