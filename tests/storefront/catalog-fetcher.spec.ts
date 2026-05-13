import { beforeEach, describe, expect, it, vi } from "vitest";

import { requestStorefrontApi } from "@/lib/api/client";
import { getCatalog } from "@/lib/fetchers/catalog";

vi.mock("@/lib/api/client", () => ({
  requestStorefrontApi: vi.fn(),
}));

vi.mock("@/lib/fetchers/context", () => ({
  resolveStorefrontRequestContext: vi.fn((input: string) => ({
    host: input,
    requestId: "test-request",
    storefrontVersion: "storefront@test",
  })),
}));

const {
  buildStorefrontGetNextOptionsMock,
  readCachedStorefrontGetMock,
} = vi.hoisted(() => ({
  buildStorefrontGetNextOptionsMock: vi.fn(() => ({ revalidate: 60, tags: ["test"] })),
  readCachedStorefrontGetMock: vi.fn((_: string, __: string, ___: unknown, fetcher: () => unknown) => fetcher()),
}));

vi.mock("@/lib/fetchers/cache", () => ({
  buildStorefrontGetNextOptions: buildStorefrontGetNextOptionsMock,
  readCachedStorefrontGet: readCachedStorefrontGetMock,
}));

const requestStorefrontApiMock = vi.mocked(requestStorefrontApi);

describe("getCatalog", () => {
  beforeEach(() => {
    requestStorefrontApiMock.mockReset();
    buildStorefrontGetNextOptionsMock.mockClear();
    readCachedStorefrontGetMock.mockClear();
  });

  it("normaliza la query para evitar redirects canonicos y fragmentacion de cache", async () => {
    requestStorefrontApiMock.mockResolvedValueOnce({
      products: [],
      pagination: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    await getCatalog("bym.example.com", {
      page: 1,
      pageSize: 24,
      sortBy: "name",
      sortOrder: "asc",
      brand: "  Pirelli  ",
      search: "  scorpion  ",
    });

    expect(buildStorefrontGetNextOptionsMock).toHaveBeenCalledWith("catalog", "bym.example.com", {
      brand: "Pirelli",
      search: "scorpion",
    });
    expect(readCachedStorefrontGetMock).toHaveBeenCalledWith(
      "catalog",
      "bym.example.com",
      { brand: "Pirelli", search: "scorpion" },
      expect.any(Function),
    );
    expect(requestStorefrontApiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { brand: "Pirelli", search: "scorpion" },
      }),
    );
  });

  it("propaga el origen instrumentado para identificar al caller real", async () => {
    requestStorefrontApiMock.mockResolvedValueOnce({
      products: [],
      pagination: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    await getCatalog("bym.example.com", undefined, { origin: "home" });

    expect(requestStorefrontApiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { "x-storefront-origin": "home" },
      }),
    );
  });
});
