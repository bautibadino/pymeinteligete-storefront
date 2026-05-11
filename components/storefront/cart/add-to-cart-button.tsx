"use client";

import { ShoppingCart } from "lucide-react";

import { useStorefrontCart } from "@/components/storefront/cart/storefront-cart-provider";
import { Button, type ButtonProps } from "@/components/ui/button";
import { trackStorefrontAnalyticsEvent } from "@/lib/analytics/client";
import { buildAddToCartPayload } from "@/lib/analytics/events";
import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";

type AddToCartButtonProps = Omit<ButtonProps, "onClick"> & {
  item: Omit<StorefrontCartItem, "quantity">;
  label?: string;
  quantity?: number;
  unavailableLabel?: string;
};

export function AddToCartButton({
  disabled,
  item,
  label = "Agregar al carrito",
  quantity = 1,
  unavailableLabel = "No disponible",
  children,
  ...props
}: AddToCartButtonProps) {
  const { addItem } = useStorefrontCart();

  return (
    <Button
      {...props}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          addItem(item, quantity);
          const payload = buildAddToCartPayload({
            eventId: `add_cart_${item.productId}_${Date.now()}`,
            item: {
              id: item.productId,
              name: item.name,
              price: item.price.amount,
              ...(item.brand ? { brand: item.brand } : {}),
            },
            quantity,
          });

          trackStorefrontAnalyticsEvent({
            event: "AddToCart",
            googleEvent: "add_to_cart",
            metaEvent: "AddToCart",
            metaPayload: payload,
            googlePayload: payload,
            options: {
              eventId: payload.eventId,
            },
          });
        }
      }}
    >
      <ShoppingCart className="mr-2 size-4" aria-hidden="true" />
      {disabled ? unavailableLabel : children ?? label}
    </Button>
  );
}
