import type { ShopStatus, StorefrontBootstrap } from "@/lib/storefront-api";

import { getBooleanValue, getNestedRecord } from "@/lib/seo/utils";

type TenantSeoRuleOptions = {
  bootstrap: StorefrontBootstrap | null;
  nodeEnv: string;
};

function resolveIndexableByShopStatus(shopStatus: ShopStatus | null): boolean {
  if (shopStatus === "draft" || shopStatus === "disabled") {
    return false;
  }

  return shopStatus === "active" || shopStatus === "paused";
}

function resolveTenantOverride(bootstrap: StorefrontBootstrap | null): {
  allowIndexing: boolean | null;
  sitemapEnabled: boolean | null;
} {
  const seo = bootstrap?.seo;
  const robots = getNestedRecord(seo, "robots");

  const noIndex = getBooleanValue(seo, "noindex") ?? getBooleanValue(robots, "noindex");
  const explicitIndex =
    getBooleanValue(seo, "indexable") ??
    getBooleanValue(seo, "allowIndexing") ??
    getBooleanValue(robots, "index");
  const explicitSitemap =
    getBooleanValue(seo, "sitemapEnabled") ?? getBooleanValue(seo, "includeInSitemap");

  const allowIndexing =
    noIndex === true ? false : explicitIndex !== null ? explicitIndex : null;

  return {
    allowIndexing,
    sitemapEnabled: explicitSitemap,
  };
}

export function resolveTenantSeoRules({
  bootstrap,
  nodeEnv,
}: TenantSeoRuleOptions): {
  shopStatus: ShopStatus | null;
  allowIndexing: boolean;
  indexable: boolean;
  sitemapEnabled: boolean;
} {
  const shopStatus = bootstrap?.shopStatus ?? null;
  const baseIndexable = resolveIndexableByShopStatus(shopStatus);
  const tenantOverride = resolveTenantOverride(bootstrap);
  const environmentAllowsIndexing = nodeEnv === "production";
  const tenantAllowsIndexing =
    tenantOverride.allowIndexing !== null ? tenantOverride.allowIndexing : true;
  const allowIndexing = baseIndexable && tenantAllowsIndexing;
  const indexable = environmentAllowsIndexing && allowIndexing;
  const tenantAllowsSitemap =
    tenantOverride.sitemapEnabled !== null ? tenantOverride.sitemapEnabled : true;
  const sitemapEnabled = indexable && tenantAllowsSitemap;

  return {
    shopStatus,
    allowIndexing,
    indexable,
    sitemapEnabled,
  };
}
