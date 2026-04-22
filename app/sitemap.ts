import type { MetadataRoute } from "next";

import { buildTenantSitemap, resolveTenantSeoSnapshot } from "@/lib/seo";
import { getTenantSitemapData } from "@/lib/seo/sitemap-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [snapshot, data] = await Promise.all([resolveTenantSeoSnapshot(), getTenantSitemapData()]);

  return buildTenantSitemap(snapshot, data.categories, data.products);
}
