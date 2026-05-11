import type { MetadataRoute } from "next";

import {
  buildPymeStoreRobots,
  isPymeStoreMarketingHost,
} from "@/lib/marketing/pyme-store-seo";
import {
  buildTenantRobots,
  getTenantSeoRequestContext,
  resolveTenantSeoSnapshotByRequest,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestContext = await getTenantSeoRequestContext();

  if (isPymeStoreMarketingHost(requestContext.resolvedHost)) {
    return buildPymeStoreRobots();
  }

  const snapshot = await resolveTenantSeoSnapshotByRequest(requestContext);

  return buildTenantRobots(snapshot);
}
