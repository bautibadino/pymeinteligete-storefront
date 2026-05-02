"use client";

import Link from "next/link";
import type { Route } from "next";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import {
  buildCheckoutHrefFromCartItems,
  type StorefrontCartItem,
  type StorefrontCartUiMode,
} from "@/lib/cart/storefront-cart";
import { cn } from "@/lib/utils/cn";

type StorefrontCartContextValue = {
  addItem: (item: Omit<StorefrontCartItem, "quantity">, quantity?: number) => void;
  clearCart: () => void;
  closeCart: () => void;
  isOpen: boolean;
  items: StorefrontCartItem[];
  itemsCount: number;
  openCart: () => void;
  removeItem: (productId: string) => void;
  subtotal: number;
  toggleCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
};

const DEFAULT_CONTEXT: StorefrontCartContextValue = {
  addItem: () => undefined,
  clearCart: () => undefined,
  closeCart: () => undefined,
  isOpen: false,
  items: [],
  itemsCount: 0,
  openCart: () => undefined,
  removeItem: () => undefined,
  subtotal: 0,
  toggleCart: () => undefined,
  updateQuantity: () => undefined,
};

const StorefrontCartContext = createContext<StorefrontCartContextValue>(DEFAULT_CONTEXT);

type StorefrontCartProviderProps = {
  children: ReactNode;
  host: string;
  mode?: StorefrontCartUiMode;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function mergeCartItems(
  current: StorefrontCartItem[],
  item: Omit<StorefrontCartItem, "quantity">,
  quantity: number,
) {
  const normalizedQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const existing = current.find((entry) => entry.productId === item.productId);

  if (!existing) {
    return [...current, { ...item, quantity: normalizedQuantity }];
  }

  return current.map((entry) =>
    entry.productId === item.productId
      ? {
          ...entry,
          ...item,
          quantity: entry.quantity + normalizedQuantity,
        }
      : entry,
  );
}

function readStoredCart(storageKey: string): StorefrontCartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return [];
      }

      const record = entry as Partial<StorefrontCartItem>;
      const productId = typeof record.productId === "string" ? record.productId : undefined;
      const slug = typeof record.slug === "string" ? record.slug : undefined;
      const name = typeof record.name === "string" ? record.name : undefined;
      const href = typeof record.href === "string" ? record.href : undefined;
      const price =
        record.price &&
        typeof record.price === "object" &&
        typeof record.price.amount === "number" &&
        typeof record.price.formatted === "string"
          ? {
              amount: record.price.amount,
              formatted: record.price.formatted,
              ...(typeof record.price.currency === "string"
                ? { currency: record.price.currency }
                : {}),
            }
          : undefined;
      const quantity =
        typeof record.quantity === "number" && Number.isFinite(record.quantity) && record.quantity > 0
          ? record.quantity
          : 1;

      if (!productId || !slug || !name || !href || !price) {
        return [];
      }

      return [
        {
          productId,
          slug,
          name,
          href,
          price,
          quantity,
          ...(typeof record.brand === "string" ? { brand: record.brand } : {}),
          ...(typeof record.imageUrl === "string" ? { imageUrl: record.imageUrl } : {}),
        },
      ];
    });
  } catch {
    return [];
  }
}

function FloatingCartButton({
  itemsCount,
  onClick,
  subtotal,
}: {
  itemsCount: number;
  onClick: () => void;
  subtotal: number;
}) {
  if (itemsCount === 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-3 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-2xl transition hover:opacity-95"
      aria-label={`Abrir carrito con ${itemsCount} items`}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/14">
        <ShoppingCart className="size-4" aria-hidden="true" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span>{itemsCount} {itemsCount === 1 ? "item" : "items"}</span>
        <span className="text-[11px] font-medium text-primary-foreground/80">
          {formatCurrency(subtotal)}
        </span>
      </span>
    </button>
  );
}

function StorefrontCartSurface({
  clearCart,
  closeCart,
  items,
  itemsCount,
  isOpen,
  mode,
  openCart,
  removeItem,
  subtotal,
  updateQuantity,
}: Omit<StorefrontCartContextValue, "addItem" | "toggleCart"> & {
  mode: StorefrontCartUiMode;
}) {
  const checkoutHref = buildCheckoutHrefFromCartItems(items);

  return (
    <>
      {mode === "floating-drawer" ? (
        <FloatingCartButton itemsCount={itemsCount} subtotal={subtotal} onClick={openCart} />
      ) : null}
      {isOpen ? (
        <div className="fixed inset-0 z-[80] bg-black/30" aria-hidden="true" onClick={closeCart} />
      ) : null}
      <aside
        aria-hidden={!isOpen}
        className={cn(
          "fixed right-0 top-0 z-[90] flex h-dvh w-full max-w-md flex-col border-l border-border bg-paper shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Carrito
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              {itemsCount} {itemsCount === 1 ? "producto" : "productos"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-muted transition hover:bg-panel hover:text-foreground"
            aria-label="Cerrar carrito"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {items.length > 0 ? (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {items.map((item) => (
                <article
                  key={item.productId}
                  className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-panel p-3"
                >
                  <div className="overflow-hidden rounded-xl bg-panel-strong">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-[72px] w-[72px] object-cover"
                      />
                    ) : (
                      <div className="h-[72px] w-[72px] bg-gradient-to-br from-primary-soft to-accent-soft" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      {item.brand ? (
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                          {item.brand}
                        </p>
                      ) : null}
                      <Link
                        href={item.href as Route}
                        onClick={closeCart}
                        className="line-clamp-2 text-sm font-semibold text-foreground transition hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm font-semibold text-foreground">
                        {item.price.formatted}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-border bg-paper">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="rounded-l-full px-3 py-1.5 text-muted transition hover:bg-panel hover:text-foreground"
                          aria-label={`Restar una unidad de ${item.name}`}
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="rounded-r-full px-3 py-1.5 text-muted transition hover:bg-panel hover:text-foreground"
                          aria-label={`Sumar una unidad de ${item.name}`}
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-foreground"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Quitar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="space-y-4 border-t border-border px-5 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal estimado</span>
                <strong className="text-base text-foreground">{formatCurrency(subtotal)}</strong>
              </div>
              <div className="grid gap-2">
                <Button asChild className="w-full">
                  <Link href={checkoutHref as Route} onClick={closeCart}>
                    Iniciar checkout
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (window.confirm("¿Vaciar carrito actual?")) {
                      clearCart();
                    }
                  }}
                >
                  Vaciar carrito
                </Button>
                <Button variant="outline" className="w-full" onClick={closeCart}>
                  Seguir mirando
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <ShoppingCart className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Tu carrito está vacío</h3>
              <p className="text-sm text-muted">
                Sumá productos desde el catálogo y armá un checkout real sin salir del storefront.
              </p>
            </div>
            <Button asChild onClick={closeCart}>
              <Link href={"/catalogo" as Route}>Explorar catálogo</Link>
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}

export function StorefrontCartProvider({
  children,
  host,
  mode = "floating-drawer",
}: StorefrontCartProviderProps) {
  const storageKey = `pyme-storefront-cart:v2:${host}`;
  const [items, setItems] = useState<StorefrontCartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(readStoredCart(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const itemsCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price.amount * item.quantity, 0);

  const value: StorefrontCartContextValue = {
    addItem(item, quantity = 1) {
      setItems((current) => mergeCartItems(current, item, quantity));
      setIsOpen(true);
    },
    clearCart() {
      setItems([]);
    },
    closeCart() {
      setIsOpen(false);
    },
    isOpen,
    items,
    itemsCount,
    openCart() {
      setIsOpen(true);
    },
    removeItem(productId) {
      setItems((current) => current.filter((item) => item.productId !== productId));
    },
    subtotal,
    toggleCart() {
      setIsOpen((current) => !current);
    },
    updateQuantity(productId, quantity) {
      if (quantity <= 0) {
        setItems((current) => current.filter((item) => item.productId !== productId));
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      );
    },
  };

  return (
    <StorefrontCartContext.Provider value={value}>
      {children}
      <StorefrontCartSurface
        clearCart={value.clearCart}
        closeCart={value.closeCart}
        isOpen={value.isOpen}
        items={value.items}
        itemsCount={value.itemsCount}
        mode={mode}
        openCart={value.openCart}
        removeItem={value.removeItem}
        subtotal={value.subtotal}
        updateQuantity={value.updateQuantity}
      />
    </StorefrontCartContext.Provider>
  );
}

export function useStorefrontCart() {
  return useContext(StorefrontCartContext);
}
