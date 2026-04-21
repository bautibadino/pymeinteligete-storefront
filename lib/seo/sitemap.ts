import type { MetadataRoute } from "next";

import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type { TenantSeoSnapshot } from "@/lib/seo/types";

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

export function buildTenantSitemap(snapshot: TenantSeoSnapshot): MetadataRoute.Sitemap {
  if (!snapshot.indexable || !snapshot.sitemapEnabled) {
    return [];
  }

  // TODO: sumar categorias y productos reales cuando el contrato de catalogo exponga URLs
  // canónicas o un feed seguro para indexación por tenant.
  return DEFAULT_SITEMAP_PATHS.map((entry) => ({
    url: buildCanonicalUrl(snapshot.canonicalBaseUrl, entry.pathname),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
