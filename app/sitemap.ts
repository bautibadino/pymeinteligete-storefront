import type { MetadataRoute } from "next";

import { buildTenantSitemap, resolveTenantSeoSnapshot } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantSitemap(snapshot);
}
