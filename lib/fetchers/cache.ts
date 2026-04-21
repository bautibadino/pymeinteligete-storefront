import type { StorefrontQueryParams } from "@/lib/types/storefront";

import { buildStorefrontQuerySignature } from "@/lib/api/query";
import type { StorefrontNextOptions } from "@/lib/api/client";

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
    return undefined;
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
