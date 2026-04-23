import { describe, expect, it } from "vitest";

import { buildTenantSitemap } from "@/lib/seo/sitemap";
import type { TenantSeoSnapshot } from "@/lib/seo/types";

function snapshot(overrides: Partial<TenantSeoSnapshot> = {}): TenantSeoSnapshot {
  return {
    bootstrap: null,
    canonicalBaseUrl: new URL("https://acme.example.com"),
    canonicalHost: "acme.example.com",
    resolvedHost: "acme.example.com",
    shopStatus: "active",
    title: "Acme",
    description: null,
    ogImageUrl: null,
    faviconUrl: null,
    indexable: true,
    allowIndexing: true,
    sitemapEnabled: true,
    issues: [],
    ...overrides,
  };
}

describe("buildTenantSitemap", () => {
  it("devuelve vacío cuando indexable es false", () => {
    const result = buildTenantSitemap(snapshot({ indexable: false, sitemapEnabled: true }));

    expect(result).toHaveLength(0);
  });

  it("devuelve vacío cuando sitemapEnabled es false", () => {
    const result = buildTenantSitemap(snapshot({ indexable: true, sitemapEnabled: false }));

    expect(result).toHaveLength(0);
  });

  it("incluye rutas base por defecto", () => {
    const result = buildTenantSitemap(snapshot());
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain("https://acme.example.com/");
    expect(urls).toContain("https://acme.example.com/catalogo");
  });

  it("incluye categorías con slug", () => {
    const result = buildTenantSitemap(snapshot(), [
      { categoryId: "1", slug: "autos", name: "Autos" },
      { categoryId: "2", slug: "", name: "Sin slug" },
    ]);
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain("https://acme.example.com/catalogo?category=autos");
    expect(urls).not.toContain("https://acme.example.com/catalogo?category=");
  });

  it("incluye productos con slug", () => {
    const result = buildTenantSitemap(snapshot(), [], [
      { productId: "1", slug: "cubierta-16", name: "Cubierta 16" },
      { productId: "2", slug: "", name: "Sin slug" },
    ]);
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain("https://acme.example.com/producto/cubierta-16");
    expect(urls).not.toContain("https://acme.example.com/producto/");
  });

  it("no duplica rutas base", () => {
    const result = buildTenantSitemap(snapshot());
    const urls = result.map((entry) => entry.url);

    expect(urls.filter((url) => url === "https://acme.example.com/")).toHaveLength(1);
  });
});
