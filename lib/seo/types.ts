import type { Metadata } from "next";

import type { ShopStatus, StorefrontBootstrap } from "@/lib/storefront-api";

export type TenantSeoRequestContext = {
  protocol: "http" | "https";
  requestHost: string;
  resolvedHost: string;
  requestOrigin: URL;
  tenantSlug?: string;
};

export type TenantSeoSnapshot = {
  bootstrap: StorefrontBootstrap | null;
  canonicalBaseUrl: URL;
  canonicalHost: string;
  resolvedHost: string;
  shopStatus: ShopStatus | null;
  title: string;
  description: string | null;
  ogImageUrl: string | null;
  faviconUrl: string | null;
  indexable: boolean;
  allowIndexing: boolean;
  sitemapEnabled: boolean;
  issues: string[];
};

export type TenantMetadataOptions = {
  pathname?: string;
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  noIndex?: boolean;
};

export type TenantSitemapEntry = NonNullable<ReturnType<() => Metadata["alternates"]>>;
