import { describe, expect, it } from "vitest";

import { resolveTenantSeoRules } from "@/lib/seo/rules";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

function bootstrap(
  shopStatus: StorefrontBootstrap["shopStatus"],
  seo: StorefrontBootstrap["seo"] = {},
): StorefrontBootstrap {
  return {
    shopStatus,
    seo,
  };
}

describe("resolveTenantSeoRules", () => {
  it("nunca indexa draft aunque el tenant pida indexar", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: bootstrap("draft", { allowIndexing: true, sitemapEnabled: true }),
      nodeEnv: "production",
    });

    expect(rules.allowIndexing).toBe(false);
    expect(rules.indexable).toBe(false);
    expect(rules.sitemapEnabled).toBe(false);
  });

  it("nunca indexa disabled aunque el tenant pida indexar", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: bootstrap("disabled", { indexable: true, includeInSitemap: true }),
      nodeEnv: "production",
    });

    expect(rules.allowIndexing).toBe(false);
    expect(rules.indexable).toBe(false);
    expect(rules.sitemapEnabled).toBe(false);
  });

  it("permite que active indexe en produccion salvo override restrictivo", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: bootstrap("active"),
      nodeEnv: "production",
    });

    expect(rules.allowIndexing).toBe(true);
    expect(rules.indexable).toBe(true);
    expect(rules.sitemapEnabled).toBe(true);
  });

  it("bloquea indexacion fuera de produccion", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: bootstrap("active"),
      nodeEnv: "development",
    });

    expect(rules.indexable).toBe(false);
    expect(rules.sitemapEnabled).toBe(false);
  });

  it("respeta noindex como override restrictivo", () => {
    const rules = resolveTenantSeoRules({
      bootstrap: bootstrap("paused", { noindex: true }),
      nodeEnv: "production",
    });

    expect(rules.allowIndexing).toBe(false);
    expect(rules.indexable).toBe(false);
  });
});

