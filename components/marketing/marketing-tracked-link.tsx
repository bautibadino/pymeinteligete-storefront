"use client";

import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";

import { trackStorefrontAnalyticsEvent } from "@/lib/analytics/client";

const MARKETING_CONTENT_CATEGORY = "pyme-store-marketing";

type TrackCommand = Parameters<typeof trackStorefrontAnalyticsEvent>[0];

type TrackingTransport = {
  track: (command: TrackCommand) => void;
};

export type MarketingWhatsAppTracking = {
  kind: "whatsapp";
  label: string;
  metaEvent?: "Lead" | "Contact";
  surface: string;
};

export type MarketingStoreTracking = {
  href: string;
  kind: "store";
  label: string;
  surface: string;
};

export type MarketingCtaTracking = MarketingStoreTracking | MarketingWhatsAppTracking;

type MarketingTrackedLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "onClick"> & {
  children?: ReactNode;
  href?: string | undefined;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  tracking: MarketingCtaTracking;
};

export function buildMarketingWhatsAppPayload({
  label,
  surface,
}: Pick<MarketingWhatsAppTracking, "label" | "surface">) {
  return {
    content_category: MARKETING_CONTENT_CATEGORY,
    content_name: label,
    contact_method: "whatsapp",
    surface,
  };
}

export function buildMarketingStorePayload({
  href,
  label,
  surface,
}: Pick<MarketingStoreTracking, "href" | "label" | "surface">) {
  return {
    content_category: MARKETING_CONTENT_CATEGORY,
    content_name: label,
    content_type: "storefront_demo",
    link_url: href,
    surface,
  };
}

export function trackMarketingCta(
  tracking: MarketingCtaTracking,
  transport: TrackingTransport = { track: trackStorefrontAnalyticsEvent },
) {
  if (tracking.kind === "whatsapp") {
    const payload = buildMarketingWhatsAppPayload(tracking);

    transport.track({
      event: "generate_lead",
      googlePayload: payload,
    });
    transport.track({
      event: tracking.metaEvent ?? "Lead",
      metaPayload: payload,
    });
    return;
  }

  transport.track({
    event: "select_content",
    googlePayload: buildMarketingStorePayload(tracking),
  });
}

export function MarketingTrackedLink({
  children,
  href,
  onClick,
  tracking,
  ...props
}: MarketingTrackedLinkProps) {
  if (!href) {
    const { target: _target, rel: _rel, ...disabledProps } = props;

    return (
      <span {...disabledProps} aria-disabled="true" role="link">
        {children}
      </span>
    );
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackMarketingCta(tracking);
    onClick?.(event);
  }

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
