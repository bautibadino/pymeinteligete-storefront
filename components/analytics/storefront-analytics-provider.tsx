"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, type ReactNode } from "react";

import { installStorefrontAnalyticsBridge } from "@/lib/analytics/client";
import type { StorefrontAnalyticsTrackCommand } from "@/lib/analytics/client";
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
  `;
}

function renderGoogleBootstrap(measurementId: string) {
  return `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    window.gtag("js", new Date());
    window.gtag("config", ${JSON.stringify(measurementId)}, { send_page_view: false });
  `;
}

export function buildPageViewAnalyticsCommand({
  href,
  path,
  title,
}: {
  href: string;
  path: string;
  title: string;
}): StorefrontAnalyticsTrackCommand {
  return {
    event: "PageView",
    googleEvent: "page_view",
    metaEvent: "PageView",
    serverEvent: null,
    metaPayload: {
      page_path: path,
    },
    googlePayload: {
      page_path: path,
      page_location: href,
      page_title: title,
    },
  };
}

export function StorefrontAnalyticsProvider({
  bootstrap,
  children,
  host,
}: StorefrontAnalyticsProviderProps) {
  const config = useMemo(() => resolveStorefrontAnalyticsConfig(bootstrap), [bootstrap]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPageRef = useRef<string | null>(null);

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

    const bridge = installStorefrontAnalyticsBridge(config, identity);
    const query = searchParams.toString();
    const path = `${pathname}${query ? `?${query}` : ""}`;

    if (bridge && lastTrackedPageRef.current !== path) {
      lastTrackedPageRef.current = path;
      bridge.track(
        buildPageViewAnalyticsCommand({
          href: window.location.href,
          path,
          title: document.title,
        }),
      );
    }
  }, [config, host, pathname, searchParams]);

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
