import { describe, expect, it } from "vitest";

import {
  buildCategoryCatalogHref,
  parseCatalogSearchParams,
} from "@/lib/presentation/catalog-routing";
import type { StorefrontCategory } from "@/lib/storefront-api";

const CATEGORIES: StorefrontCategory[] = [
  {
    categoryId: "cat-neu",
    slug: "neumaticos",
    name: "Neumáticos",
  },
  {
    categoryId: "cat-ace",
    slug: "aceites",
    name: "Aceites",
  },
];

describe("catalog routing", () => {
  it("mapea search params públicos al contrato storefront/v1", () => {
    const result = parseCatalogSearchParams(
      {
        page: "2",
        pageSize: "24",
        search: "cubierta",
        sortBy: "price",
        sortOrder: "desc",
        categoryId: "cat-neu",
        brand: "Pirelli",
        onlyImmediate: "true",
        minPrice: "100000",
        maxPrice: "200000",
      },
      CATEGORIES,
    );

    expect(result.query).toEqual({
      page: 2,
      pageSize: 24,
      search: "cubierta",
      sortBy: "price",
      sortOrder: "desc",
      categoryId: "cat-neu",
      brand: "Pirelli",
    });
    expect(result.selectedCategory).toMatchObject({
      categoryId: "cat-neu",
      slug: "neumaticos",
    });
    expect(result.pathname).toBe("/catalogo/neumaticos");
  });

  it("mantiene compatibilidad con aliases legacy pero normaliza al contrato real", () => {
    const result = parseCatalogSearchParams(
      {
        page: "3",
        sort: "priceAsc",
        category: "neumaticos",
        availability: "inmediata",
        maxPrice: "198638",
      },
      CATEGORIES,
    );

    expect(result.query).toEqual({
      page: 3,
      sortBy: "price",
      sortOrder: "asc",
      categoryId: "cat-neu",
    });
    expect(result.selectedCategory?.categoryId).toBe("cat-neu");
    expect(result.pathname).toBe("/catalogo/neumaticos");
  });

  it("prioriza la categoría resuelta por slug de ruta por encima del query", () => {
    const result = parseCatalogSearchParams(
      {
        categoryId: "cat-ace",
        sort: "newest",
      },
      CATEGORIES,
      "neumaticos",
    );

    expect(result.query).toEqual({
      sortBy: "createdAt",
      sortOrder: "desc",
      categoryId: "cat-neu",
    });
    expect(result.selectedCategory).toMatchObject({
      categoryId: "cat-neu",
      slug: "neumaticos",
    });
    expect(result.pathname).toBe("/catalogo/neumaticos");
  });

  it("ignora filtros públicos de precio y disponibilidad para evitar cardinalidad SSR", () => {
    const result = parseCatalogSearchParams(
      {
        categoryId: "cat-neu",
        minPrice: "150000",
        maxPrice: "198638",
        onlyImmediate: "true",
        availability: "inmediata",
      },
      CATEGORIES,
    );

    expect(result.query).toEqual({
      categoryId: "cat-neu",
    });
  });

  it("construye href indexable por slug cuando la categoría lo permite", () => {
    expect(
      buildCategoryCatalogHref({
        categoryId: "cat-neu",
        slug: "neumaticos",
      }),
    ).toBe("/catalogo/neumaticos");
  });

  it("cae al query categoryId solo cuando no existe slug público", () => {
    expect(
      buildCategoryCatalogHref({
        categoryId: "cat-neu",
        slug: "",
      }),
    ).toBe("/catalogo?categoryId=cat-neu");
  });
});
