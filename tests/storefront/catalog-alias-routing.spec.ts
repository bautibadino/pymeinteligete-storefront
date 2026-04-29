import { describe, expect, it, vi } from "vitest";

const { permanentRedirectMock } = vi.hoisted(() => ({
  permanentRedirectMock: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
}));

vi.mock("next/navigation", () => ({
  permanentRedirect: permanentRedirectMock,
}));

import CatalogAliasCategoryPage from "@/app/(storefront)/catalog/[slug]/page";
import CatalogAliasPage from "@/app/(storefront)/catalog/page";
import { buildCatalogAliasRedirectHref } from "@/app/(storefront)/catalog/_lib/catalog-alias";

describe("catalog alias routing", () => {
  it("normaliza /catalog a /catalogo preservando query pública", async () => {
    await expect(
      CatalogAliasPage({
        searchParams: Promise.resolve({
          search: "cubierta 17",
          page: "2",
          brand: ["Pirelli", "Fate"],
        }),
      }),
    ).rejects.toThrow(
      "redirect:/catalogo?search=cubierta+17&page=2&brand=Pirelli&brand=Fate",
    );

    expect(permanentRedirectMock).toHaveBeenCalledWith(
      "/catalogo?search=cubierta+17&page=2&brand=Pirelli&brand=Fate",
    );
  });

  it("normaliza /catalog/[slug] a /catalogo/[slug] preservando filtros", async () => {
    await expect(
      CatalogAliasCategoryPage({
        params: Promise.resolve({ slug: "neumaticos" }),
        searchParams: Promise.resolve({
          onlyImmediate: "true",
          sort: "priceAsc",
        }),
      }),
    ).rejects.toThrow(
      "redirect:/catalogo/neumaticos?onlyImmediate=true&sort=priceAsc",
    );

    expect(permanentRedirectMock).toHaveBeenCalledWith(
      "/catalogo/neumaticos?onlyImmediate=true&sort=priceAsc",
    );
  });

  it("construye href limpio cuando no hay query string", () => {
    expect(buildCatalogAliasRedirectHref("/catalogo", {})).toBe("/catalogo");
  });
});
