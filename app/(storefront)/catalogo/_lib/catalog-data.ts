import {
  canBrowseCatalog,
  loadBootstrapExperience,
  loadCatalogExperience,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { parseCatalogSearchParams } from "@/lib/presentation/catalog-routing";
import { getCategories, type StorefrontCategory } from "@/lib/storefront-api";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

type CatalogRouteData = {
  categories: StorefrontCategory[];
  experience: Awaited<ReturnType<typeof loadCatalogExperience>>;
  pathname: string;
  query: ReturnType<typeof parseCatalogSearchParams>["query"];
  selectedCategory: ReturnType<typeof parseCatalogSearchParams>["selectedCategory"];
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
}> {
  const base = await loadBootstrapExperience();

  if (!canBrowseCatalog(base.bootstrap?.tenant.status ?? null)) {
    return {
      base,
      categories: [],
    };
  }

  try {
    const categories = await getCategories(base.runtime.context);

    return {
      base,
      categories,
    };
  } catch {
    return {
      base,
      categories: [],
    };
  }
}

export async function loadCatalogRouteData(
  searchParams: SearchParamsRecord,
  routeCategorySlug?: string,
): Promise<CatalogRouteData> {
  if (!shouldResolveCategories(searchParams, routeCategorySlug)) {
    const initialResolution = parseCatalogSearchParams(searchParams);
    const [experience, categoryResult] = await Promise.all([
      loadCatalogExperience(initialResolution.query),
      fetchCatalogCategories(),
    ]);
    const resolved = parseCatalogSearchParams(searchParams, categoryResult.categories, routeCategorySlug);

    return {
      categories: categoryResult.categories,
      experience,
      pathname: resolved.pathname,
      query: resolved.query,
      selectedCategory: resolved.selectedCategory,
    };
  }

  const { categories } = await fetchCatalogCategories();
  const resolved = parseCatalogSearchParams(searchParams, categories, routeCategorySlug);
  const experience = await loadCatalogExperience(resolved.query);

  return {
    categories,
    experience,
    pathname: resolved.pathname,
    query: resolved.query,
    selectedCategory: resolved.selectedCategory,
  };
}
