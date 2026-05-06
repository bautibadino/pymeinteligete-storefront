"use client";

import Script from "next/script";
import { useEffect, useMemo, type ReactNode } from "react";

import { installStorefrontAnalyticsBridge } from "@/lib/analytics/client";
import { resolveStorefrontAnalyticsConfig } from "@/lib/analytics/config";
import { resolveAnalyticsIdentity } from "@/lib/analytics/identity";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

type StorefrontAnalyticsProviderProps = {
  children: ReactNode;
  bootstrap: StorefrontBootstrap | null;
  host: string;
};

function persistCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") {
    return;
  }

  const attributes = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
  ];

  if (window.location.protocol === "https:") {
    attributes.push("Secure");
  }

  document.cookie = attributes.join("; ");
}

function renderMetaBootstrap(pixelId: string) {
  return `
    window.fbq = window.fbq || function() {
      (window.fbq.q = window.fbq.q || []).push(arguments);
    };
    if (!window._fbq) {
      window._fbq = window.fbq;
    }
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window.fbq.queue = window.fbq.queue || [];
    window.fbq("init", ${JSON.stringify(pixelId)});
    window.fbq("track", "PageView");
  `;
}

function renderGoogleBootstrap(measurementId: string) {
  return `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    window.gtag("js", new Date());
    window.gtag("config", ${JSON.stringify(measurementId)}, { send_page_view: true });
  `;
}

export function StorefrontAnalyticsProvider({
  bootstrap,
  children,
  host,
}: StorefrontAnalyticsProviderProps) {
  const config = useMemo(() => resolveStorefrontAnalyticsConfig(bootstrap), [bootstrap]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const identity = resolveAnalyticsIdentity({
      cookie: document.cookie,
      hostname: host,
      persistCookie,
      search: window.location.search,
      storage: window.localStorage,
    });

    installStorefrontAnalyticsBridge(config, identity);
  }, [config, host]);

  return (
    <>
      {config.meta.enabled && config.meta.pixelId ? (
        <>
          <Script
            id="storefront-meta-pixel"
            strategy="afterInteractive"
            src="https://connect.facebook.net/en_US/fbevents.js"
          />
          <Script id="storefront-meta-pixel-init" strategy="afterInteractive">
            {renderMetaBootstrap(config.meta.pixelId)}
          </Script>
        </>
      ) : null}
      {config.google.enabled && config.google.measurementId ? (
        <>
          <Script
            id="storefront-google-analytics"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.google.measurementId)}`}
          />
          <Script id="storefront-google-analytics-init" strategy="afterInteractive">
            {renderGoogleBootstrap(config.google.measurementId)}
          </Script>
        </>
      ) : null}
      {children}
    </>
  );
}
