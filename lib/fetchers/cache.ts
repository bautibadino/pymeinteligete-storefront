import type { StorefrontQueryParams } from "@/lib/types/storefront";

import { buildStorefrontQuerySignature } from "@/lib/api/query";
import type { StorefrontNextOptions } from "@/lib/api/client";
import { unstable_cache } from "next/cache";

const DEFAULT_STOREFRONT_REVALIDATE_SECONDS = 86400;

function readOptionalPositiveInteger(name: string): number | undefined {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return undefined;
  }

  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

export function getStorefrontFetchRevalidate(): number | false | undefined {
  const value = readOptionalPositiveInteger("STORE_REVALIDATE_SECONDS");

  if (value === undefined) {
    return DEFAULT_STOREFRONT_REVALIDATE_SECONDS;
  }

  return value;
}

export function buildStorefrontGetCacheTags(
  surface: string,
  host: string,
  query?: StorefrontQueryParams,
  tenantSlug?: string,
): string[] {
  const baseTag = tenantSlug ? `${surface}:${host}:tenant:${tenantSlug}` : `${surface}:${host}`;
  const tags = [baseTag];

  if (query && Object.keys(query).length > 0) {
    tags.push(`${baseTag}:${buildStorefrontQuerySignature(query)}`);
  }

  return tags;
}

export function buildStorefrontGetNextOptions(
  surface: string,
  host: string,
  query?: StorefrontQueryParams,
  tenantSlug?: string,
): StorefrontNextOptions {
  const revalidate = getStorefrontFetchRevalidate();
  const tags = buildStorefrontGetCacheTags(surface, host, query, tenantSlug);

  return {
    tags,
    ...(revalidate !== undefined ? { revalidate } : {}),
  };
}

export async function readCachedStorefrontGet<T>(
  surface: string,
  host: string,
  query: StorefrontQueryParams | undefined,
  tenantSlug: string | undefined,
  fetcher: () => Promise<T>,
): Promise<T> {
  const revalidate = getStorefrontFetchRevalidate();
  const tags = buildStorefrontGetCacheTags(surface, host, query, tenantSlug);
  const cacheKey = [
    "storefront-get",
    surface,
    host,
    tenantSlug ?? "no-tenant-slug",
    buildStorefrontQuerySignature(query),
  ];
  const cachedFetcher = unstable_cache(fetcher, cacheKey, {
    tags,
    ...(revalidate !== undefined ? { revalidate } : {}),
  });

  return cachedFetcher();
}
