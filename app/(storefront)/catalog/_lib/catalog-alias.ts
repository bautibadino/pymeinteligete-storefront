type SearchParamValue = string | string[] | undefined;

export type CatalogAliasSearchParams = Record<string, SearchParamValue>;

export function buildCatalogAliasRedirectHref(
  pathname: string,
  searchParams: CatalogAliasSearchParams,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}
