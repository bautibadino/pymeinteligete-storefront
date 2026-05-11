import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CatalogLayoutInfiniteScroll } from "@/components/templates/catalog-layout/catalog-layout-infinite-scroll";
import { CatalogLayoutPaginatedClassic } from "@/components/templates/catalog-layout/catalog-layout-paginated-classic";
import { ProductCardPremiumCommerce } from "@/components/templates/product-card/product-card-premium-commerce";
import {
  CatalogPagination,
  FilterBar,
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

  it("mantiene el sidebar de filtros colapsado hasta desktop real", () => {
    setCurrentUrl("/catalogo", "brand=Michelin");

    const html = renderHtml(
      createElement(FilterSidebar, {
        activeFilters: {
          brand: true,
          category: true,
        },
        categories: createCategories(),
        products: [
          {
            ...createProducts(1)[0]!,
            brand: "Michelin",
          },
        ],
      }),
    );

    expect(html).toContain("lg:hidden");
    expect(html).toContain("hidden lg:block");
    expect(html).not.toContain("md:hidden");
    expect(html).not.toContain("hidden md:block");
  });

  it("usa drawer también para la barra de filtros top en mobile y tablet", () => {
    setCurrentUrl("/catalogo", "brand=Michelin");

    const html = renderHtml(
      createElement(FilterBar, {
        activeFilters: {
          brand: true,
          category: true,
        },
        categories: createCategories(),
        products: [
          {
            ...createProducts(1)[0]!,
            brand: "Michelin",
          },
        ],
      }),
    );

    expect(html).toContain("bg-[#131416]");
    expect(html).toContain("lg:hidden");
    expect(html).toContain("hidden lg:block");
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

  it("arma opciones de marca desde facets globales aunque la página actual no tenga esas marcas", () => {
    const activeCategoryId = createCategories()[0]?.children?.[0]?.categoryId ?? "category";
    setCurrentUrl("/catalogo", `categoryId=${activeCategoryId}&brand=brand-pirelli&page=2&sort=priceAsc`);
    const product = createProducts(1)[0]!;

    const html = renderHtml(
      createElement(FilterSidebar, {
        activeFilters: {
          brand: true,
        },
        products: [
          {
            ...product,
            brand: "Michelin",
          },
        ],
        facets: {
          brands: [
            { id: "brand-pirelli", name: "Pirelli", slug: "pirelli", imageUrl: "https://cdn.example.com/pirelli.svg" },
            { id: "brand-shell", name: "Shell", slug: "shell" },
          ],
        },
      }),
    );

    expect(html).toContain("Pirelli");
    expect(html).toContain("Shell");
    expect(html).toContain('src="https://cdn.example.com/pirelli.svg"');
    expect(html).not.toContain("Michelin");
    expect(html).toContain('aria-current="true"');
    expect(html).toContain(`href="/catalogo?categoryId=${activeCategoryId}&brand=Shell&sort=priceAsc"`);
    expect(html).toContain("<span>Pirelli</span>");
    expect(html).not.toContain(">brand-pirelli<");
  });

  it("resuelve el label de categoría activa desde facets cuando no hay árbol de categorías local", () => {
    const activeCategoryId = ["cat", "lubricantes", "facet"].join("-");
    setCurrentUrl("/catalogo", `categoryId=${activeCategoryId}`);

    const html = renderHtml(
      createElement(FilterSidebar, {
        activeFilters: {
          category: true,
        },
        facets: {
          categories: [
            {
              categoryId: activeCategoryId,
              slug: "lubricantes",
              label: "Lubricantes",
            },
          ],
        },
      }),
    );

    expect(html).toContain("Categoría");
    expect(html).toContain("<span>Lubricantes</span>");
    expect(html).not.toContain(activeCategoryId);
  });

  it("muestra paginación visible con total de páginas y preserva filtros al navegar", () => {
    const activeCategoryId = createCategories()[0]?.children?.[0]?.categoryId ?? "category";
    setCurrentUrl("/catalogo", `brand=Shell&categoryId=${activeCategoryId}&page=2&pageSize=24&sort=priceAsc`);

    const html = renderHtml(
      createElement(CatalogPagination, {
        pagination: {
          page: 2,
          pageSize: 24,
          total: 97,
          totalPages: 5,
        },
      }),
    );

    expect(html).toContain("Página 2 de 5");
    expect(html).toContain("97 productos");
    expect(html).toContain("Anterior");
    expect(html).toContain("Siguiente");
    expect(html).toContain(`href="/catalogo?brand=Shell&categoryId=${activeCategoryId}&page=1&pageSize=24&sort=priceAsc"`);
    expect(html).toContain(`href="/catalogo?brand=Shell&categoryId=${activeCategoryId}&page=3&pageSize=24&sort=priceAsc"`);
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
