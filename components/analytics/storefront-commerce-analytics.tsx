"use client";

import { useEffect, useMemo, useRef } from "react";

import { trackStorefrontAnalyticsEvent } from "@/lib/analytics/client";
import type { StorefrontAnalyticsTrackCommand } from "@/lib/analytics/client";
import {
  buildSearchPayload,
  buildViewItemListPayload,
  buildViewItemPayload,
} from "@/lib/analytics/events";

export type StorefrontAnalyticsProduct = {
  id: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
};

function buildProductSignature(products: StorefrontAnalyticsProduct[]) {
  return products.map((product) => product.id).join("|");
}

export function buildProductViewAnalyticsCommand(
  product: StorefrontAnalyticsProduct,
): StorefrontAnalyticsTrackCommand {
  const payload = buildViewItemPayload({
    eventId: `view_${product.id}`,
    item: product,
  });

  return {
    event: "ViewContent",
    googleEvent: "view_item",
    metaEvent: "ViewContent",
    serverEvent: null,
    metaPayload: payload,
    googlePayload: payload,
    options: {
      eventId: payload.eventId,
    },
  };
}

export function buildSearchAnalyticsCommand({
  resultsCount,
  searchTerm,
}: {
  resultsCount?: number;
  searchTerm: string;
}): StorefrontAnalyticsTrackCommand {
  const payload = buildSearchPayload({
    eventId: `search_${searchTerm.toLowerCase().replace(/\s+/g, "_")}`,
    searchTerm,
    ...(resultsCount !== undefined ? { resultsCount } : {}),
  });

  return {
    event: "Search",
    googleEvent: "search",
    metaEvent: "Search",
    serverEvent: null,
    metaPayload: payload,
    googlePayload: payload,
    options: {
      eventId: payload.eventId,
    },
  };
}

export function ProductViewTracker({ product }: { product: StorefrontAnalyticsProduct | null }) {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product || trackedRef.current === product.id) {
      return;
    }

    trackedRef.current = product.id;
    trackStorefrontAnalyticsEvent(buildProductViewAnalyticsCommand(product));
  }, [product]);

  return null;
}

export function ProductListViewTracker({
  listId,
  listName,
  products,
}: {
  listId: string;
  listName: string;
  products: StorefrontAnalyticsProduct[];
}) {
  const trackedRef = useRef<string | null>(null);
  const signature = useMemo(() => `${listId}:${buildProductSignature(products)}`, [listId, products]);

  useEffect(() => {
    if (products.length === 0 || trackedRef.current === signature) {
      return;
    }

    trackedRef.current = signature;
    const payload = buildViewItemListPayload({
      eventId: `list_${listId}_${products.map((product) => product.id).join("_")}`,
      items: products,
      listId,
      listName,
    });

    trackStorefrontAnalyticsEvent({
      event: "view_item_list",
      googleEvent: "view_item_list",
      serverEvent: null,
      googlePayload: payload,
      options: {
        eventId: payload.eventId,
      },
    });
  }, [listId, listName, products, signature]);

  return null;
}

export function SearchTracker({
  resultsCount,
  searchTerm,
}: {
  resultsCount?: number;
  searchTerm?: string | null;
}) {
  const normalizedTerm = searchTerm?.trim();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!normalizedTerm || trackedRef.current === normalizedTerm) {
      return;
    }

    trackedRef.current = normalizedTerm;
    trackStorefrontAnalyticsEvent(
      buildSearchAnalyticsCommand({
        searchTerm: normalizedTerm,
        ...(resultsCount !== undefined ? { resultsCount } : {}),
      }),
    );
  }, [normalizedTerm, resultsCount]);

  return null;
}
