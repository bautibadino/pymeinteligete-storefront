"use client";

import { useEffect } from "react";

import { trackStorefrontAnalyticsEvent } from "@/lib/analytics/client";
import { buildPurchasePayload } from "@/lib/analytics/events";
import { markTrackedEvent } from "@/lib/analytics/storage";
import { useStorefrontCart } from "@/components/storefront/cart/storefront-cart-provider";
import {
  shouldClearCartForOrder,
  shouldTrackPurchase,
} from "@/lib/checkout/post-checkout";
import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";
import { identifyCheckoutAnalyticsBuyer } from "./analytics-identity";

type CheckoutPostPurchaseEffectsProps = {
  order: StorefrontOrderByTokenResult;
};

export function CheckoutPostPurchaseEffects({
  order,
}: CheckoutPostPurchaseEffectsProps) {
  const { clearCart, items } = useStorefrontCart();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (shouldTrackPurchase(order) && markTrackedEvent(window.localStorage, `purchase:${order.orderNumber}`)) {
      identifyCheckoutAnalyticsBuyer({
        ...(order.customer.name ? { name: order.customer.name } : {}),
        ...(order.customer.email ? { email: order.customer.email } : {}),
        ...(order.customer.phone ? { phone: order.customer.phone } : {}),
        ...(order.shippingAddress.city ? { city: order.shippingAddress.city } : {}),
        ...(order.shippingAddress.province
          ? { province: order.shippingAddress.province }
          : {}),
        ...(order.shippingAddress.postalCode
          ? { postalCode: order.shippingAddress.postalCode }
          : {}),
      });

      const payload = buildPurchasePayload(order);
      trackStorefrontAnalyticsEvent({
        event: "Purchase",
        googleEvent: "purchase",
        metaEvent: "Purchase",
        metaPayload: payload,
        googlePayload: payload,
        options: {
          eventId: payload.eventId,
        },
      });
    }

    if (shouldClearCartForOrder(order, items) && markTrackedEvent(window.localStorage, `order-cleared:${order.orderNumber}`)) {
      clearCart();
    }
  }, [clearCart, items, order]);

  return null;
}
