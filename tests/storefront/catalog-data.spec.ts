import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadCatalogRouteData, resolveCatalogRoute } from "@/app/(storefront)/catalogo/_lib/catalog-data";
import type { StorefrontCategory } from "@/lib/storefront-api";

vi.mock("@/app/(storefront)/_lib/storefront-shell-data", () => ({
  canBrowseCatalog: vi.fn(() => true),
  loadBootstrapExperience: vi.fn(),
  loadCatalogExperience: vi.fn(),
}));

vi.mock("@/lib/storefront-api", () => ({
  getCategories: vi.fn(),
}));

import {
  loadBootstrapExperience,
  loadCatalogExperience,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { getCategories } from "@/lib/storefront-api";

const loadBootstrapExperienceMock = vi.mocked(loadBootstrapExperience);
const loadCatalogExperienceMock = vi.mocked(loadCatalogExperience);
const getCategoriesMock = vi.mocked(getCategories);

const CATEGORIES: StorefrontCategory[] = [
  {
    categoryId: "cat-neu",
    slug: "neumaticos",
    name: "Neumáticos",
  },
];

describe("catalog data", () => {
  beforeEach(() => {
    loadBootstrapExperienceMock.mockReset();
    loadCatalogExperienceMock.mockReset();
    getCategoriesMock.mockReset();

    loadBootstrapExperienceMock.mockResolvedValue({
      bootstrap: {
        tenant: { status: "active" },
      },
      runtime: {
        context: {
          host: "acme.example.com",
          requestId: "req_1",
          storefrontVersion: "test",
        },
      },
    } as never);
    loadCatalogExperienceMock.mockResolvedValue({
      bootstrap: null,
      catalog: { products: [] },
      runtime: {
        context: {
          host: "acme.example.com",
          requestId: "req_2",
          storefrontVersion: "test",
        },
      },
    } as never);
  });

  it("no convierte a 404 falso una categoría por slug cuando falla categories", async () => {
    getCategoriesMock.mockRejectedValueOnce(new Error("timeout"));

    const route = await resolveCatalogRoute({}, "neumaticos");

    expect(route.categoryLookupFailed).toBe(true);
    expect(route.selectedCategory).toBeNull();
    expect(route.pathname).toBe("/catalogo/neumaticos");
  });

  it("mantiene la experiencia pública aunque falle categories en la ruta por slug", async () => {
    getCategoriesMock.mockRejectedValueOnce(new Error("timeout"));

    const routeData = await loadCatalogRouteData({}, "neumaticos");

    expect(routeData.categoryLookupFailed).toBe(true);
    expect(routeData.selectedCategory).toBeNull();
    expect(routeData.pathname).toBe("/catalogo/neumaticos");
    expect(loadCatalogExperienceMock).toHaveBeenCalledWith({});
  });

  it("normaliza categoryId cuando categories responde correctamente", async () => {
    getCategoriesMock.mockResolvedValueOnce(CATEGORIES);

    const route = await resolveCatalogRoute({ category: "neumaticos" });

    expect(route.categoryLookupFailed).toBe(false);
    expect(route.selectedCategory?.categoryId).toBe("cat-neu");
    expect(route.query.categoryId).toBe("cat-neu");
    expect(route.pathname).toBe("/catalogo/neumaticos");
  });

  it("degrada queries variantes de catálogo a la query canónica antes de pegar al backend", async () => {
    getCategoriesMock.mockResolvedValueOnce(CATEGORIES);

    const routeData = await loadCatalogRouteData({
      category: "neumaticos",
      brand: "HENGST",
      sortBy: "price",
      page: "2",
      search: "R16",
    });

    expect(loadCatalogExperienceMock).toHaveBeenCalledWith({
      categoryId: "cat-neu",
    });
    expect(routeData.query).toEqual({
      categoryId: "cat-neu",
    });
  });
});
