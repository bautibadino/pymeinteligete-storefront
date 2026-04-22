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

  const shopStatus = bootstrapResult.data?.shopStatus ?? null;

  if (shopStatus === "draft" || shopStatus === "disabled") {
    return {
      categories: [],
      products: [],
      issues: [...issues, `sitemap-data:shopStatus=${shopStatus}`],
    };
  }

  const [{ data: categories, issue: categoriesIssue }, { data: catalog, issue: catalogIssue }] =
    await Promise.all([
      safeFetch(() => getCategories(runtime.context), [], "categories"),
      safeFetch(() => getCatalog(runtime.context, { pageSize: 500 }), { items: [] }, "catalog"),
    ]);

  if (categoriesIssue) {
    issues.push(categoriesIssue);
  }

  if (catalogIssue) {
    issues.push(catalogIssue);
  }

  // Solo incluir productos con slug definido (requerido para URL canónica)
  const products = (catalog?.items ?? []).filter(
    (product): product is StorefrontCatalogProduct & { slug: string } =>
      typeof product.slug === "string" && product.slug.trim().length > 0,
  );

  return {
    categories,
    products,
    issues,
  };
});
