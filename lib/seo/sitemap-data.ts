import { cache } from "react";

import {
  StorefrontApiError,
  getBootstrap,
  getCategories,
  getCatalog,
  type StorefrontCategory,
  type StorefrontCatalogProduct,
} from "@/lib/storefront-api";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

export type TenantSitemapData = {
  categories: StorefrontCategory[];
  products: StorefrontCatalogProduct[];
  issues: string[];
};

const SITEMAP_CATALOG_PAGE_SIZE = 48;

async function safeFetch<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  issueLabel: string,
): Promise<{ data: T; issue?: string }> {
  try {
    const data = await fetcher();

    return { data };
  } catch (error) {
    const message =
      error instanceof StorefrontApiError ? error.message : `Error inesperado en ${issueLabel}`;

    return { data: fallback, issue: `${issueLabel}:${message}` };
  }
}

async function fetchAllCatalogProducts(
  input: Parameters<typeof getCatalog>[0],
): Promise<{ products: StorefrontCatalogProduct[]; issues: string[] }> {
  const issues: string[] = [];
  const productsBySlug = new Map<string, StorefrontCatalogProduct>();
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const { data: catalog, issue } = await safeFetch(
      () => getCatalog(input, { page, pageSize: SITEMAP_CATALOG_PAGE_SIZE }),
      {
        products: [],
        pagination: { page, pageSize: SITEMAP_CATALOG_PAGE_SIZE, total: 0, totalPages: 0 },
      },
      `catalog:page=${page}`,
    );

    if (issue) {
      issues.push(issue);
      break;
    }

    for (const product of catalog.products ?? []) {
      if (typeof product.slug === "string" && product.slug.trim().length > 0) {
        productsBySlug.set(product.slug, product);
      }
    }

    const nextTotalPages = catalog.pagination?.totalPages ?? 0;
    totalPages = nextTotalPages > 0 ? nextTotalPages : page;

    if ((catalog.products?.length ?? 0) === 0 || page >= totalPages) {
      break;
    }

    page += 1;
  }

  return {
    products: [...productsBySlug.values()],
    issues,
  };
}

export const getTenantSitemapData = cache(async (): Promise<TenantSitemapData> => {
  const runtime = await getStorefrontRuntimeSnapshot();
  const issues: string[] = [];

  if (!runtime.hasApiBaseUrl) {
    return {
      categories: [],
      products: [],
      issues: ["sitemap-data:MISSING_API_BASE_URL"],
    };
  }

  // Validar bootstrap para evitar llamadas si el tenant no existe o está disabled
  const bootstrapResult = await safeFetch(
    () => getBootstrap(runtime.context),
    null,
    "bootstrap",
  );

  if (bootstrapResult.issue) {
    issues.push(bootstrapResult.issue);
  }

  const shopStatus = bootstrapResult.data?.tenant.status ?? null;

  if (shopStatus === "draft" || shopStatus === "disabled") {
    return {
      categories: [],
      products: [],
      issues: [...issues, `sitemap-data:shopStatus=${shopStatus}`],
    };
  }

  const [{ data: categories, issue: categoriesIssue }, catalogResult] =
    await Promise.all([
      safeFetch(() => getCategories(runtime.context), [], "categories"),
      fetchAllCatalogProducts(runtime.context),
    ]);

  if (categoriesIssue) {
    issues.push(categoriesIssue);
  }

  issues.push(...catalogResult.issues);

  return {
    categories,
    products: catalogResult.products,
    issues,
  };
});
