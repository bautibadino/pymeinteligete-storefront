import { getServerEnvSnapshot } from "@/lib/env/server-env";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

import { getBootstrapForSeo } from "@/lib/seo/bootstrap";
import { resolveCanonicalBaseUrl } from "@/lib/seo/canonical";
import { getTenantSeoRequestContext } from "@/lib/seo/request-context";
import { resolveTenantSeoRules } from "@/lib/seo/rules";
import type { TenantSeoRequestContext, TenantSeoSnapshot } from "@/lib/seo/types";
import { getStringValue, pickFirstString } from "@/lib/seo/utils";

function resolveTenantTitle(bootstrap: StorefrontBootstrap | null, host: string): string {
  return (
    pickFirstString(
      getStringValue(bootstrap?.seo, "defaultTitle"),
      getStringValue(bootstrap?.branding, "storeName"),
      getStringValue(bootstrap?.tenant, "displayName"),
      getStringValue(bootstrap?.tenant, "tenantSlug"),
      host,
    ) ?? host
  );
}

function resolveTenantDescription(bootstrap: StorefrontBootstrap | null): string | null {
  return pickFirstString(getStringValue(bootstrap?.seo, "defaultDescription"));
}

function resolveTenantOgImageUrl(bootstrap: StorefrontBootstrap | null): string | null {
  return pickFirstString(getStringValue(bootstrap?.seo, "ogImage"));
}

function resolveTenantFaviconUrl(bootstrap: StorefrontBootstrap | null): string | null {
  return pickFirstString(getStringValue(bootstrap?.branding, "faviconUrl"));
}

export async function resolveTenantSeoSnapshotByRequest(
  requestContext: TenantSeoRequestContext,
): Promise<TenantSeoSnapshot> {
  const [{ bootstrap, issues }, env] = await Promise.all([
    getBootstrapForSeo(requestContext),
    Promise.resolve(getServerEnvSnapshot()),
  ]);
  const canonicalBaseUrl = resolveCanonicalBaseUrl(bootstrap, requestContext);
  const rules = resolveTenantSeoRules({
    bootstrap,
    nodeEnv: env.nodeEnv,
  });

  return {
    bootstrap,
    canonicalBaseUrl,
    canonicalHost: canonicalBaseUrl.host,
    resolvedHost: requestContext.resolvedHost,
    shopStatus: rules.shopStatus,
    title: resolveTenantTitle(bootstrap, requestContext.resolvedHost),
    description: resolveTenantDescription(bootstrap),
    ogImageUrl: resolveTenantOgImageUrl(bootstrap),
    faviconUrl: resolveTenantFaviconUrl(bootstrap),
    indexable: rules.indexable,
    allowIndexing: rules.allowIndexing,
    sitemapEnabled: rules.sitemapEnabled,
    issues,
  };
}

export async function resolveTenantSeoSnapshot(): Promise<TenantSeoSnapshot> {
  const requestContext = await getTenantSeoRequestContext();

  return resolveTenantSeoSnapshotByRequest(requestContext);
}
