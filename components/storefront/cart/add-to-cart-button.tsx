"use client";

import { ShoppingCart } from "lucide-react";

import { useStorefrontCart } from "@/components/storefront/cart/storefront-cart-provider";
import { Button, type ButtonProps } from "@/components/ui/button";
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
        }
      }}
    >
      <ShoppingCart className="mr-2 size-4" aria-hidden="true" />
      {disabled ? unavailableLabel : children ?? label}
    </Button>
  );
}
