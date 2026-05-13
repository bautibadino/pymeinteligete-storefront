import type { MetadataRoute } from "next";

import {
  buildPymeStoreSitemap,
  isPymeStoreMarketingHost,
} from "@/lib/marketing/pyme-store-seo";
import {
  buildTenantSitemap,
  getTenantSeoRequestContext,
  resolveTenantSeoSnapshotByRequest,
} from "@/lib/seo";
import { getTenantSitemapData } from "@/lib/seo/sitemap-data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestContext = await getTenantSeoRequestContext();

  if (isPymeStoreMarketingHost(requestContext.resolvedHost)) {
    return buildPymeStoreSitemap();
  }

  const [snapshot, data] = await Promise.all([
    resolveTenantSeoSnapshotByRequest(requestContext),
    getTenantSitemapData(),
  ]);

  return buildTenantSitemap(snapshot, data.categories, data.products);
}
