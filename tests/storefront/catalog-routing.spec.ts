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
      onlyImmediate: true,
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
      },
      CATEGORIES,
    );

    expect(result.query).toEqual({
      page: 3,
      sortBy: "price",
      sortOrder: "asc",
      categoryId: "cat-neu",
      onlyImmediate: true,
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
