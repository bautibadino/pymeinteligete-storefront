import type { MetadataRoute } from "next";

import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type { TenantSeoSnapshot } from "@/lib/seo/types";
import type { StorefrontCategory, StorefrontCatalogProduct } from "@/lib/storefront-api";

type SitemapPathConfig = {
  pathname: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

const DEFAULT_SITEMAP_PATHS: SitemapPathConfig[] = [
  {
    pathname: "/",
    changeFrequency: "daily",
    priority: 1,
  },
  {
    pathname: "/catalogo",
    changeFrequency: "daily",
    priority: 0.8,
  },
];

function buildCategorySitemapEntries(
  baseUrl: URL,
  categories: StorefrontCategory[],
): MetadataRoute.Sitemap {
  return categories
    .filter((category): category is StorefrontCategory & { slug: string } =>
      typeof category.slug === "string" && category.slug.trim().length > 0,
    )
    .map((category) => ({
      url: buildCanonicalUrl(baseUrl, `/catalogo?category=${encodeURIComponent(category.slug)}`),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
}

function buildProductSitemapEntries(
  baseUrl: URL,
  products: StorefrontCatalogProduct[],
): MetadataRoute.Sitemap {
  return products
    .filter((product): product is StorefrontCatalogProduct & { slug: string } =>
      typeof product.slug === "string" && product.slug.trim().length > 0,
    )
    .map((product) => ({
      url: buildCanonicalUrl(baseUrl, `/producto/${encodeURIComponent(product.slug)}`),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
}

export function buildTenantSitemap(
  snapshot: TenantSeoSnapshot,
  categories: StorefrontCategory[] = [],
  products: StorefrontCatalogProduct[] = [],
): MetadataRoute.Sitemap {
  if (!snapshot.indexable || !snapshot.sitemapEnabled) {
    return [];
  }

  const baseEntries: MetadataRoute.Sitemap = DEFAULT_SITEMAP_PATHS.map((entry) => ({
    url: buildCanonicalUrl(snapshot.canonicalBaseUrl, entry.pathname),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const categoryEntries = buildCategorySitemapEntries(snapshot.canonicalBaseUrl, categories);
  const productEntries = buildProductSitemapEntries(snapshot.canonicalBaseUrl, products);

  return [...baseEntries, ...categoryEntries, ...productEntries];
}
