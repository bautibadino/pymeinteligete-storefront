import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { StorefrontBootstrap } from "@/lib/storefront-api";

const navigationState = vi.hoisted(() => ({
  pathname: "/catalogo",
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useSearchParams: () => navigationState.searchParams,
}));

vi.mock("@/components/storefront/catalog-grid", () => ({
  CatalogGrid: () => createElement("section", { "aria-label": "Productos públicos" }, "Productos"),
}));

function renderHtml(element: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(element).replaceAll("&amp;", "&");
}

function setCurrentUrl(pathname: string, search: string) {
  navigationState.pathname = pathname;
  navigationState.searchParams = new URLSearchParams(search);
}

function createBymBootstrap(): StorefrontBootstrap {
  return {
    requestContext: {
      requestId: "req_test",
      storefrontVersion: "test",
      apiVersion: "v1",
    },
    tenant: {
      tenantSlug: "bym",
      empresaId: "empresa-test",
      status: "active",
      resolvedHost: "bym.test",
      resolvedBy: "dev_fallback",
    },
    branding: {
      storeName: "BYM",
      colors: { primary: "#111111" },
    },
    storefrontExperience: {
      key: "bym-custom-v1",
      enabled: true,
    },
    theme: {
      preset: "editorialDark",
      layout: "default",
    },
    seo: {},
    navigation: {
      headerLinks: [],
      footerColumns: [],
    },
    home: {
      modules: [],
    },
    commerce: {
      payment: {
        visibleMethods: [],
      },
    },
    features: {
      reviewsEnabled: false,
      compareEnabled: false,
      wishlistEnabled: false,
      contactBarEnabled: false,
      searchEnabled: true,
    },
    pages: [],
  };
}

describe("CatalogPageContent", () => {
  it("muestra paginación BYM y labels de categoría desde facets sin exponer categoryId", async () => {
    const { CatalogPageContent } = await import("@/components/storefront/catalog-page");
    const activeCategoryId = ["cat", "lubricantes"].join("-");

    setCurrentUrl(
      "/catalogo",
      `brand=Shell&categoryId=${activeCategoryId}&page=2&pageSize=24&sort=priceAsc`,
    );

    const html = renderHtml(
      createElement(CatalogPageContent, {
        bootstrap: createBymBootstrap(),
        categories: [],
        facets: {
          brands: [
            { value: "Shell", label: "Shell" },
            { value: "Pirelli", label: "Pirelli" },
          ],
          categories: [
            {
              categoryId: activeCategoryId,
              slug: "lubricantes",
              label: "Lubricantes",
            },
          ],
        },
        host: "bym.test",
        pagination: {
          page: 2,
          pageSize: 24,
          total: 97,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: true,
        },
        products: [],
        query: {
          brand: "Shell",
          categoryId: activeCategoryId,
          page: 2,
          pageSize: 24,
        },
        selectedCategory: null,
      }),
    );

    expect(html).toContain('data-bym-fullbleed="true"');
    expect(html).toContain("Página 2 de 5");
    expect(html).toContain("97 productos");
    expect(html).toContain("Lubricantes");
    expect(html).toContain("Pirelli");
    expect(html).toContain(`href="/catalogo?brand=Shell&categoryId=${activeCategoryId}&page=3&pageSize=24&sort=priceAsc"`);
    expect(html).not.toContain(`>${activeCategoryId}<`);
  });
});
