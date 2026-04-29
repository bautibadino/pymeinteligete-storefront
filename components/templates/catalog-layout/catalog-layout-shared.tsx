"use client";

import type { ReadonlyURLSearchParams } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";

import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";
import type { ProductCardData, ProductCardDisplayOptions } from "@/lib/templates/product-card-catalog";

/**
 * Opciones de ordenamiento disponibles.
 */
export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "relevance", label: "Relevancia" },
  { value: "priceAsc", label: "Menor precio" },
  { value: "priceDesc", label: "Mayor precio" },
  { value: "newest", label: "Más nuevos" },
  { value: "popular", label: "Más populares" },
];

/**
 * Etiquetas para filtros configurados.
 */
export const FILTER_LABELS: Record<string, string> = {
  brand: "Marca",
  priceRange: "Precio",
  category: "Categoría",
  availability: "Disponibilidad",
  rating: "Valoración",
};

const PUBLIC_SORT_QUERY_MAP: Partial<
  Record<string, { sort?: string; sortBy?: string; sortOrder?: string }>
> = {
  priceAsc: { sort: "priceAsc" },
  priceDesc: { sort: "priceDesc" },
  newest: { sort: "newest" },
  relevance: {},
};

type ResolvedFilter = {
  href: string;
  key: string;
  label: string;
  value: string;
};

function parsePositiveInteger(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function createSearchParams(searchParams: URLSearchParams | ReadonlyURLSearchParams) {
  return new URLSearchParams(searchParams.toString());
}

function buildHref(
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  updates: Record<string, string | number | undefined>,
): string {
  const nextSearchParams = createSearchParams(searchParams);

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") {
      nextSearchParams.delete(key);
      continue;
    }

    nextSearchParams.set(key, String(value));
  }

  const query = nextSearchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function normalizeAvailabilityLabel(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (["immediate", "inmediata", "inmediato", "onlyimmediate"].includes(normalized)) {
    return "Inmediata";
  }

  if (["true", "1", "si", "yes", "on"].includes(normalized)) {
    return "Sí";
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return "No";
  }

  return value;
}

function resolveCurrentSortValue(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  availableOptions: string[],
  fallbackSort: string,
): string {
  const rawLegacySort = searchParams.get("sort");
  if (rawLegacySort && availableOptions.includes(rawLegacySort)) {
    return rawLegacySort;
  }

  const rawSortBy = searchParams.get("sortBy");
  const rawSortOrder = searchParams.get("sortOrder");

  if (rawSortBy === "price" && rawSortOrder === "desc" && availableOptions.includes("priceDesc")) {
    return "priceDesc";
  }

  if (rawSortBy === "price" && availableOptions.includes("priceAsc")) {
    return "priceAsc";
  }

  if (rawSortBy === "createdAt" && rawSortOrder === "desc" && availableOptions.includes("newest")) {
    return "newest";
  }

  return fallbackSort;
}

function buildSortHref(
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  sortValue: string,
): string | undefined {
  if (sortValue !== "relevance" && !PUBLIC_SORT_QUERY_MAP[sortValue]) {
    return undefined;
  }

  const updates: Record<string, string | undefined> = {
    page: undefined,
    sort: undefined,
    sortBy: undefined,
    sortOrder: undefined,
  };
  const query = PUBLIC_SORT_QUERY_MAP[sortValue];

  if (query?.sort) {
    updates.sort = query.sort;
  }

  if (query?.sortBy) {
    updates.sortBy = query.sortBy;
  }

  if (query?.sortOrder) {
    updates.sortOrder = query.sortOrder;
  }

  return buildHref(pathname, searchParams, updates);
}

function resolveFilterValue(
  key: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): { clearKeys: string[]; value: string } | null {
  switch (key) {
    case "brand": {
      const brand = searchParams.get("brand");
      return brand ? { value: brand, clearKeys: ["brand", "page"] } : null;
    }

    case "priceRange": {
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      if (!minPrice && !maxPrice) {
        return null;
      }

      if (minPrice && maxPrice) {
        return { value: `${minPrice} - ${maxPrice}`, clearKeys: ["minPrice", "maxPrice", "page"] };
      }

      if (minPrice) {
        return { value: `Desde ${minPrice}`, clearKeys: ["minPrice", "maxPrice", "page"] };
      }

      return { value: `Hasta ${maxPrice}`, clearKeys: ["minPrice", "maxPrice", "page"] };
    }

    case "category": {
      const category = searchParams.get("category") ?? searchParams.get("categoryId");
      return category
        ? { value: category, clearKeys: ["category", "categoryId", "page"] }
        : null;
    }

    case "availability": {
      const availability = searchParams.get("availability");
      const onlyImmediate = searchParams.get("onlyImmediate");
      const rawValue = availability ?? onlyImmediate;

      return rawValue
        ? {
            value: normalizeAvailabilityLabel(rawValue),
            clearKeys: ["availability", "onlyImmediate", "page"],
          }
        : null;
    }

    case "rating": {
      const rating = searchParams.get("rating");
      return rating ? { value: rating, clearKeys: ["rating", "page"] } : null;
    }

    default:
      return null;
  }
}

function resolveConfiguredFilters(
  activeFilters: Record<string, boolean | undefined> | undefined,
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): ResolvedFilter[] {
  if (!activeFilters) {
    return [];
  }

  return Object.entries(activeFilters)
    .filter(([, enabled]) => enabled === true)
    .flatMap(([key]) => {
      const filterValue = resolveFilterValue(key, searchParams);
      if (!filterValue) {
        return [];
      }

      const updates = Object.fromEntries(
        filterValue.clearKeys.map((clearKey) => [clearKey, undefined]),
      ) as Record<string, undefined>;

      return [
        {
          key,
          label: FILTER_LABELS[key] ?? key,
          value: filterValue.value,
          href: buildHref(pathname, searchParams, updates),
        },
      ];
    });
}

function resolvePageSize(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  fallbackPageSize: number | undefined,
): number {
  return parsePositiveInteger(searchParams.get("pageSize")) ?? fallbackPageSize ?? 12;
}

function buildPageHref(
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  page: number,
  pageSize: number,
): string {
  return buildHref(pathname, searchParams, {
    page,
    pageSize,
  });
}

/**
 * Renderiza el estado vacío del catálogo.
 */
export function EmptyCatalogState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          No se encontraron productos
        </h3>
        <p className="max-w-xs text-sm text-muted">
          Probá ajustando los filtros o volvé a revisar más tarde.
        </p>
      </div>
    </div>
  );
}

/**
 * Barra de controles compartida: resultados + ordenamiento.
 */
export function CatalogToolbar({
  count,
  sortOptions,
  defaultSort,
}: {
  count: number;
  sortOptions?: string[] | undefined;
  defaultSort?: string | undefined;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const options = sortOptions?.length
    ? SORT_OPTIONS.filter((o) => sortOptions.includes(o.value))
    : SORT_OPTIONS;

  const fallbackSort = defaultSort && options.some((o) => o.value === defaultSort)
    ? defaultSort
    : options[0]?.value ?? "relevance";
  const selected = resolveCurrentSortValue(
    searchParams,
    options.map((option) => option.value),
    fallbackSort,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">{count}</span> resultados
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">
          Ordenar por
        </span>
        <nav aria-label="Ordenar catálogo" className="flex flex-wrap items-center gap-2">
          {options.map((opt) => {
            const href = buildSortHref(pathname, searchParams, opt.value);

            return href ? (
              <a
                key={opt.value}
                href={href}
                className={
                  opt.value === selected
                    ? "inline-flex items-center rounded-pill bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                    : "inline-flex items-center rounded-pill border border-line bg-panel px-3 py-1.5 text-sm text-foreground transition hover:bg-panel-strong"
                }
                aria-current={opt.value === selected ? "true" : undefined}
              >
                {opt.label}
              </a>
            ) : (
              <span
                key={opt.value}
                className="inline-flex items-center rounded-pill border border-dashed border-line px-3 py-1.5 text-sm text-muted"
              >
                {opt.label}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/**
 * Lista de filtros configurados.
 */
export function FilterSidebar({
  activeFilters,
}: {
  activeFilters?: Record<string, boolean | undefined> | undefined;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const filters = resolveConfiguredFilters(activeFilters, pathname, searchParams);

  if (filters.length === 0) {
    return (
      <aside className="space-y-6 rounded-xl border border-line bg-panel p-5">
        <h3 className="font-heading text-base font-semibold text-foreground">Filtros</h3>
        <p className="text-sm text-muted">No hay filtros activos.</p>
      </aside>
    );
  }

  return (
    <aside className="space-y-6 rounded-xl border border-line bg-panel p-5">
      <h3 className="font-heading text-base font-semibold text-foreground">Filtros</h3>
      {filters.map((filter) => (
        <div key={filter.key} className="rounded-xl border border-line bg-panel-strong p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{filter.label}</p>
              <p className="text-sm text-muted">{filter.value}</p>
            </div>
            <a
              href={filter.href}
              className="text-xs font-medium text-primary transition hover:opacity-80"
            >
              Limpiar
            </a>
          </div>
        </div>
      ))}
    </aside>
  );
}

/**
 * Barra de filtros horizontal (para filters-top / infinite-scroll).
 */
export function FilterBar({
  activeFilters,
}: {
  activeFilters?: Record<string, boolean | undefined> | undefined;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const filters = resolveConfiguredFilters(activeFilters, pathname, searchParams);

  if (filters.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-panel p-4">
        <p className="text-sm text-muted">No hay filtros activos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-line bg-panel p-4">
      {filters.map((filter) => (
        <a
          key={filter.key}
          href={filter.href}
          className="inline-flex items-center rounded-pill bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
        >
          {filter.label}: {filter.value} · Limpiar
        </a>
      ))}
    </div>
  );
}

/**
 * Navegación de paginado basada en query pública.
 */
export function CatalogPagination({ pageSize }: { pageSize?: number | undefined }) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const currentPage = parsePositiveInteger(searchParams.get("page")) ?? 1;
  const resolvedPageSize = resolvePageSize(searchParams, pageSize);
  const previousPageHref =
    currentPage > 1
      ? buildPageHref(pathname, searchParams, currentPage - 1, resolvedPageSize)
      : undefined;
  const nextPageHref = buildPageHref(pathname, searchParams, currentPage + 1, resolvedPageSize);

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3 pt-4">
      {previousPageHref ? (
        <a
          href={previousPageHref}
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-line bg-panel px-3 text-sm text-foreground hover:bg-panel-strong"
          aria-label="Página anterior"
        >
          ‹
        </a>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-line bg-panel px-3 text-sm text-muted opacity-50"
        >
          ‹
        </span>
      )}
      <span
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
        aria-current="page"
      >
        {currentPage}
      </span>
      <a
        href={nextPageHref}
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-line bg-panel px-3 text-sm text-foreground hover:bg-panel-strong"
        aria-label="Página siguiente"
      >
        ›
      </a>
    </nav>
  );
}

/**
 * Estado mínimo para avanzar en layouts de scroll progresivo.
 */
export function CatalogInfiniteNavigation({
  pageSize,
  renderedCount,
}: {
  pageSize?: number | undefined;
  renderedCount: number;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const currentPage = parsePositiveInteger(searchParams.get("page")) ?? 1;
  const resolvedPageSize = resolvePageSize(searchParams, pageSize);
  const nextPageHref = buildPageHref(pathname, searchParams, currentPage + 1, resolvedPageSize);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <p className="text-sm text-muted">
        Página {currentPage} · {renderedCount} productos visibles
      </p>
      <a
        href={nextPageHref}
        className="inline-flex items-center rounded-pill border border-line bg-panel px-4 py-2 text-sm font-medium text-foreground transition hover:bg-panel-strong"
      >
        Cargar página {currentPage + 1}
      </a>
    </div>
  );
}

/**
 * Grilla de productos compartida.
 */
export function ProductGrid({
  products,
  cardVariant,
  cardDisplayOptions,
  columns = 3,
}: {
  products: ProductCardData[];
  cardVariant: string;
  cardDisplayOptions?: ProductCardDisplayOptions | undefined;
  columns?: 2 | 3 | 4;
}) {
  const gridCols =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {products.map((product) => {
        const ProductCard = resolveProductCardTemplate(cardVariant);
        return (
          <ProductCard
            key={product.id}
            product={product}
            {...(cardDisplayOptions ? { displayOptions: cardDisplayOptions } : {})}
          />
        );
      })}
    </div>
  );
}
