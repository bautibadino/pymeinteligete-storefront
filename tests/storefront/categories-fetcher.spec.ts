import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StorefrontCategory } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { getCategories } from "@/lib/fetchers/categories";

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

describe("getCategories", () => {
  beforeEach(() => {
    requestStorefrontApiMock.mockReset();
  });

  it("desempaqueta el contrato real data.categories y normaliza _id a categoryId", async () => {
    requestStorefrontApiMock.mockResolvedValueOnce({
      categories: [
        {
          _id: "cat-1",
          slug: "neumaticos",
          name: "Neumáticos",
          children: [
            {
              _id: "cat-1-1",
              slug: "auto",
              name: "Auto",
            },
          ],
        },
      ],
    });

    await expect(getCategories("bym.example.com")).resolves.toEqual([
      {
        categoryId: "cat-1",
        slug: "neumaticos",
        name: "Neumáticos",
        children: [
          {
            categoryId: "cat-1-1",
            slug: "auto",
            name: "Auto",
          },
        ],
      },
    ] satisfies StorefrontCategory[]);
  });

  it("mantiene compatibilidad si el backend devuelve el array directamente", async () => {
    const categories = [
      {
        categoryId: "cat-2",
        slug: "aceites",
        name: "Aceites",
      },
    ] satisfies StorefrontCategory[];

    requestStorefrontApiMock.mockResolvedValueOnce(categories);

    await expect(getCategories("bym.example.com")).resolves.toEqual(categories);
  });
});
