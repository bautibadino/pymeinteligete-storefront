import type { StorefrontQueryParams, StorefrontQueryPrimitive } from "@/lib/types/storefront";

function appendQueryValue(
  searchParams: URLSearchParams,
  key: string,
  value: StorefrontQueryPrimitive,
): void {
  searchParams.append(key, String(value));
}

export function buildStorefrontSearchParams(query?: StorefrontQueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (!query) {
    return searchParams;
  }

  const entries = Object.entries(query).sort(([left], [right]) => left.localeCompare(right));

  for (const [key, rawValue] of entries) {
    if (rawValue === null || rawValue === undefined) {
      continue;
    }

    if (Array.isArray(rawValue)) {
      for (const item of rawValue) {
        appendQueryValue(searchParams, key, item);
      }

      continue;
    }

    appendQueryValue(searchParams, key, rawValue as StorefrontQueryPrimitive);
  }

  return searchParams;
}

export function buildStorefrontQuerySignature(query?: StorefrontQueryParams): string {
  const serialized = buildStorefrontSearchParams(query).toString();

  return serialized || "base";
}
