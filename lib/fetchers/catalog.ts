import { STOREFRONT_API_PATHS, STOREFRONT_HEADERS } from "@/lib/contracts/storefront-v1";
import type { StorefrontCatalog, StorefrontCatalogQuery, StorefrontFetchInput } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions, readCachedStorefrontGet } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";
import {
  DEFAULT_STOREFRONT_CATALOG_SOURCE,
  resolveStorefrontCatalogSource,
  type StorefrontCatalogSource,
} from "@/lib/storefront/catalog-source";

const STOREFRONT_CATALOG_V2_PATH = "/api/storefront/v2/catalog/search";

function readNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeCatalogQuery(query?: StorefrontCatalogQuery): StorefrontCatalogQuery | undefined {
  if (!query) {
    return undefined;
  }

  const normalizedQuery: StorefrontCatalogQuery = {};

  if (query.page && query.page > 1) {
    normalizedQuery.page = query.page;
  }

  if (query.pageSize && query.pageSize !== 24) {
    normalizedQuery.pageSize = query.pageSize;
  }

  if (query.sortBy && query.sortBy !== "name") {
    normalizedQuery.sortBy = query.sortBy;
  }

  if (query.sortOrder && query.sortOrder !== "asc") {
    normalizedQuery.sortOrder = query.sortOrder;
  }

  const family = readNonEmptyString(query.family);
  if (family) {
    normalizedQuery.family = family;
  }

  const categoryId = readNonEmptyString(query.categoryId);
  if (categoryId) {
    normalizedQuery.categoryId = categoryId;
  }

  const slug = readNonEmptyString(query.slug);
  if (slug) {
    normalizedQuery.slug = slug;
  }

  const brand = readNonEmptyString(query.brand);
  if (brand) {
    normalizedQuery.brand = brand;
  }

  const search = readNonEmptyString(query.search);
  if (search) {
    normalizedQuery.search = search;
  }

  if (query.minPrice !== undefined) {
    normalizedQuery.minPrice = query.minPrice;
  }

  if (query.maxPrice !== undefined) {
    normalizedQuery.maxPrice = query.maxPrice;
  }

  const vehicleVersionId = readNonEmptyString(query.vehicleVersionId);
  if (vehicleVersionId) {
    normalizedQuery.vehicleVersionId = vehicleVersionId;
  }

  if (query.onlyImmediate !== undefined) {
    normalizedQuery.onlyImmediate = query.onlyImmediate;
  }

  return Object.keys(normalizedQuery).length > 0 ? normalizedQuery : undefined;
}

export type StorefrontCatalogOrigin =
  | "catalog-page"
  | "home"
  | "infinite-scroll"
  | "product-related"
  | "sitemap";

export { DEFAULT_STOREFRONT_CATALOG_SOURCE, resolveStorefrontCatalogSource };
export type { StorefrontCatalogSource };

function resolveCatalogPath(source: StorefrontCatalogSource): string {
  return source === "v2" ? STOREFRONT_CATALOG_V2_PATH : STOREFRONT_API_PATHS.catalog;
}

function resolveCatalogCacheSurface(source: StorefrontCatalogSource): string {
  return `catalog:${source}`;
}

type CatalogRequestOptions = {
  origin?: StorefrontCatalogOrigin;
  source?: StorefrontCatalogSource;
};

export async function getCatalog(
  input: StorefrontFetchInput,
  query?: StorefrontCatalogQuery,
  options?: CatalogRequestOptions,
): Promise<StorefrontCatalog> {
  const context = resolveStorefrontRequestContext(input);
  const normalizedQuery = normalizeCatalogQuery(query);
  const source = resolveStorefrontCatalogSource(options?.source);
  // Source travels in the cache namespace so cutovers never mix v1 and v2 entries.
  const cacheSurface = resolveCatalogCacheSurface(source);
  const requestOptions = {
    path: resolveCatalogPath(source),
    context,
    method: "GET" as const,
    next: buildStorefrontGetNextOptions(cacheSurface, context.host, normalizedQuery, context.tenantSlug),
    ...(options?.origin
      ? { headers: { [STOREFRONT_HEADERS.origin]: options.origin } }
      : {}),
    ...(normalizedQuery ? { query: normalizedQuery } : {}),
  };
  const fetchCatalog = () => requestStorefrontApi<StorefrontCatalog>(requestOptions);

  if (context.previewToken) {
    return fetchCatalog();
  }

  return readCachedStorefrontGet(
    cacheSurface,
    context.host,
    normalizedQuery,
    context.tenantSlug,
    fetchCatalog,
  );
}
