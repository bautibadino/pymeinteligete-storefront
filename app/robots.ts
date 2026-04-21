import type { MetadataRoute } from "next";

import { buildTenantRobots, resolveTenantSeoSnapshot } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantRobots(snapshot);
}
