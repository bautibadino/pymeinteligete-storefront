import type { ShopStatus, StorefrontBootstrap } from "@/lib/storefront-api";

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

export function resolveTenantSeoRules({
  bootstrap,
  nodeEnv,
}: TenantSeoRuleOptions): {
  shopStatus: ShopStatus | null;
  allowIndexing: boolean;
  indexable: boolean;
  sitemapEnabled: boolean;
} {
  const shopStatus = bootstrap?.tenant.status ?? null;
  const baseIndexable = resolveIndexableByShopStatus(shopStatus);
  const environmentAllowsIndexing = nodeEnv === "production";
  const allowIndexing = baseIndexable;
  const indexable = environmentAllowsIndexing && allowIndexing;
  const sitemapEnabled = indexable;

  return {
    shopStatus,
    allowIndexing,
    indexable,
    sitemapEnabled,
  };
}
