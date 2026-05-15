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
  readCachedStorefrontGetMock: vi.fn(
    (_: string, __: string, ___: unknown, ____: unknown, fetcher: () => unknown) => fetcher(),
  ),
}));

vi.mock("@/lib/fetchers/cache", () => ({
  buildStorefrontGetNextOptions: buildStorefrontGetNextOptionsMock,
  readCachedStorefrontGet: readCachedStorefrontGetMock,
}));

const requestStorefrontApiMock = vi.mocked(requestStorefrontApi);

describe("getCatalog", () => {
  beforeEach(() => {
    delete process.env.STOREFRONT_CATALOG_SOURCE;
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

    expect(buildStorefrontGetNextOptionsMock).toHaveBeenCalledWith(
      "catalog:v2:index-sync-v3",
      "bym.example.com",
      {
        _sv: "pricing-2026-05-15",
        brand: "Pirelli",
        search: "scorpion",
      },
      undefined,
    );
    expect(readCachedStorefrontGetMock).toHaveBeenCalledWith(
      "catalog:v2:index-sync-v3",
      "bym.example.com",
      {
        _sv: "pricing-2026-05-15",
        brand: "Pirelli",
        search: "scorpion",
      },
      undefined,
      expect.any(Function),
    );
    expect(requestStorefrontApiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/storefront/v2/catalog/search",
        query: { _sv: "pricing-2026-05-15", brand: "Pirelli", search: "scorpion" },
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
        path: "/api/storefront/v2/catalog/search",
      }),
    );
  });

  it("corta el namespace de cache de v2 para invalidar snapshots stale del catálogo", async () => {
    requestStorefrontApiMock.mockResolvedValueOnce({
      products: [],
      pagination: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    await getCatalog("bym.example.com");

    expect(buildStorefrontGetNextOptionsMock).toHaveBeenCalledWith(
      "catalog:v2:index-sync-v3",
      "bym.example.com",
      { _sv: "pricing-2026-05-15" },
      undefined,
    );
    expect(readCachedStorefrontGetMock).toHaveBeenCalledWith(
      "catalog:v2:index-sync-v3",
      "bym.example.com",
      { _sv: "pricing-2026-05-15" },
      undefined,
      expect.any(Function),
    );
  });

  it("conserva v1 cuando el caller lo pide explícitamente", async () => {
    requestStorefrontApiMock.mockResolvedValueOnce({
      products: [],
      pagination: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    await getCatalog("bym.example.com", { categoryId: "cat-neu" }, { origin: "catalog-page", source: "v1" });

    expect(buildStorefrontGetNextOptionsMock).toHaveBeenCalledWith(
      "catalog:v1",
      "bym.example.com",
      { categoryId: "cat-neu" },
      undefined,
    );
    expect(readCachedStorefrontGetMock).toHaveBeenCalledWith(
      "catalog:v1",
      "bym.example.com",
      { categoryId: "cat-neu" },
      undefined,
      expect.any(Function),
    );
    expect(requestStorefrontApiMock).toHaveBeenCalledOnce();
    expect(requestStorefrontApiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/api/storefront/v1/catalog",
        headers: { "x-storefront-origin": "catalog-page" },
      }),
    );
  });
});
