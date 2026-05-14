import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/runtime/storefront-request-context", () => ({
  getStorefrontRuntimeSnapshot: vi.fn(),
}));

vi.mock("@/lib/storefront-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storefront-api")>("@/lib/storefront-api");

  return {
    ...actual,
    getBootstrap: vi.fn(),
    getCategories: vi.fn(),
    getCatalog: vi.fn(),
  };
});

import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import { getBootstrap, getCatalog, getCategories } from "@/lib/storefront-api";
import { getTenantSitemapData } from "@/lib/seo/sitemap-data";

const getStorefrontRuntimeSnapshotMock = vi.mocked(getStorefrontRuntimeSnapshot);
const getBootstrapMock = vi.mocked(getBootstrap);
const getCategoriesMock = vi.mocked(getCategories);
const getCatalogMock = vi.mocked(getCatalog);

describe("getTenantSitemapData", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getStorefrontRuntimeSnapshotMock.mockResolvedValue({
      hasApiBaseUrl: true,
      context: {
        host: "acme.example.com",
        requestId: "req_1",
        storefrontVersion: "test",
      },
    } as never);
    getBootstrapMock.mockResolvedValue({
      tenant: { status: "active" },
    } as never);
    getCategoriesMock.mockResolvedValue([]);
  });

  it("pagina el catálogo completo respetando el pageSize maximo del backend", async () => {
    getCatalogMock
      .mockResolvedValueOnce({
        products: [
          { productId: "prod-1", slug: "prod-1", name: "Prod 1" },
          { productId: "prod-2", slug: "prod-2", name: "Prod 2" },
        ],
        pagination: { page: 1, pageSize: 48, total: 3, totalPages: 2 },
      } as never)
      .mockResolvedValueOnce({
        products: [{ productId: "prod-3", slug: "prod-3", name: "Prod 3" }],
        pagination: { page: 2, pageSize: 48, total: 3, totalPages: 2 },
      } as never);

    const result = await getTenantSitemapData();

    expect(getCatalogMock).toHaveBeenNthCalledWith(
      1,
      expect.any(Object),
      { page: 1, pageSize: 48 },
      { origin: "sitemap" },
    );
    expect(getCatalogMock).toHaveBeenNthCalledWith(
      2,
      expect.any(Object),
      { page: 2, pageSize: 48 },
      { origin: "sitemap" },
    );
    expect(result.products.map((product) => product.slug)).toEqual(["prod-1", "prod-2", "prod-3"]);
    expect(result.issues).toEqual([]);
  });

  it("conserva productos ya recolectados si falla una página posterior", async () => {
    getCatalogMock
      .mockResolvedValueOnce({
        products: [{ productId: "prod-1", slug: "prod-1", name: "Prod 1" }],
        pagination: { page: 1, pageSize: 48, total: 2, totalPages: 2 },
      } as never)
      .mockRejectedValueOnce(new Error("timeout"));

    const result = await getTenantSitemapData();

    expect(result.products.map((product) => product.slug)).toEqual(["prod-1"]);
    expect(result.issues).toContain("catalog:page=2:Error inesperado en catalog:page=2");
  });
});
