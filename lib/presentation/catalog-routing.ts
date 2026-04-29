import type { StorefrontCatalogQuery, StorefrontCategory } from "@/lib/storefront-api";

type SearchParamValue = string | string[] | undefined;

type SearchParamsRecord = Record<string, SearchParamValue>;

type CatalogSearchResolution = {
  query: StorefrontCatalogQuery;
  selectedCategory: StorefrontCategory | null;
  pathname: string;
};

const VALID_SORT_FIELDS = ["name", "price", "createdAt", "brand"] as const;
const VALID_SORT_ORDERS = ["asc", "desc"] as const;
const LEGACY_SORT_MAP: Record<
  string,
  Pick<StorefrontCatalogQuery, "sortBy" | "sortOrder">
> = {
  priceasc: { sortBy: "price", sortOrder: "asc" },
  pricedesc: { sortBy: "price", sortOrder: "desc" },
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  nameasc: { sortBy: "name", sortOrder: "asc" },
  namedesc: { sortBy: "name", sortOrder: "desc" },
  brandasc: { sortBy: "brand", sortOrder: "asc" },
  branddesc: { sortBy: "brand", sortOrder: "desc" },
};

function getSingleValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeToken(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();

  return normalized ? normalized : undefined;
}

function slugifyValue(value: string | undefined): string | undefined {
  const normalized = normalizeToken(value);

  return normalized ? normalized.replaceAll(/\s+/g, "-") : undefined;
}

function parsePositiveInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  const normalized = normalizeToken(value);

  if (!normalized) {
    return undefined;
  }

  if (["1", "true", "yes", "si", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return undefined;
}

function parseImmediateAvailability(value: string | undefined): boolean | undefined {
  const normalized = normalizeToken(value);

  if (!normalized) {
    return undefined;
  }

  if (["immediate", "inmediata", "inmediato", "onlyimmediate"].includes(normalized)) {
    return true;
  }

  return parseBoolean(normalized);
}

function isSortField(value: string | undefined): value is NonNullable<StorefrontCatalogQuery["sortBy"]> {
  return Boolean(value && VALID_SORT_FIELDS.includes(value as (typeof VALID_SORT_FIELDS)[number]));
}

function isSortOrder(value: string | undefined): value is NonNullable<StorefrontCatalogQuery["sortOrder"]> {
  return Boolean(value && VALID_SORT_ORDERS.includes(value as (typeof VALID_SORT_ORDERS)[number]));
}

function resolveSort(
  rawSortBy: string | undefined,
  rawSortOrder: string | undefined,
  rawLegacySort: string | undefined,
): Pick<StorefrontCatalogQuery, "sortBy" | "sortOrder"> {
  const normalizedSortBy = isSortField(rawSortBy) ? rawSortBy : undefined;
  const normalizedSortOrder = isSortOrder(rawSortOrder) ? rawSortOrder : undefined;

  if (normalizedSortBy) {
    return {
      sortBy: normalizedSortBy,
      sortOrder:
        normalizedSortOrder ??
        (normalizedSortBy === "createdAt" ? "desc" : "asc"),
    };
  }

  const legacySort = normalizeToken(rawLegacySort);

  return legacySort ? LEGACY_SORT_MAP[legacySort] ?? {} : {};
}

function matchesCategory(category: StorefrontCategory, value: string | undefined): boolean {
  const normalizedValue = normalizeToken(value);

  if (!normalizedValue) {
    return false;
  }

  return (
    normalizeToken(category.categoryId) === normalizedValue ||
    normalizeToken(category.slug) === normalizedValue ||
    slugifyValue(category.name) === normalizedValue
  );
}

export function resolveCategoryBySlug(
  categories: StorefrontCategory[],
  slug: string | undefined,
): StorefrontCategory | null {
  if (!slug) {
    return null;
  }

  return categories.find((category) => matchesCategory(category, slug)) ?? null;
}

export function buildCategoryCatalogHref(category: Pick<StorefrontCategory, "categoryId" | "slug">): string {
  const slug = category.slug?.trim();

  if (slug) {
    return `/catalogo/${encodeURIComponent(slug)}`;
  }

  return category.categoryId ? `/catalogo?categoryId=${encodeURIComponent(category.categoryId)}` : "/catalogo";
}

export function parseCatalogSearchParams(
  searchParams: SearchParamsRecord,
  categories: StorefrontCategory[] = [],
  routeCategorySlug?: string,
): CatalogSearchResolution {
  const rawPage = getSingleValue(searchParams.page);
  const rawPageSize = getSingleValue(searchParams.pageSize);
  const rawSearch = getSingleValue(searchParams.search);
  const rawSortBy = getSingleValue(searchParams.sortBy);
  const rawSortOrder = getSingleValue(searchParams.sortOrder);
  const rawSort = getSingleValue(searchParams.sort);
  const rawCategoryId = getSingleValue(searchParams.categoryId);
  const rawCategory = getSingleValue(searchParams.category);
  const rawBrand = getSingleValue(searchParams.brand);
  const rawFamily = getSingleValue(searchParams.family);
  const rawOnlyImmediate = getSingleValue(searchParams.onlyImmediate);
  const rawAvailability = getSingleValue(searchParams.availability);
  const rawMinPrice = getSingleValue(searchParams.minPrice);
  const rawMaxPrice = getSingleValue(searchParams.maxPrice);

  const selectedCategory =
    resolveCategoryBySlug(categories, routeCategorySlug) ??
    categories.find((category) => matchesCategory(category, rawCategoryId)) ??
    categories.find((category) => matchesCategory(category, rawCategory)) ??
    null;
  const { sortBy, sortOrder } = resolveSort(rawSortBy, rawSortOrder, rawSort);
  const onlyImmediate = parseBoolean(rawOnlyImmediate) ?? parseImmediateAvailability(rawAvailability);
  const page = parsePositiveInteger(rawPage);
  const pageSize = parsePositiveInteger(rawPageSize);
  const search = rawSearch?.trim() || undefined;
  const categoryId = selectedCategory?.categoryId ?? (rawCategoryId?.trim() || undefined);
  const brand = rawBrand?.trim() || undefined;
  const family = rawFamily?.trim() || undefined;
  const minPrice = parseNumber(rawMinPrice);
  const maxPrice = parseNumber(rawMaxPrice);
  const query: StorefrontCatalogQuery = {};

  if (page !== undefined) query.page = page;
  if (pageSize !== undefined) query.pageSize = pageSize;
  if (search) query.search = search;
  if (sortBy) query.sortBy = sortBy;
  if (sortOrder) query.sortOrder = sortOrder;
  if (categoryId) query.categoryId = categoryId;
  if (brand) query.brand = brand;
  if (family) query.family = family;
  if (minPrice !== undefined) query.minPrice = minPrice;
  if (maxPrice !== undefined) query.maxPrice = maxPrice;
  if (onlyImmediate !== undefined) query.onlyImmediate = onlyImmediate;

  return {
    query,
    selectedCategory,
    pathname: selectedCategory ? buildCategoryCatalogHref(selectedCategory) : "/catalogo",
  };
}
