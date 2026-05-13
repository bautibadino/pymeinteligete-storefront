import type { MetadataRoute } from "next";

import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type { TenantSeoSnapshot } from "@/lib/seo/types";

const DISALLOWED_PATHS = [
  "/checkout",
  "/checkout/",
  "/checkout/confirmacion",
  "/api/",
  "/*?page=*",
  "/*&page=*",
  "/*?search=*",
  "/*&search=*",
  "/*?brand=*",
  "/*&brand=*",
  "/*?family=*",
  "/*&family=*",
  "/*?sort=*",
  "/*&sort=*",
  "/*?sortBy=*",
  "/*&sortBy=*",
  "/*?sortOrder=*",
  "/*&sortOrder=*",
] as const;

export function buildTenantRobots(snapshot: TenantSeoSnapshot): MetadataRoute.Robots {
  if (!snapshot.indexable) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: buildCanonicalUrl(snapshot.canonicalBaseUrl, "/sitemap.xml"),
      host: snapshot.canonicalHost,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...DISALLOWED_PATHS],
    },
    sitemap: snapshot.sitemapEnabled
      ? buildCanonicalUrl(snapshot.canonicalBaseUrl, "/sitemap.xml")
      : undefined,
    host: snapshot.canonicalHost,
  };
}
