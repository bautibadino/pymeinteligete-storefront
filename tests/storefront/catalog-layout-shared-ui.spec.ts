import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CatalogLayoutInfiniteScroll } from "@/components/templates/catalog-layout/catalog-layout-infinite-scroll";
import { CatalogLayoutPaginatedClassic } from "@/components/templates/catalog-layout/catalog-layout-paginated-classic";
import {
  CatalogToolbar,
  FilterSidebar,
} from "@/components/templates/catalog-layout/catalog-layout-shared";
import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";
import type { ProductCardData } from "@/lib/templates/product-card-catalog";

const navigationState = vi.hoisted(() => ({
  pathname: "/catalogo",
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useSearchParams: () => navigationState.searchParams,
}));

vi.mock("@/lib/templates/product-card-registry", () => ({
  resolveProductCardTemplate: () =>
    function MockProductCard({ product }: { product: ProductCardData }) {
      return createElement(
        "article",
        { "data-product-id": product.id },
        product.name,
      );
    },
}));

function renderHtml(element: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(element).replaceAll("&amp;", "&");
}

function setCurrentUrl(pathname: string, search: string) {
  navigationState.pathname = pathname;
  navigationState.searchParams = new URLSearchParams(search);
}

function createProducts(count: number): ProductCardData[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `prod-${index + 1}`,
    name: `Producto ${index + 1}`,
    slug: `producto-${index + 1}`,
    href: `/producto-${index + 1}`,
    price: {
      amount: 1000 + index,
      currency: "ARS",
      formatted: `$${1000 + index}`,
    },
  }));
}

function createModule(
  overrides: Partial<CatalogLayoutModule["content"]>,
  products = createProducts(12),
): CatalogLayoutModule {
  return {
    id: "catalog-layout-1",
    type: "catalogLayout",
    variant: "paginated-classic",
    content: {
      cardVariant: "classic",
      ...overrides,
    },
    products,
  };
}

describe("catalog layout shared layer", () => {
  it("expone links de orden coherentes con la query actual cuando el módulo configura sort", () => {
    setCurrentUrl("/catalogo", "brand=Acme&search=bujias&page=3&sort=priceDesc");

    const html = renderHtml(
      createElement(CatalogToolbar, {
        count: 12,
        sortOptions: ["relevance", "priceAsc", "priceDesc", "newest"],
        defaultSort: "relevance",
      }),
    );

    expect(html).toContain('href="/catalogo?brand=Acme&search=bujias&sort=priceAsc"');
    expect(html).toContain('href="/catalogo?brand=Acme&search=bujias&sort=priceDesc"');
    expect(html).toContain('aria-current="true">Mayor precio<');
    expect(html).toContain('href="/catalogo?brand=Acme&search=bujias"');
  });

  it("refleja parámetros públicos activos en filtros en lugar de placeholders decorativos", () => {
    setCurrentUrl(
      "/catalogo",
      "brand=Michelin&minPrice=1000&maxPrice=5000&availability=inmediata",
    );

    const html = renderHtml(
      createElement(FilterSidebar, {
        activeFilters: {
          brand: true,
          priceRange: true,
          availability: true,
          rating: true,
        },
      }),
    );

    expect(html).toContain("Michelin");
    expect(html).toContain("1000");
    expect(html).toContain("5000");
    expect(html).toContain("Inmediata");
    expect(html).toContain('href="/catalogo?minPrice=1000&maxPrice=5000&availability=inmediata"');
    expect(html).not.toContain("Opción A");
  });

  it("usa la página pública actual para construir la navegación del paginado clásico", () => {
    setCurrentUrl("/catalogo", "brand=Acme&page=3&pageSize=12&sort=priceAsc");

    const html = renderHtml(
      createElement(CatalogLayoutPaginatedClassic, {
        module: createModule(
          {
            perPage: 12,
            sort: {
              options: ["relevance", "priceAsc", "priceDesc"],
              default: "relevance",
            },
            filters: {
              brand: true,
            },
          },
          createProducts(12),
        ),
      }),
    );

    expect(html).toContain('aria-current="page">3<');
    expect(html).toContain('href="/catalogo?brand=Acme&page=2&pageSize=12&sort=priceAsc"');
    expect(html).toContain('href="/catalogo?brand=Acme&page=4&pageSize=12&sort=priceAsc"');
    expect(html).not.toContain('aria-current="page">1<');
  });

  it("usa query pública para el estado y el siguiente paso del layout infinite scroll", () => {
    setCurrentUrl("/catalogo", "search=filtro&page=2&pageSize=24");

    const html = renderHtml(
      createElement(CatalogLayoutInfiniteScroll, {
        module: {
          ...createModule(
            {
              perPage: 24,
            },
            createProducts(20),
          ),
          variant: "infinite-scroll",
        },
      }),
    );

    expect(html).toContain("Página 2");
    expect(html).toContain("20 productos visibles");
    expect(html).toContain('href="/catalogo?search=filtro&page=3&pageSize=24"');
  });
});
