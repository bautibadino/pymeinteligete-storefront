import { beforeEach, describe, expect, it, vi } from "vitest";

const getStorefrontRuntimeSnapshotMock = vi.hoisted(() => vi.fn());
const getBootstrapMock = vi.hoisted(() => vi.fn());
const getProductMock = vi.hoisted(() => vi.fn());
const getCategoriesMock = vi.hoisted(() => vi.fn());
const getCatalogMock = vi.hoisted(() => vi.fn());
const getPaymentMethodsMock = vi.hoisted(() => vi.fn());

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
  getPaymentMethods: getPaymentMethodsMock,
}));

import { loadProductExperience } from "@/app/(storefront)/_lib/storefront-shell-data";

describe("loadProductExperience", () => {
  beforeEach(() => {
    getStorefrontRuntimeSnapshotMock.mockReset();
    getBootstrapMock.mockReset();
    getProductMock.mockReset();
    getCategoriesMock.mockReset();
    getCatalogMock.mockReset();
    getPaymentMethodsMock.mockReset();

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
    getPaymentMethodsMock.mockResolvedValue({
      paymentMethods: [
        {
          methodId: "pm-mp",
          methodType: "gateway",
          displayName: "Mercado Pago",
          description: "Hasta 6 cuotas",
          icon: null,
          color: null,
          discount: null,
        },
      ],
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

  it("trae paymentMethods reales en la experiencia del PDP cuando la superficie puede mostrarlos", async () => {
    getProductMock.mockResolvedValue({
      productId: "prod-1",
      slug: "cubierta-premium",
      name: "Cubierta Premium",
      category: "neumaticos",
      brand: "Hankook",
      price: { amount: 1000, currency: "ARS" },
    });
    getCategoriesMock.mockResolvedValue([]);
    getCatalogMock.mockResolvedValue({
      products: [],
      pagination: { page: 1, pageSize: 13, total: 0, totalPages: 0 },
    });

    const experience = await loadProductExperience("cubierta-premium");

    expect(getPaymentMethodsMock).toHaveBeenCalledWith(
      expect.objectContaining({ host: "acme.example.com" }),
    );
    expect(experience.paymentMethods).toEqual(
      expect.objectContaining({
        paymentMethods: [
          expect.objectContaining({ methodId: "pm-mp", displayName: "Mercado Pago" }),
        ],
      }),
    );
  });

  it("agrega issue de payment-methods pero no rompe el PDP si ese fetch falla", async () => {
    getProductMock.mockResolvedValue({
      productId: "prod-1",
      slug: "cubierta-premium",
      name: "Cubierta Premium",
      category: "neumaticos",
      brand: "Hankook",
      price: { amount: 1000, currency: "ARS" },
    });
    getCategoriesMock.mockResolvedValue([]);
    getCatalogMock.mockResolvedValue({
      products: [],
      pagination: { page: 1, pageSize: 13, total: 0, totalPages: 0 },
    });
    getPaymentMethodsMock.mockRejectedValue(new Error("boom"));

    const experience = await loadProductExperience("cubierta-premium");

    expect(experience.product).toEqual(
      expect.objectContaining({ productId: "prod-1", slug: "cubierta-premium" }),
    );
    expect(experience.paymentMethods).toBeNull();
    expect(experience.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: "payment-methods" }),
      ]),
    );
  });
});
