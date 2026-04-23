import { describe, expect, it } from "vitest";

import { resolveTenantSeoRules } from "@/lib/seo/rules";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

function minimalBootstrap(status: StorefrontBootstrap["tenant"]["status"]): StorefrontBootstrap {
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

describe("resolveTenantSeoRules", () => {
  it("nunca indexa draft", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: minimalBootstrap("draft"),
      nodeEnv: "production",
    });

    expect(rules.allowIndexing).toBe(false);
    expect(rules.indexable).toBe(false);
    expect(rules.sitemapEnabled).toBe(false);
  });

  it("nunca indexa disabled", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: minimalBootstrap("disabled"),
      nodeEnv: "production",
    });

    expect(rules.allowIndexing).toBe(false);
    expect(rules.indexable).toBe(false);
    expect(rules.sitemapEnabled).toBe(false);
  });

  it("permite que active indexe en produccion", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: minimalBootstrap("active"),
      nodeEnv: "production",
    });

    expect(rules.allowIndexing).toBe(true);
    expect(rules.indexable).toBe(true);
    expect(rules.sitemapEnabled).toBe(true);
  });

  it("bloquea indexacion fuera de produccion", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: minimalBootstrap("active"),
      nodeEnv: "development",
    });

    expect(rules.indexable).toBe(false);
    expect(rules.sitemapEnabled).toBe(false);
  });

  it("respeta paused como no indexable", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: minimalBootstrap("paused"),
      nodeEnv: "production",
    });

    expect(rules.allowIndexing).toBe(true);
    expect(rules.indexable).toBe(true);
    expect(rules.sitemapEnabled).toBe(true);
  });
});
