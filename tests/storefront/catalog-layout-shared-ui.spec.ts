import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CatalogLayoutInfiniteScroll } from "@/components/templates/catalog-layout/catalog-layout-infinite-scroll";
import { CatalogLayoutPaginatedClassic } from "@/components/templates/catalog-layout/catalog-layout-paginated-classic";
import { ProductCardPremiumCommerce } from "@/components/templates/product-card/product-card-premium-commerce";
import {
  CatalogToolbar,
  FilterSidebar,
} from "@/components/templates/catalog-layout/catalog-layout-shared";
import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";
import type { StorefrontCategory } from "@/lib/storefront-api";
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

function createCategories(): StorefrontCategory[] {
  return [
    {
      categoryId: "cat-neumaticos",
      slug: "neumaticos",
      name: "Neumáticos",
      children: [
        {
          categoryId: "cat-auto",
          slug: "auto",
          name: "Auto",
        },
      ],
    },
    {
      categoryId: "cat-baterias",
      slug: "baterias",
      name: "Baterías",
    },
  ];
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
    expect(html).toContain('aria-current="true"');
    expect(html).toContain(">Mayor precio<");
    expect(html).toContain('href="/catalogo?brand=Acme&search=bujias"');
  });

  it("refleja parámetros públicos activos en filtros en lugar de placeholders decorativos", () => {
    setCurrentUrl(
      "/catalogo",
      "search=aceite&brand=Michelin&minPrice=1000&maxPrice=5000&availability=inmediata",
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

    expect(html).toContain("Búsqueda");
    expect(html).toContain("aceite");
    expect(html).toContain("Michelin");
    expect(html).toContain("1000");
    expect(html).toContain("5000");
    expect(html).toContain("Inmediata");
    expect(html).toContain('href="/catalogo?search=aceite&minPrice=1000&maxPrice=5000&availability=inmediata"');
    expect(html).not.toContain("Opción A");
  });

  it("expone opciones de filtros descubribles cuando hay categorías y productos públicos", () => {
    setCurrentUrl("/catalogo", "");
    const baseProduct = createProducts(1)[0]!;

    const html = renderHtml(
      createElement(FilterSidebar, {
        activeFilters: {
          brand: true,
          category: true,
          priceRange: true,
          availability: true,
        },
        categories: createCategories(),
        products: [
          {
            ...baseProduct,
            brand: "Michelin",
            price: { amount: 92000, currency: "ARS", formatted: "$92.000" },
          },
          {
            ...baseProduct,
            id: "prod-2",
            name: "Producto 2",
            slug: "prod-2",
            href: "/prod-2",
            brand: "Pirelli",
            brandLogoUrl: "https://cdn.example.com/brands/pirelli.webp",
            price: { amount: 152000, currency: "ARS", formatted: "$152.000" },
          },
        ],
      }),
    );

    expect(html).toContain("Neumáticos");
    expect(html).toContain("Auto");
    expect(html).toContain("Michelin");
    expect(html).toContain("Pirelli");
    expect(html).toContain('src="https://cdn.example.com/brands/pirelli.webp"');
    expect(html).toContain('alt=""');
    expect(html).toContain("Entrega inmediata");
    expect(html).toContain("Buscar categoría...");
    expect(html).not.toContain("No hay filtros activos.");
  });

  it("muestra camioncito en badges de envío gratis de las cards comerciales", () => {
    const product = createProducts(1)[0]!;
    const html = renderHtml(
      createElement(ProductCardPremiumCommerce, {
        product: {
          ...product,
          badges: [{ label: "Envío gratis", tone: "success" }],
        },
        displayOptions: {
          showAddToCart: false,
          showBadges: true,
        },
      }),
    );

    expect(html).toContain("Envío gratis");
    expect(html).toContain('data-badge-icon="shipping"');
  });

  it("muestra el nombre de la categoría seleccionada en filtros aplicados cuando la query usa categoryId", () => {
    setCurrentUrl("/catalogo", "categoryId=cat-auto");

    const html = renderHtml(
      createElement(FilterSidebar, {
        activeFilters: {
          category: true,
        },
        categories: createCategories(),
      }),
    );

    expect(html).toContain("Categoría");
    expect(html).toContain('<span>Auto</span>');
    expect(html).not.toContain(">cat-auto<");
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

  it("expone estado de scroll infinito real sin CTA de paginación encubierto", () => {
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

    expect(html).toContain("20 productos visibles");
    expect(html).toContain("Llegaste al final del catálogo.");
    expect(html).not.toContain('href="/catalogo?search=filtro&page=3&pageSize=24"');
  });
});
