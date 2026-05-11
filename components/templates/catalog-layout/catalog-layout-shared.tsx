"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";
import type { Route } from "next";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import type { CatalogLayoutDensity } from "@/lib/modules/catalog-layout";
import type {
  StorefrontCatalogFacetOption,
  StorefrontCatalogFacets,
  StorefrontCategory,
  StorefrontPagination,
} from "@/lib/storefront-api";
import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";
import type { ProductCardData, ProductCardDisplayOptions } from "@/lib/templates/product-card-catalog";
import { cn } from "@/lib/utils/cn";
import { trackStorefrontAnalyticsEvent } from "@/lib/analytics/client";
import { buildSelectItemPayload } from "@/lib/analytics/events";

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
  search: "Búsqueda",
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
  imageUrl?: string;
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
    search: undefined,
  });
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function readFacetOptions(
  facets: StorefrontCatalogFacets | undefined,
  keys: string[],
): StorefrontCatalogFacetOption[] {
  if (!facets) {
    return [];
  }

  for (const key of keys) {
    const value = facets[key];
    if (Array.isArray(value)) {
      return value.filter((option): option is StorefrontCatalogFacetOption => {
        return typeof option === "object" && option !== null;
      });
    }
  }

  return [];
}

function resolveFacetImageUrl(option: StorefrontCatalogFacetOption): string | undefined {
  return option.imageUrl ?? option.logoUrl ?? option.logo?.url ?? option.logo?.src ?? option.logo?.imageUrl;
}

function resolveFacetText(
  option: StorefrontCatalogFacetOption,
  keys: Array<keyof StorefrontCatalogFacetOption>,
): string | undefined {
  for (const key of keys) {
    const value = option[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function normalizeFacetMatchValue(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : null;
}

function facetOptionMatchesValue(option: StorefrontCatalogFacetOption, value: string | null): boolean {
  const normalizedValue = normalizeFacetMatchValue(value);
  if (!normalizedValue) {
    return false;
  }

  return (["value", "id", "slug", "label", "name"] as Array<keyof StorefrontCatalogFacetOption>).some((key) => {
    const candidate = option[key];
    return typeof candidate === "string" && normalizeFacetMatchValue(candidate) === normalizedValue;
  });
}

function resolveFacetOptionLabel(
  facets: StorefrontCatalogFacets | undefined,
  keys: string[],
  value: string | null,
): string | null {
  for (const option of readFacetOptions(facets, keys)) {
    if (facetOptionMatchesValue(option, value)) {
      return resolveFacetText(option, ["label", "name", "value", "slug", "id"]) ?? null;
    }
  }

  return null;
}

function normalizeFacetCategories(facets: StorefrontCatalogFacets | undefined): StorefrontCategory[] {
  const options = readFacetOptions(facets, ["categories", "category"]);

  return options.flatMap((option) => {
    const categoryId = resolveFacetText(option, ["categoryId", "id", "value", "slug"]);
    const label = resolveFacetText(option, ["label", "name", "slug", "categoryId", "id", "value"]);

    if (!categoryId || !label) {
      return [];
    }

    return [
      {
        categoryId,
        slug: option.slug ?? categoryId,
        name: label,
        ...(option.imageUrl ? { imageUrl: option.imageUrl } : {}),
        ...(option.children?.length ? { children: normalizeFacetCategories({ categories: option.children }) } : {}),
      },
    ];
  });
}

function resolveAvailableCategories(
  categories: StorefrontCategory[] | undefined,
  facets: StorefrontCatalogFacets | undefined,
): StorefrontCategory[] | undefined {
  if (categories && categories.length > 0) {
    return categories;
  }

  const facetCategories = normalizeFacetCategories(facets);
  return facetCategories.length > 0 ? facetCategories : categories;
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

  return categories.map((category) => {
    const categoryHrefUpdates = category.slug && category.slug !== category.categoryId
      ? {
          category: category.slug,
          categoryId: undefined,
          page: undefined,
        }
      : {
          category: undefined,
          categoryId: category.categoryId,
          page: undefined,
        };

    return {
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
      href: buildHref(pathname, searchParams, categoryHrefUpdates),
      id: category.categoryId,
      label: category.name,
      slug: category.slug,
    };
  });
}

function findCategoryLabel(
  categories: StorefrontCategory[] | undefined,
  matcher: (category: StorefrontCategory) => boolean,
): string | null {
  if (!categories) {
    return null;
  }

  for (const category of categories) {
    if (matcher(category)) {
      return category.name;
    }

    const nested = findCategoryLabel(category.children, matcher);
    if (nested) {
      return nested;
    }
  }

  return null;
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
  facets?: StorefrontCatalogFacets,
): FilterGroup[] {
  if (!activeFilters) {
    return [];
  }

  const groups: FilterGroup[] = [];
  const availableCategories = resolveAvailableCategories(categories, facets);

  if (activeFilters.category) {
    const selectedCategoryId = searchParams.get("categoryId");
    const selectedCategorySlug = searchParams.get("category");
    const categoryTree = buildCategoryTreeOptions(
      availableCategories,
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
    const brandFacetOptions = readFacetOptions(facets, ["brands", "brand"]).flatMap((option) => {
      const value = resolveFacetText(option, ["value", "name", "label", "slug", "id"]);
      const label = resolveFacetText(option, ["label", "name", "value", "slug", "id"]);
      const imageUrl = resolveFacetImageUrl(option);

      if (!value || !label) {
        return [];
      }

      return [
        {
          active: facetOptionMatchesValue(option, selectedBrand),
          href: buildHref(pathname, searchParams, {
            brand: value,
            page: undefined,
          }),
          id: resolveFacetText(option, ["id", "value", "slug", "label", "name"]) ?? value,
          ...(imageUrl ? { imageUrl } : {}),
          label,
        },
      ];
    });

    const brandOptions = brandFacetOptions.length > 0
      ? brandFacetOptions.sort((left, right) => left.label.localeCompare(right.label, "es"))
      : (() => {
          const brandOptionsMap = new Map<string, { imageUrl?: string; label: string }>();

          for (const product of products) {
            const brand = product.brand?.trim();
            if (!isNonEmptyString(brand)) {
              continue;
            }

            const current = brandOptionsMap.get(brand);
            brandOptionsMap.set(brand, {
              label: brand,
              ...(current?.imageUrl ?? product.brandLogoUrl
                ? { imageUrl: current?.imageUrl ?? product.brandLogoUrl }
                : {}),
            });
          }

          return Array.from(brandOptionsMap.values())
            .sort((left, right) => left.label.localeCompare(right.label, "es"))
            .map((brand) => ({
              active: selectedBrand === brand.label,
              href: buildHref(pathname, searchParams, {
                brand: brand.label,
                page: undefined,
              }),
              id: brand.label,
              ...(brand.imageUrl ? { imageUrl: brand.imageUrl } : {}),
              label: brand.label,
            }));
        })();

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
  categories?: StorefrontCategory[],
  facets?: StorefrontCatalogFacets,
): { clearKeys: string[]; value: string } | null {
  const availableCategories = resolveAvailableCategories(categories, facets);

  switch (key) {
    case "search": {
      const search = searchParams.get("search");
      return search ? { value: search, clearKeys: ["search", "page"] } : null;
    }

    case "brand": {
      const brand = searchParams.get("brand");
      const brandLabel = resolveFacetOptionLabel(facets, ["brands", "brand"], brand);
      return brand ? { value: brandLabel ?? brand, clearKeys: ["brand", "page"] } : null;
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
      const categorySlug = searchParams.get("category");
      const categoryId = searchParams.get("categoryId");
      const categoryLabel = categoryId
        ? findCategoryLabel(availableCategories, (category) => category.categoryId === categoryId)
        : categorySlug
          ? findCategoryLabel(availableCategories, (category) => category.slug === categorySlug)
          : null;
      const category = categoryLabel ?? categorySlug?.replaceAll("-", " ") ?? (categoryId ? "Categoría seleccionada" : null);

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
  categories?: StorefrontCategory[],
  facets?: StorefrontCatalogFacets,
): ResolvedFilter[] {
  if (!activeFilters) {
    return [];
  }

  const enabledKeys = new Set(
    Object.entries(activeFilters)
      .filter(([, enabled]) => enabled === true)
      .map(([key]) => key),
  );

  if (searchParams.get("search")) {
    enabledKeys.add("search");
  }

  return Array.from(enabledKeys).flatMap((key) => {
      const filterValue = resolveFilterValue(key, searchParams, categories, facets);
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
  tone = "default",
}: {
  count: number;
  sortOptions?: string[] | undefined;
  defaultSort?: string | undefined;
  density?: CatalogLayoutDensity | undefined;
  tone?: "default" | "dark";
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
        tone === "dark"
          ? "rounded-2xl border border-white/10 bg-[#141416] shadow-[0_18px_46px_rgba(0,0,0,0.24)] backdrop-blur-sm"
          : "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-raised)] shadow-sm backdrop-blur-sm",
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
          <span className={cn("text-sm font-semibold tabular-nums", tone === "dark" ? "text-white" : "text-foreground")}>
            {count} resultados
          </span>
          <span className={cn("hidden text-sm md:inline", tone === "dark" ? "text-white/52" : "text-muted")}>
            Ordená sin salir de la grilla
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <span className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", tone === "dark" ? "text-white/54" : "text-muted")}>
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
  layout = "sidebar",
}: {
  group: FilterGroup;
  layout?: "sidebar" | "topbar";
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h4
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.16em]",
            layout === "sidebar" ? "text-[#f4f4f5]" : "text-muted",
          )}
        >
          {group.title}
        </h4>
        <span
          className={cn(
            "text-[10px] font-medium tabular-nums",
            layout === "sidebar" ? "text-[#a1a1aa]" : "text-muted",
          )}
        >
          {countGroupOptions(group)}
        </span>
      </div>
      <FilterGroupContent group={group} layout={layout} />
    </section>
  );
}

function FilterGroupContent({
  group,
  layout = "sidebar",
}: {
  group: FilterGroup;
  layout?: "sidebar" | "topbar";
}) {
  if (group.key === "category") {
    return <CategoryFilterSectionContent group={group} layout={layout} />;
  }

  if (layout === "sidebar") {
    return (
      <div className="space-y-1">
        {group.options.map((option) => (
          <Link
            key={option.id}
            href={option.href as Route}
            aria-current={option.active ? "true" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0",
              option.active
                ? "bg-white text-black"
                : "text-[#e4e4e7] hover:bg-white/[0.08] hover:text-white",
            )}
          >
            <FilterOptionMark option={option} />
            <span className={cn("truncate", option.active ? "font-semibold" : "font-medium")}>
              {option.label}
            </span>
          </Link>
        ))}
      </div>
    );
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
          {option.imageUrl ? (
            <img
              src={option.imageUrl}
              alt=""
              loading="lazy"
              className="-ml-1 size-6 rounded-full border border-current/15 bg-white object-contain p-0.5"
            />
          ) : null}
          {option.label}
        </Link>
      ))}
    </div>
  );
}

function FilterOptionMark({ option }: { option: FilterOption }) {
  if (option.imageUrl) {
    return (
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/14 bg-white">
        <img
          src={option.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-0.5"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "h-4 w-4 shrink-0 rounded-[4px] border transition",
        option.active
          ? "border-white bg-black/90"
          : "border-[#71717a] bg-transparent",
      )}
    />
  );
}

function CategoryFilterSectionContent({
  group,
  layout = "sidebar",
}: {
  group: FilterGroup;
  layout?: "sidebar" | "topbar";
}) {
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
        className={cn(
          "h-8 text-sm shadow-none",
          layout === "sidebar"
            ? "rounded-lg border-[#3f3f46] bg-[#18181b] text-[#fafafa] placeholder:text-[#a1a1aa] focus-visible:ring-white/20 focus-visible:ring-offset-0"
            : "rounded-md border-[color:var(--line)] bg-[color:var(--surface-raised)] focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-0",
        )}
        aria-label="Buscar categoría"
      />

      <div
        className={cn(
          "max-h-56 space-y-1 overflow-y-auto p-1.5",
          layout === "sidebar"
            ? "rounded-xl border border-[#27272a] bg-[#18181b]"
            : "rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-muted)]",
        )}
      >
        {hasCategories ? (
          <CategoryTreeList nodes={filteredOptions} layout={layout} />
        ) : (
          <p className={cn("px-2.5 py-2 text-sm", layout === "sidebar" ? "text-[#c4c4cc]" : "text-muted")}>
            No encontramos categorías para esa búsqueda.
          </p>
        )}
      </div>
    </div>
  );
}

function CategoryTreeList({
  depth = 0,
  layout = "sidebar",
  nodes,
}: {
  depth?: number;
  layout?: "sidebar" | "topbar";
  nodes: CategoryTreeOption[];
}) {
  return (
    <ul
      className={cn(
        "space-y-1",
        depth > 0
          ? layout === "sidebar"
            ? "mt-1 border-l border-[#27272a] pl-3"
            : "mt-1 border-l border-[color:var(--line)]/80 pl-3"
          : "",
      )}
    >
      {nodes.map((node) => (
        <li key={node.id} className="space-y-1">
          <Link
            href={node.href as Route}
            aria-current={node.active ? "true" : undefined}
            className={
              node.active
                ? layout === "sidebar"
                  ? "flex items-center rounded-lg bg-white px-2.5 py-2 text-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0"
                  : "flex items-center rounded-md bg-[color:var(--accent)] px-2.5 py-1.5 text-sm font-semibold text-[color:var(--action-contrast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-muted)]"
                : layout === "sidebar"
                  ? "flex items-center rounded-lg px-2.5 py-2 text-sm text-[#e4e4e7] transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0"
                  : "flex items-center rounded-md px-2.5 py-1.5 text-sm text-foreground transition hover:bg-[color:var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-muted)]"
            }
          >
            {node.label}
          </Link>
          {node.children.length > 0 ? (
            <CategoryTreeList depth={depth + 1} nodes={node.children} layout={layout} />
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
  mobilePresentation = "inline",
  title,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  filtersCount?: number;
  density?: CatalogLayoutDensity | undefined;
  mobilePresentation?: "drawer" | "inline";
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const resolvedDensity = resolveCatalogDensity(density);

  if (mobilePresentation === "drawer") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-[#131416] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 lg:hidden"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span>{title}</span>
          {filtersCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] text-white/72">
              {filtersCount}
            </span>
          ) : null}
        </button>

        {isOpen ? (
          <div className="fixed inset-0 z-[90] !mt-0 h-dvh w-dvw overflow-hidden bg-black/82 backdrop-blur-sm lg:hidden">
            <button
              type="button"
              aria-label="Cerrar filtros"
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 top-0 h-dvh w-[88vw] max-w-sm overflow-y-auto border-r border-white/10 bg-[#0b0c0d] px-4 py-5 shadow-2xl">
              <button
                type="button"
                aria-label="Cerrar filtros"
                className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/6 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
              <div className="pr-8">{children}</div>
            </div>
          </div>
        ) : null}

        <div className="hidden lg:block">{children}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-raised)] text-left shadow-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-overlay)] lg:hidden",
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
      <div className={cn(isOpen ? "block" : "hidden", "lg:block")}>{children}</div>
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
  facets,
  products = [],
}: {
  activeFilters?: Record<string, boolean | undefined> | undefined;
  categories?: StorefrontCategory[] | undefined;
  density?: CatalogLayoutDensity | undefined;
  facets?: StorefrontCatalogFacets | undefined;
  products?: ProductCardData[] | undefined;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const resolvedDensity = resolveCatalogDensity(density);
  const filters = resolveConfiguredFilters(activeFilters, pathname, searchParams, categories, facets);
  const groups = resolveFilterGroups(
    activeFilters,
    pathname,
    searchParams,
    products,
    categories,
    facets,
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
      mobilePresentation="drawer"
    >
      <aside
        className={cn(
          "space-y-4 rounded-[1.4rem] border border-[#27272a] bg-[#111113] shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-sm",
          resolvedDensity === "comfortable" ? "p-4.5" : "p-4",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[#fafafa]">Filtros</h3>
            <p className="text-sm text-[#c4c4cc]">Refiná el catálogo sin salir de la grilla.</p>
          </div>
          {filters.length > 0 ? (
            <Link href={clearAllHref as Route} className="text-xs font-semibold text-[#e4e4e7] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0">
              Limpiar
            </Link>
          ) : null}
        </div>

        {filters.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-b border-[#27272a] pb-3">
            {filters.map((filter) => (
              <Link
                key={filter.key}
                href={filter.href as Route}
                className="inline-flex items-center gap-1 rounded-full border border-[#3f3f46] bg-[#18181b] px-3 py-1.5 text-xs text-[#e4e4e7] transition hover:bg-[#232326]"
              >
                <span className="font-semibold text-[#fafafa]">{filter.label}</span>
                <span>{filter.value}</span>
              </Link>
            ))}
          </div>
        ) : null}

        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((group) => (
              <FilterSection key={group.key} group={group} layout="sidebar" />
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
  facets,
  products = [],
}: {
  activeFilters?: Record<string, boolean | undefined> | undefined;
  categories?: StorefrontCategory[] | undefined;
  density?: CatalogLayoutDensity | undefined;
  facets?: StorefrontCatalogFacets | undefined;
  products?: ProductCardData[] | undefined;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const resolvedDensity = resolveCatalogDensity(density);
  const filters = resolveConfiguredFilters(activeFilters, pathname, searchParams, categories, facets);
  const groups = resolveFilterGroups(
    activeFilters,
    pathname,
    searchParams,
    products,
    categories,
    facets,
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
      mobilePresentation="drawer"
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
                  <FilterGroupContent group={group} layout="topbar" />
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
export function CatalogPagination({
  pageSize,
  pagination,
}: {
  pageSize?: number | undefined;
  pagination?: StorefrontPagination | undefined;
}) {
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const currentPage = pagination?.page ?? parsePositiveInteger(searchParams.get("page")) ?? 1;
  const resolvedPageSize = pagination?.pageSize ?? resolvePageSize(searchParams, pageSize);
  const totalPages = pagination?.totalPages && pagination.totalPages > 0 ? pagination.totalPages : undefined;
  const totalResults = pagination?.total;
  const previousPageHref =
    currentPage > 1
      ? buildPageHref(pathname, searchParams, currentPage - 1, resolvedPageSize)
      : undefined;
  const nextPageHref =
    totalPages === undefined || currentPage < totalPages
      ? buildPageHref(pathname, searchParams, currentPage + 1, resolvedPageSize)
      : undefined;

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3 py-4 text-center sm:flex-row sm:justify-between sm:text-left"
    >
      <p className="text-sm font-medium text-foreground">
        Página {currentPage}{totalPages ? ` de ${totalPages}` : ""}
        {typeof totalResults === "number" ? (
          <span className="ml-2 text-muted">
            {totalResults} {totalResults === 1 ? "producto" : "productos"}
          </span>
        ) : null}
      </p>
      <div className="flex items-center justify-center gap-2">
        {previousPageHref ? (
          <Link
            href={previousPageHref as Route}
            className="inline-flex h-9 items-center justify-center rounded-md border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-3 text-sm font-medium text-foreground transition hover:bg-[color:var(--surface-raised)]"
            aria-label="Página anterior"
          >
            Anterior
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-3 text-sm font-medium text-muted opacity-50"
          >
            Anterior
          </span>
        )}
        <span
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-[color:var(--accent)] px-3 text-sm font-semibold text-[color:var(--action-contrast)]"
          aria-current="page"
        >
          {currentPage}
        </span>
        {nextPageHref ? (
          <Link
            href={nextPageHref as Route}
            className="inline-flex h-9 items-center justify-center rounded-md border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-3 text-sm font-medium text-foreground transition hover:bg-[color:var(--surface-raised)]"
            aria-label="Página siguiente"
          >
            Siguiente
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-3 text-sm font-medium text-muted opacity-50"
          >
            Siguiente
          </span>
        )}
      </div>
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
  analyticsList,
  columns = 3,
  density,
}: {
  products: ProductCardData[];
  cardVariant: string;
  cardDisplayOptions?: ProductCardDisplayOptions | undefined;
  analyticsList?: { id: string; name: string } | undefined;
  columns?: 2 | 3 | 4;
  density?: CatalogLayoutDensity | undefined;
}) {
  const resolvedDensity = resolveCatalogDensity(density);
  const gridCols =
    columns === 4
      ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : columns === 2
        ? "grid-cols-2"
        : "grid-cols-2 lg:grid-cols-3";

  return (
    <div
      className={cn(
        "grid",
        gridCols,
        resolvedDensity === "comfortable" ? "gap-4 md:gap-5" : "gap-3 md:gap-4",
      )}
    >
      {products.map((product, index) => {
        const ProductCard = resolveProductCardTemplate(cardVariant);
        const handleProductClickCapture = (event: MouseEvent<HTMLDivElement>) => {
          if (!analyticsList) {
            return;
          }

          const target = event.target instanceof Element ? event.target : null;
          const productLink = target?.closest('a[href*="/producto/"]');

          if (!productLink) {
            return;
          }

          const payload = buildSelectItemPayload({
            eventId: `select_${analyticsList.id}_${product.id}`,
            index,
            item: {
              id: product.id,
              name: product.name,
              price: product.price.amount,
              ...(product.brand ? { brand: product.brand } : {}),
            },
            listId: analyticsList.id,
            listName: analyticsList.name,
          });

          trackStorefrontAnalyticsEvent({
            event: "select_item",
            googleEvent: "select_item",
            serverEvent: null,
            googlePayload: payload,
            options: {
              eventId: payload.eventId,
            },
          });
        };

        return (
          <div key={product.id} onClickCapture={handleProductClickCapture}>
            <ProductCard
              product={product}
              {...(cardDisplayOptions ? { displayOptions: cardDisplayOptions } : {})}
            />
          </div>
        );
      })}
    </div>
  );
}
