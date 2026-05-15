import { describe, expect, it, vi, beforeEach } from "vitest";

import type { StorefrontProductDetail } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { getProduct } from "@/lib/fetchers/product";

vi.mock("@/lib/api/client", () => ({
  requestStorefrontApi: vi.fn(),
}));

vi.mock("@/lib/fetchers/context", () => ({
  resolveStorefrontRequestContext: vi.fn((input: string) => ({
    host: input,
    requestId: "test-request",
    resolvedHost: input,
  })),
}));

vi.mock("@/lib/fetchers/cache", () => ({
  buildStorefrontGetNextOptions: vi.fn(() => ({ revalidate: 60, tags: ["test"] })),
  readCachedStorefrontGet: vi.fn((_: string, __: string, ___: unknown, fetcher: () => unknown) => fetcher()),
}));

const requestStorefrontApiMock = vi.mocked(requestStorefrontApi);

describe("getProduct", () => {
  beforeEach(() => {
    requestStorefrontApiMock.mockReset();
    vi.mocked(buildStorefrontGetNextOptions).mockClear();
  });

  it("desempaqueta el contrato real data.product del endpoint de detalle", async () => {
    const product = {
      productId: "prod-1",
      slug: "cubierta-premium",
      name: "Cubierta Premium",
      price: { amount: 1000, currency: "ARS" },
    } satisfies StorefrontProductDetail;

    requestStorefrontApiMock.mockResolvedValueOnce({ product });

    await expect(getProduct("bym.example.com", "cubierta-premium")).resolves.toEqual(product);
  });

  it("mantiene compatibilidad si el backend devuelve el producto directamente", async () => {
    const product = {
      productId: "prod-2",
      slug: "aceite-premium",
      name: "Aceite Premium",
      price: { amount: 2000, currency: "ARS" },
    } satisfies StorefrontProductDetail;

    requestStorefrontApiMock.mockResolvedValueOnce(product);

    await expect(getProduct("bym.example.com", "aceite-premium")).resolves.toEqual(product);
  });

  it("corta el namespace de cache del detalle para invalidar snapshots de pricing stale", async () => {
    requestStorefrontApiMock.mockResolvedValueOnce({
      productId: "prod-3",
      slug: "filtro-aceite",
      name: "Filtro de aceite",
      price: { amount: 1500, currency: "ARS" },
    } satisfies StorefrontProductDetail);

    await getProduct("bym.example.com", "filtro-aceite");

    expect(buildStorefrontGetNextOptions).toHaveBeenCalledWith(
      "product:pricing-v2",
      "bym.example.com",
      { slug: "filtro-aceite", _sv: "pricing-2026-05-15" },
      undefined,
    );
    expect(requestStorefrontApiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/storefront/v1/products/filtro-aceite",
        query: { _sv: "pricing-2026-05-15" },
      }),
    );
  });
});
