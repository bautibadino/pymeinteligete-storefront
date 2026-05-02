"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { Route } from "next";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import type { CatalogLayoutDensity } from "@/lib/modules/catalog-layout";
import type { StorefrontCategory } from "@/lib/storefront-api";
import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";
import type { ProductCardData, ProductCardDisplayOptions } from "@/lib/templates/product-card-catalog";
import { cn } from "@/lib/utils/cn";

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

type FilterOption = {
  active: boolean;
  href: string;
  id: string;
  label: string;
};

type FilterGroup = {
  categoryTree?: CategoryTreeOption[];
  key: string;
  options: FilterOption[];
  title: string;
};

type CategoryTreeOption = {
  active: boolean;
  children: CategoryTreeOption[];
  href: string;
  id: string;
  label: string;
  slug: string;
};

const FILTER_CHIP_ACTIVE_CLASSNAME =
  "inline-flex min-h-8 items-center rounded-full border border-transparent bg-[color:var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--action-contrast)] transition hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-raised)]";

const FILTER_CHIP_IDLE_CLASSNAME =
  "inline-flex min-h-8 items-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-raised)]";

const FILTER_SUMMARY_CLASSNAME =
  "flex w-full items-center justify-between gap-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--paper)]/88 px-2.5 py-2 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-muted)]";

function resolveCatalogDensity(density?: CatalogLayoutDensity): CatalogLayoutDensity {
  return density === "comfortable" ? "comfortable" : "compact";
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildClearAllFiltersHref(
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
) {
  return buildHref(pathname, searchParams, {
    availability: undefined,
    brand: undefined,
    category: undefined,
    categoryId: undefined,
    maxPrice: undefined,
    minPrice: undefined,
    onlyImmediate: undefined,
    page: undefined,
    rating: undefined,
  });
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function resolvePriceRangeOptions(products: ProductCardData[]): Array<{
  label: string;
  maxPrice?: number;
  minPrice?: number;
}> {
  const amounts = [...new Set(products.map((product) => Math.round(product.price.amount)))]
    .filter((amount) => Number.isFinite(amount) && amount > 0)
    .sort((left, right) => left - right);

  if (amounts.length === 0) {
    return [];
  }

  const min = amounts[0];
  const max = amounts[amounts.length - 1];

  if (min === undefined || max === undefined) {
    return [];
  }

  if (min === max) {
    return [{ maxPrice: max, label: `Hasta ${formatPrice(max)}` }];
  }

  const step = Math.max(1, Math.ceil((max - min) / 3));
  const lowerMax = min + step;
  const middleMin = lowerMax + 1;
  const middleMax = Math.min(max, middleMin + step);
  const upperMin = middleMax + 1;

  return [
    { maxPrice: lowerMax, label: `Hasta ${formatPrice(lowerMax)}` },
    ...(middleMin <= middleMax
      ? [
          {
            minPrice: middleMin,
            maxPrice: middleMax,
            label: `${formatPrice(middleMin)} a ${formatPrice(middleMax)}`,
          },
        ]
      : []),
    ...(upperMin <= max
      ? [{ minPrice: upperMin, label: `Más de ${formatPrice(upperMin)}` }]
      : []),
  ];
}

function buildCategoryTreeOptions(
  categories: StorefrontCategory[] | undefined,
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  selectedCategoryId: string | null,
  selectedCategorySlug: string | null,
): CategoryTreeOption[] {
  if (!categories || categories.length === 0) {
    return [];
  }

  return categories.map((category) => ({
    active:
      selectedCategoryId === category.categoryId ||
      selectedCategorySlug === category.slug,
    children: buildCategoryTreeOptions(
      category.children,
      pathname,
      searchParams,
      selectedCategoryId,
      selectedCategorySlug,
    ),
    href: buildHref(pathname, searchParams, {
      category: undefined,
      categoryId: category.categoryId,
      page: undefined,
    }),
    id: category.categoryId,
    label: category.name,
    slug: category.slug,
  }));
}

function filterCategoryTree(
  tree: CategoryTreeOption[],
  query: string,
): CategoryTreeOption[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return tree;
  }

  return tree.flatMap((node) => {
    const children = filterCategoryTree(node.children, normalizedQuery);
    const matchesNode = node.label.toLowerCase().includes(normalizedQuery);

    if (!matchesNode && children.length === 0) {
      return [];
    }

    return [{ ...node, children }];
  });
}

function countTreeNodes(nodes: CategoryTreeOption[]): number {
  return nodes.reduce((total, node) => total + 1 + countTreeNodes(node.children), 0);
}

function countGroupOptions(group: FilterGroup): number {
  if (group.key === "category") {
    return countTreeNodes(group.categoryTree ?? []);
  }

  return group.options.length;
}

function resolveFilterGroups(
  activeFilters: Record<string, boolean | undefined> | undefined,
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  products: ProductCardData[],
  categories?: StorefrontCategory[],
): FilterGroup[] {
  if (!activeFilters) {
    return [];
  }

  const groups: FilterGroup[] = [];

  if (activeFilters.category) {
    const selectedCategoryId = searchParams.get("categoryId");
    const selectedCategorySlug = searchParams.get("category");
    const categoryTree = buildCategoryTreeOptions(
      categories,
      pathname,
      searchParams,
      selectedCategoryId,
      selectedCategorySlug,
    );
    const categoryOptions = categoryTree.map((category) => ({
      active: category.active,
      href: category.href,
      id: category.id,
      label: category.label,
    }));

    if (categoryTree.length > 0) {
      groups.push({
        key: "category",
        categoryTree,
        title: "Categorías",
        options: categoryOptions,
      });
    }
  }

  if (activeFilters.brand) {
    const selectedBrand = searchParams.get("brand");
    const brandOptions = [...new Set(products.map((product) => product.brand?.trim()).filter(isNonEmptyString))]
      .sort((left, right) => left.localeCompare(right, "es"))
      .map((brand) => ({
        active: selectedBrand === brand,
        href: buildHref(pathname, searchParams, {
          brand,
          page: undefined,
        }),
        id: brand,
        label: brand,
      }));

    if (brandOptions.length > 0) {
      groups.push({
        key: "brand",
        title: "Marcas",
        options: brandOptions,
      });
    }
  }

  if (activeFilters.priceRange) {
    const selectedMinPrice = searchParams.get("minPrice");
    const selectedMaxPrice = searchParams.get("maxPrice");
    const priceOptions = resolvePriceRangeOptions(products).map((range) => ({
      active:
        selectedMinPrice === (range.minPrice !== undefined ? String(range.minPrice) : null) &&
        selectedMaxPrice === (range.maxPrice !== undefined ? String(range.maxPrice) : null),
      href: buildHref(pathname, searchParams, {
        maxPrice: range.maxPrice,
        minPrice: range.minPrice,
        page: undefined,
      }),
      id: `${range.minPrice ?? "na"}-${range.maxPrice ?? "na"}`,
      label: range.label,
    }));

    if (priceOptions.length > 0) {
      groups.push({
        key: "priceRange",
        title: "Rango de precio",
        options: priceOptions,
      });
    }
  }

  if (activeFilters.availability) {
    const availabilityValue = searchParams.get("availability");
    const onlyImmediate = searchParams.get("onlyImmediate");
    groups.push({
      key: "availability",
      title: "Disponibilidad",
      options: [
        {
          active:
            onlyImmediate === "true" ||
            availabilityValue?.toLowerCase() === "immediate" ||
            availabilityValue?.toLowerCase() === "inmediata",
          href: buildHref(pathname, searchParams, {
            availability: undefined,
            onlyImmediate: "true",
            page: undefined,
          }),
          id: "only-immediate",
          label: "Entrega inmediata",
        },
      ],
    });
  }

  return groups.filter((group) => group.options.length > 0);
}

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
  density,
}: {
  count: number;
  sortOptions?: string[] | undefined;
  defaultSort?: string | undefined;
  density?: CatalogLayoutDensity | undefined;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const resolvedDensity = resolveCatalogDensity(density);
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
    <div
      className={cn(
        "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-raised)] shadow-sm backdrop-blur-sm",
        resolvedDensity === "comfortable" ? "px-4 py-3.5" : "px-3.5 py-3",
      )}
    >
      <div
        className={cn(
          "flex flex-col lg:flex-row lg:items-center lg:justify-between",
          resolvedDensity === "comfortable" ? "gap-3" : "gap-2.5",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {count} resultados
          </span>
          <span className="hidden text-sm text-muted md:inline">Ordená sin salir de la grilla</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Ordenar
          </span>
          <nav aria-label="Ordenar catálogo" className="flex flex-wrap items-center gap-2">
          {options.map((opt) => {
            const href = buildSortHref(pathname, searchParams, opt.value);

            return href ? (
              <Link
                key={opt.value}
                href={href as Route}
                className={
                  opt.value === selected
                    ? FILTER_CHIP_ACTIVE_CLASSNAME
                    : FILTER_CHIP_IDLE_CLASSNAME
                }
                aria-current={opt.value === selected ? "true" : undefined}
              >
                {opt.label}
              </Link>
            ) : (
              <span
                key={opt.value}
                className="inline-flex min-h-9 items-center rounded-full border border-dashed border-line px-3 py-2 text-xs font-medium text-muted"
              >
                {opt.label}
              </span>
            );
          })}
        </nav>
      </div>
      </div>
    </div>
  );
}

function FilterSection({
  group,
}: {
  group: FilterGroup;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          {group.title}
        </h4>
        <span className="text-[10px] font-medium text-muted tabular-nums">
          {countGroupOptions(group)}
        </span>
      </div>
      <FilterGroupContent group={group} />
    </section>
  );
}

function FilterGroupContent({ group }: { group: FilterGroup }) {
  if (group.key === "category") {
    return <CategoryFilterSectionContent group={group} />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {group.options.map((option) => (
        <Link
          key={option.id}
          href={option.href as Route}
          aria-current={option.active ? "true" : undefined}
          className={
            option.active
              ? FILTER_CHIP_ACTIVE_CLASSNAME
              : FILTER_CHIP_IDLE_CLASSNAME
          }
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

function CategoryFilterSectionContent({ group }: { group: FilterGroup }) {
  const [search, setSearch] = useState("");
  const tree = group.categoryTree ?? [];
  const filteredOptions = useMemo(() => {
    return filterCategoryTree(tree, search);
  }, [search, tree]);
  const hasCategories = countTreeNodes(filteredOptions) > 0;

  return (
    <div className="space-y-2">
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar categoría..."
        className="h-8 rounded-md border-[color:var(--line)] bg-[color:var(--surface-raised)] text-sm shadow-none focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-0"
        aria-label="Buscar categoría"
      />

      <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-1.5">
        {hasCategories ? (
          <CategoryTreeList nodes={filteredOptions} />
        ) : (
          <p className="px-2.5 py-2 text-sm text-muted">No encontramos categorías para esa búsqueda.</p>
        )}
      </div>
    </div>
  );
}

function CategoryTreeList({
  depth = 0,
  nodes,
}: {
  depth?: number;
  nodes: CategoryTreeOption[];
}) {
  return (
    <ul className={cn("space-y-1", depth > 0 ? "mt-1 border-l border-[color:var(--line)]/80 pl-3" : "")}>
      {nodes.map((node) => (
        <li key={node.id} className="space-y-1">
          <Link
            href={node.href as Route}
            aria-current={node.active ? "true" : undefined}
            className={
              node.active
                ? "flex items-center rounded-md bg-[color:var(--accent)] px-2.5 py-1.5 text-sm font-semibold text-[color:var(--action-contrast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-muted)]"
                : "flex items-center rounded-md px-2.5 py-1.5 text-sm text-foreground transition hover:bg-[color:var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-muted)]"
            }
          >
            {node.label}
          </Link>
          {node.children.length > 0 ? (
            <CategoryTreeList depth={depth + 1} nodes={node.children} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function FilterPanelWrapper({
  children,
  defaultOpen = false,
  filtersCount = 0,
  density,
  title,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  filtersCount?: number;
  density?: CatalogLayoutDensity | undefined;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const resolvedDensity = resolveCatalogDensity(density);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-raised)] text-left shadow-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-overlay)] md:hidden",
          resolvedDensity === "comfortable" ? "px-4 py-3.5" : "px-4 py-3",
        )}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted" aria-hidden="true" />
          <span className="font-heading text-sm font-semibold text-foreground">{title}</span>
          {filtersCount > 0 ? (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[color:var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--accent)]">
              {filtersCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn("size-4 text-muted transition-transform", isOpen ? "rotate-180" : "")}
          aria-hidden="true"
        />
      </button>
      <div className={cn(isOpen ? "block" : "hidden", "md:block")}>{children}</div>
    </div>
  );
}

/**
 * Lista de filtros configurados y opciones disponibles.
 */
export function FilterSidebar({
  activeFilters,
  categories,
  density,
  products = [],
}: {
  activeFilters?: Record<string, boolean | undefined> | undefined;
  categories?: StorefrontCategory[] | undefined;
  density?: CatalogLayoutDensity | undefined;
  products?: ProductCardData[] | undefined;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const resolvedDensity = resolveCatalogDensity(density);
  const filters = resolveConfiguredFilters(activeFilters, pathname, searchParams);
  const groups = resolveFilterGroups(
    activeFilters,
    pathname,
    searchParams,
    products,
    categories,
  );
  const clearAllHref = buildClearAllFiltersHref(pathname, searchParams);

  if (!activeFilters) {
    return (
      <aside className="space-y-6 rounded-xl border border-line bg-panel p-5">
        <h3 className="font-heading text-base font-semibold text-foreground">Filtros</h3>
        <p className="text-sm text-muted">Este layout todavía no configuró filtros públicos.</p>
      </aside>
    );
  }

  return (
    <FilterPanelWrapper
      title="Filtros"
      defaultOpen={false}
      filtersCount={filters.length}
      density={resolvedDensity}
    >
      <aside
        className={cn(
          "space-y-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-raised)] shadow-sm backdrop-blur-sm",
          resolvedDensity === "comfortable" ? "p-4.5" : "p-4",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Filtros</h3>
            <p className="text-sm text-muted">Refiná el catálogo con pocos clics.</p>
          </div>
          {filters.length > 0 ? (
            <Link href={clearAllHref as Route} className="text-xs font-semibold text-[color:var(--accent)] transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-raised)]">
              Limpiar
            </Link>
          ) : null}
        </div>

        {filters.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-b border-[color:var(--line)]/80 pb-3">
            {filters.map((filter) => (
              <Link
                key={filter.key}
                href={filter.href as Route}
                className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-3 py-1.5 text-xs text-foreground transition hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-raised)]"
              >
                <span className="font-semibold text-[color:var(--accent)]">{filter.label}</span>
                <span>{filter.value}</span>
              </Link>
            ))}
          </div>
        ) : null}

        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((group) => (
              <FilterSection key={group.key} group={group} />
            ))}
          </div>
        ) : null}
      </aside>
    </FilterPanelWrapper>
  );
}

/**
 * Barra de filtros horizontal (para filters-top / infinite-scroll).
 */
export function FilterBar({
  activeFilters,
  categories,
  density,
  products = [],
}: {
  activeFilters?: Record<string, boolean | undefined> | undefined;
  categories?: StorefrontCategory[] | undefined;
  density?: CatalogLayoutDensity | undefined;
  products?: ProductCardData[] | undefined;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const resolvedDensity = resolveCatalogDensity(density);
  const filters = resolveConfiguredFilters(activeFilters, pathname, searchParams);
  const groups = resolveFilterGroups(
    activeFilters,
    pathname,
    searchParams,
    products,
    categories,
  );
  const clearAllHref = buildClearAllFiltersHref(pathname, searchParams);

  if (!activeFilters) {
    return (
      <div className="rounded-xl border border-line bg-panel p-4">
        <p className="text-sm text-muted">Este layout todavía no configuró filtros públicos.</p>
      </div>
    );
  }

  return (
    <FilterPanelWrapper
      title="Filtrar catálogo"
      defaultOpen={false}
      filtersCount={filters.length}
      density={resolvedDensity}
    >
      <div
        className={cn(
          "space-y-2.5 rounded-[1.35rem] border border-[color:var(--line)] bg-[color:var(--surface-raised)] shadow-sm backdrop-blur-sm",
          resolvedDensity === "comfortable" ? "p-3.5" : "p-3",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
            <span className="text-[11px] text-muted">
              {groups.reduce((total, group) => total + countGroupOptions(group), 0)} opciones
            </span>
          </div>
          {filters.length > 0 ? (
            <Link href={clearAllHref as Route} className="text-xs font-semibold text-[color:var(--accent)] transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-raised)]">
              Limpiar
            </Link>
          ) : null}
        </div>

        {filters.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <Link
                key={filter.key}
                href={filter.href as Route}
                className="inline-flex min-h-8 items-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--ink)]"
              >
                <span className="font-semibold text-[color:var(--accent)]">{filter.label}:</span>
                <span className="ml-1">{filter.value}</span>
              </Link>
            ))}
          </div>
        ) : null}

        {groups.length > 0 ? (
          <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-4">
            {groups.map((group) => (
              <details
                key={group.key}
                className={cn(
                  "group rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-1.5",
                  group.key === "category" ? "xl:col-span-2" : "",
                )}
              >
                <summary className={cn(FILTER_SUMMARY_CLASSNAME, "list-none")}>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {group.title}
                    </p>
                    <p className="truncate text-[11px] text-foreground">
                      {group.key === "category"
                        ? "Elegí categoría"
                        : `${countGroupOptions(group)} opciones`}
                    </p>
                  </div>
                  <span className="flex items-center gap-2">
                    <span className="rounded-full bg-[color:var(--surface-raised)] px-2 py-0.5 text-[10px] font-semibold text-muted tabular-nums">
                      {countGroupOptions(group)}
                    </span>
                    <ChevronDown className="size-4 text-muted transition group-open:rotate-180" />
                  </span>
                </summary>
                <div className="mt-1.5 border-t border-[color:var(--line)]/80 pt-1.5">
                  <FilterGroupContent group={group} />
                </div>
              </details>
            ))}
          </div>
        ) : filters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--paper)]/48 p-2.5">
            <p className="text-sm text-muted">Todavía no encontramos opciones públicas para filtrar esta vista.</p>
          </div>
        ) : null}
      </div>
    </FilterPanelWrapper>
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
        <Link
          href={previousPageHref as Route}
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-line bg-panel px-3 text-sm text-foreground hover:bg-panel-strong"
          aria-label="Página anterior"
        >
          ‹
        </Link>
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
      <Link
        href={nextPageHref as Route}
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-line bg-panel px-3 text-sm text-foreground hover:bg-panel-strong"
        aria-label="Página siguiente"
      >
        ›
      </Link>
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
      <Link
        href={nextPageHref as Route}
        className="inline-flex items-center rounded-pill border border-line bg-panel px-4 py-2 text-sm font-medium text-foreground transition hover:bg-panel-strong"
      >
        Cargar página {currentPage + 1}
      </Link>
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
  density,
}: {
  products: ProductCardData[];
  cardVariant: string;
  cardDisplayOptions?: ProductCardDisplayOptions | undefined;
  columns?: 2 | 3 | 4;
  density?: CatalogLayoutDensity | undefined;
}) {
  const resolvedDensity = resolveCatalogDensity(density);
  const gridCols =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      className={cn(
        "grid",
        gridCols,
        resolvedDensity === "comfortable" ? "gap-4 md:gap-5" : "gap-3 md:gap-4",
      )}
    >
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
