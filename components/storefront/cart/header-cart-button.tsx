"use client";

import { ShoppingCart } from "lucide-react";

import { useStorefrontCart } from "@/components/storefront/cart/storefront-cart-provider";
import { cn } from "@/lib/utils/cn";

type HeaderCartButtonProps = {
  badgeClassName?: string;
  className?: string;
  iconClassName?: string;
};

export function HeaderCartButton({
  badgeClassName,
  className,
  iconClassName,
}: HeaderCartButtonProps) {
  const { itemsCount, openCart } = useStorefrontCart();

  return (
    <button
      type="button"
      aria-label={`Carrito (${itemsCount} ${itemsCount === 1 ? "item" : "items"})`}
      className={cn("relative rounded-md p-2 text-muted transition-colors hover:bg-panel hover:text-foreground", className)}
      onClick={openCart}
    >
      <ShoppingCart className={cn("size-5", iconClassName)} aria-hidden="true" />
      <span
        aria-hidden="true"
        className={cn(
          "absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-pill bg-primary px-1 text-[10px] font-bold text-primary-foreground",
          itemsCount > 0 ? "h-4" : "h-4 opacity-80",
          badgeClassName,
        )}
      >
        {itemsCount}
      </span>
    </button>
  );
}
