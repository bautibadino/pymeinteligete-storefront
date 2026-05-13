const EXPENSIVE_STOREFRONT_PREFIXES = [
  "/catalog",
  "/catalogo",
  "/producto",
] as const;

export function shouldPrefetchStorefrontLink(href: string): boolean {
  const normalizedHref = href.trim().toLowerCase();

  if (!normalizedHref.startsWith("/")) {
    return true;
  }

  return !EXPENSIVE_STOREFRONT_PREFIXES.some((prefix) =>
    normalizedHref === prefix ||
    normalizedHref.startsWith(`${prefix}/`) ||
    normalizedHref.startsWith(`${prefix}?`) ||
    normalizedHref.startsWith(`${prefix}#`),
  );
}
