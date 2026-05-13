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
): string[] {
  const tags = [`${surface}:${host}`];

  if (query && Object.keys(query).length > 0) {
    tags.push(`${surface}:${host}:${buildStorefrontQuerySignature(query)}`);
  }

  return tags;
}

export function buildStorefrontGetNextOptions(
  surface: string,
  host: string,
  query?: StorefrontQueryParams,
): StorefrontNextOptions {
  const revalidate = getStorefrontFetchRevalidate();
  const tags = buildStorefrontGetCacheTags(surface, host, query);

  return {
    tags,
    ...(revalidate !== undefined ? { revalidate } : {}),
  };
}

export async function readCachedStorefrontGet<T>(
  surface: string,
  host: string,
  query: StorefrontQueryParams | undefined,
  fetcher: () => Promise<T>,
): Promise<T> {
  const revalidate = getStorefrontFetchRevalidate();
  const tags = buildStorefrontGetCacheTags(surface, host, query);
  const cacheKey = ["storefront-get", surface, host, buildStorefrontQuerySignature(query)];
  const cachedFetcher = unstable_cache(fetcher, cacheKey, {
    tags,
    ...(revalidate !== undefined ? { revalidate } : {}),
  });

  return cachedFetcher();
}
