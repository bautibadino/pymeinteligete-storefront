export type StorefrontCatalogSource = "v1" | "v2";

export const DEFAULT_STOREFRONT_CATALOG_SOURCE: StorefrontCatalogSource = "v2";

export function isStorefrontCatalogSource(
  value: string | undefined,
): value is StorefrontCatalogSource {
  return value === "v1" || value === "v2";
}

export function resolveStorefrontCatalogSource(
  explicitSource?: StorefrontCatalogSource,
): StorefrontCatalogSource {
  if (explicitSource) {
    return explicitSource;
  }

  const envSource = process.env.STOREFRONT_CATALOG_SOURCE?.trim().toLowerCase();

  return isStorefrontCatalogSource(envSource)
    ? envSource
    : DEFAULT_STOREFRONT_CATALOG_SOURCE;
}

export function shouldCollapseCatalogVariants(
  source: StorefrontCatalogSource,
): boolean {
  return source === "v1";
}
