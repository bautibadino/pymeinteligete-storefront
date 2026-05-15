"use client";

import Link from "next/link";
import type { Route } from "next";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { CartShippingSelector } from "@/components/storefront/cart/cart-shipping-selector";
import { useStorefrontCart } from "@/components/storefront/cart/storefront-cart-provider";
import { buildCheckoutHrefFromCartItems } from "@/lib/cart/storefront-cart";
import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";
import { getShippingFinalCost } from "@/lib/shipping/checkout-shipping";
import type {
  StorefrontPaymentMethod,
  StorefrontPaymentMethods,
  StorefrontShippingQuoteOption,
} from "@/lib/types/storefront";

type StorefrontCartPageContentProps = {
  paymentMethods?: StorefrontPaymentMethods | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculatePaymentDiscountAmount(
  total: number,
  discount: StorefrontPaymentMethod["discount"],
): number {
  if (!discount || total <= 0) {
    return 0;
  }

  if (discount.type === "percentage") {
    return Math.max(0, Math.round((total * discount.value) / 100));
  }

  return Math.max(0, Math.min(total, discount.value));
}

function getBestPaymentDiscount(
  total: number,
  paymentMethods?: StorefrontPaymentMethods | null,
): { methodName: string; amount: number } | null {
  const methods = paymentMethods?.paymentMethods ?? [];

  return methods.reduce<{ methodName: string; amount: number } | null>((best, method) => {
    const amount = calculatePaymentDiscountAmount(total, method.discount);

    if (amount <= 0 || (best && best.amount >= amount)) {
      return best;
    }

    return { methodName: method.displayName, amount };
  }, null);
}

export function StorefrontCartPageContent({ paymentMethods = null }: StorefrontCartPageContentProps) {
  const {
    cartValidationMessage,
    clearCart,
    isCartValidationPending,
    items,
    itemsCount,
    removeItem,
    subtotal,
    updateQuantity,
  } = useStorefrontCart();
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<StorefrontShippingQuoteOption | null>(null);
  const checkoutHref = buildCheckoutHrefFromCartItems(items);
  const shippingCost = selectedShippingOption ? getShippingFinalCost(selectedShippingOption) : 0;
  const estimatedTotal = subtotal + shippingCost;
  const bestPaymentDiscount = getBestPaymentDiscount(estimatedTotal, paymentMethods);

  const handleSelectedShippingOptionChange = useCallback(
    (option: StorefrontShippingQuoteOption | null) => {
      setSelectedShippingOption(option);
    },
    [],
  );

  if (items.length === 0) {
    return (
      <section className="flex min-h-[360px] flex-col items-center justify-center gap-5 border border-border bg-paper px-6 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <ShoppingCart className="size-7" aria-hidden="true" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Tu carrito está vacío</h2>
          <p className="text-sm leading-6 text-muted">
            Sumá productos desde el catálogo y volvé para revisar cantidades, envío y total.
          </p>
        </div>
        <Button asChild>
          <Link href={"/catalogo" as Route} prefetch={shouldPrefetchStorefrontLink("/catalogo")}>
            Explorar catálogo
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <p className="text-sm font-semibold text-foreground">
            {itemsCount} {itemsCount === 1 ? "producto" : "productos"}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm("¿Vaciar carrito actual?")) {
                clearCart();
              }
            }}
          >
            Vaciar
          </Button>
        </div>

        <div className="divide-y divide-border border border-border bg-paper">
          {items.map((item) => (
            <article
              key={item.productId}
              className="grid gap-4 p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto]"
            >
              <div className="size-24 overflow-hidden bg-panel">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-gradient-to-br from-primary-soft to-accent-soft" />
                )}
              </div>

              <div className="min-w-0 space-y-2">
                {item.brand ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {item.brand}
                  </p>
                ) : null}
                <Link
                  href={item.href as Route}
                  className="line-clamp-2 text-base font-semibold text-foreground transition hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="text-sm font-semibold text-foreground">{item.price.formatted}</p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="inline-flex items-center border border-border bg-background">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-3 py-2 text-muted transition hover:bg-panel hover:text-foreground"
                    aria-label={`Restar una unidad de ${item.name}`}
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 py-2 text-muted transition hover:bg-panel hover:text-foreground"
                    aria-label={`Sumar una unidad de ${item.name}`}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-foreground"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Quitar
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="h-fit space-y-5 border border-border bg-paper p-5 lg:sticky lg:top-28">
        <CartShippingSelector
          items={items}
          onSelectedOptionChange={handleSelectedShippingOptionChange}
        />

        <div className="grid gap-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">
              {cartValidationMessage ? "Subtotal validado" : "Subtotal estimado"}
            </span>
            <strong className="text-foreground">{formatCurrency(subtotal)}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Envío seleccionado</span>
            <strong className="text-foreground">
              {selectedShippingOption ? formatCurrency(shippingCost) : "A seleccionar"}
            </strong>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold text-foreground">Total estimado</span>
            <strong className="text-lg text-foreground">{formatCurrency(estimatedTotal)}</strong>
          </div>
          {bestPaymentDiscount ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-950">
              Descuento por medio de pago al finalizar: hasta{" "}
              {formatCurrency(bestPaymentDiscount.amount)} con {bestPaymentDiscount.methodName}.
            </div>
          ) : null}
          {isCartValidationPending ? (
            <p className="text-xs font-medium text-muted-foreground">
              Validando precio y stock del carrito...
            </p>
          ) : null}
          {cartValidationMessage ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
              {cartValidationMessage}
            </div>
          ) : null}
        </div>

        {selectedShippingOption && !isCartValidationPending && !cartValidationMessage ? (
          <Button asChild className="w-full">
            <Link href={checkoutHref as Route}>Finalizar compra</Link>
          </Button>
        ) : (
          <Button className="w-full" disabled>
            {isCartValidationPending
              ? "Validando carrito..."
              : cartValidationMessage
                ? "Corregí el carrito para continuar"
                : "Seleccioná un envío para continuar"}
          </Button>
        )}
      </aside>
    </section>
  );
}
