import { beforeEach, describe, expect, it, vi } from "vitest";

const getStorefrontRuntimeSnapshotMock = vi.hoisted(() => vi.fn());
const getBootstrapMock = vi.hoisted(() => vi.fn());
const getProductMock = vi.hoisted(() => vi.fn());
const getCategoriesMock = vi.hoisted(() => vi.fn());
const getCatalogMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/runtime/storefront-request-context", () => ({
  getStorefrontRuntimeSnapshot: getStorefrontRuntimeSnapshotMock,
}));

vi.mock("@/lib/storefront-api", () => ({
  StorefrontApiError: class StorefrontApiError extends Error {
    status?: number;
    code?: string;
  },
  getBootstrap: getBootstrapMock,
  getProduct: getProductMock,
  getCategories: getCategoriesMock,
  getCatalog: getCatalogMock,
  getPaymentMethods: vi.fn(),
}));

import { loadProductExperience } from "@/app/(storefront)/_lib/storefront-shell-data";

describe("loadProductExperience", () => {
  beforeEach(() => {
    getStorefrontRuntimeSnapshotMock.mockReset();
    getBootstrapMock.mockReset();
    getProductMock.mockReset();
    getCategoriesMock.mockReset();
    getCatalogMock.mockReset();

    getStorefrontRuntimeSnapshotMock.mockResolvedValue({
      hasApiBaseUrl: true,
      context: {
        host: "acme.example.com",
        resolvedHost: "acme.example.com",
        requestId: "req_product_exp",
        storefrontVersion: "test",
      },
    });

    getBootstrapMock.mockResolvedValue({
      tenant: { status: "active" },
      branding: { storeName: "Acme" },
    });
  });

  it("deriva relatedProducts por categoría cuando puede resolver categoryId", async () => {
    getProductMock.mockResolvedValue({
      productId: "prod-1",
      slug: "cubierta-premium",
      name: "Cubierta Premium",
      category: "neumaticos",
      brand: "Hankook",
      price: { amount: 1000, currency: "ARS" },
    });
    getCategoriesMock.mockResolvedValue([
      { categoryId: "cat-1", slug: "neumaticos", name: "Neumáticos" },
    ]);
    getCatalogMock.mockResolvedValue({
      products: [
        { productId: "prod-1", slug: "cubierta-premium", name: "Cubierta Premium" },
        { productId: "prod-2", slug: "cubierta-related", name: "Cubierta Related" },
      ],
      pagination: { page: 1, pageSize: 13, total: 2, totalPages: 1 },
    });

    const experience = await loadProductExperience("cubierta-premium");

    expect(getCatalogMock).toHaveBeenCalledWith(
      expect.objectContaining({ host: "acme.example.com" }),
      expect.objectContaining({ categoryId: "cat-1", pageSize: 13 }),
    );
    expect(experience.relatedProducts).toEqual([
      expect.objectContaining({ productId: "prod-2", slug: "cubierta-related" }),
    ]);
  });

  it("cae a brand cuando no puede resolver categoría", async () => {
    getProductMock.mockResolvedValue({
      productId: "prod-1",
      slug: "aceite-premium",
      name: "Aceite Premium",
      category: "lubricantes",
      brand: "Castrol",
      price: { amount: 1000, currency: "ARS" },
    });
    getCategoriesMock.mockResolvedValue([]);
    getCatalogMock.mockResolvedValue({
      products: [
        { productId: "prod-1", slug: "aceite-premium", name: "Aceite Premium" },
        { productId: "prod-3", slug: "aceite-related", name: "Aceite Related" },
      ],
      pagination: { page: 1, pageSize: 13, total: 2, totalPages: 1 },
    });

    const experience = await loadProductExperience("aceite-premium");

    expect(getCatalogMock).toHaveBeenCalledWith(
      expect.objectContaining({ host: "acme.example.com" }),
      expect.objectContaining({ brand: "Castrol", pageSize: 13 }),
    );
    expect(experience.relatedProducts).toEqual([
      expect.objectContaining({ productId: "prod-3", slug: "aceite-related" }),
    ]);
  });
});
