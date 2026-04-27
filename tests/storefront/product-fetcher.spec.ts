import { describe, expect, it, vi, beforeEach } from "vitest";

import type { StorefrontProductDetail } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
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
}));

const requestStorefrontApiMock = vi.mocked(requestStorefrontApi);

describe("getProduct", () => {
  beforeEach(() => {
    requestStorefrontApiMock.mockReset();
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
});
