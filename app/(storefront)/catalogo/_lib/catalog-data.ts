import {
  canBrowseCatalog,
  loadBootstrapExperience,
  loadCatalogExperience,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { parseCatalogSearchParams } from "@/lib/presentation/catalog-routing";
import { getCategories, type StorefrontCategory } from "@/lib/storefront-api";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

type CatalogRouteResolution = {
  categories: StorefrontCategory[];
  pathname: string;
  query: ReturnType<typeof parseCatalogSearchParams>["query"];
  selectedCategory: ReturnType<typeof parseCatalogSearchParams>["selectedCategory"];
  categoryLookupFailed: boolean;
};

type CatalogRouteData = {
  categories: StorefrontCategory[];
  experience: Awaited<ReturnType<typeof loadCatalogExperience>>;
  pathname: string;
  query: ReturnType<typeof parseCatalogSearchParams>["query"];
  selectedCategory: ReturnType<typeof parseCatalogSearchParams>["selectedCategory"];
  categoryLookupFailed: boolean;
};

function shouldResolveCategories(
  searchParams: SearchParamsRecord,
  routeCategorySlug?: string,
): boolean {
  return Boolean(
    routeCategorySlug ??
      searchParams.categoryId ??
      searchParams.category,
  );
}

async function fetchCatalogCategories(): Promise<{
  base: Awaited<ReturnType<typeof loadBootstrapExperience>>;
  categories: StorefrontCategory[];
  categoryLookupFailed: boolean;
}> {
  const base = await loadBootstrapExperience();

  if (!canBrowseCatalog(base.bootstrap?.tenant.status ?? null)) {
    return {
      base,
      categories: [],
      categoryLookupFailed: false,
    };
  }

  try {
    const categories = await getCategories(base.runtime.context);

    return {
      base,
      categories,
      categoryLookupFailed: false,
    };
  } catch {
    return {
      base,
      categories: [],
      categoryLookupFailed: true,
    };
  }
}

function buildCategoryFallbackPath(routeCategorySlug: string | undefined): string {
  return routeCategorySlug ? `/catalogo/${encodeURIComponent(routeCategorySlug)}` : "/catalogo";
}

function isCanonicalCatalogQuery(query: CatalogRouteResolution["query"]): boolean {
  return (
    (query.page ?? 1) <= 1 &&
    !query.search &&
    !query.brand &&
    !query.family &&
    !query.sortBy &&
    !query.sortOrder
  );
}

function sanitizeCatalogQuery(query: CatalogRouteResolution["query"]): CatalogRouteResolution["query"] {
  return query.categoryId ? { categoryId: query.categoryId } : {};
}

export async function resolveCatalogRoute(
  searchParams: SearchParamsRecord,
  routeCategorySlug?: string,
): Promise<CatalogRouteResolution> {
  const categoryResult = await fetchCatalogCategories();
  const resolved = parseCatalogSearchParams(searchParams, categoryResult.categories, routeCategorySlug);
  const categoryLookupFailed = shouldResolveCategories(searchParams, routeCategorySlug) && categoryResult.categoryLookupFailed;

  return {
    categories: categoryResult.categories,
    pathname:
      categoryLookupFailed && routeCategorySlug
        ? buildCategoryFallbackPath(routeCategorySlug)
        : resolved.pathname,
    query: resolved.query,
    selectedCategory: resolved.selectedCategory,
    categoryLookupFailed,
  };
}

export async function loadCatalogRouteData(
  searchParams: SearchParamsRecord,
  routeCategorySlug?: string,
): Promise<CatalogRouteData> {
  const resolved = await resolveCatalogRoute(searchParams, routeCategorySlug);
  const effectiveQuery = !isCanonicalCatalogQuery(resolved.query)
    ? sanitizeCatalogQuery(resolved.query)
    : resolved.query;
  const experience = await loadCatalogExperience(effectiveQuery);

  return {
    categories: resolved.categories,
    experience,
    pathname: resolved.pathname,
    query: effectiveQuery,
    selectedCategory: resolved.selectedCategory,
    categoryLookupFailed: resolved.categoryLookupFailed,
  };
}
