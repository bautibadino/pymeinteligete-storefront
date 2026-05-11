"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { MapPin, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { trackStorefrontAnalyticsEvent } from "@/lib/analytics/client";
import { buildAddShippingInfoPayload } from "@/lib/analytics/events";
import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";
import {
  isShippingCheckoutSnapshotExpired,
  normalizeStoredShippingCheckoutSnapshot,
} from "@/lib/shipping/checkout-shipping";
import { buildShippingQuotePackageFromCartItems } from "@/lib/shipping/product-package";
import {
  clearSelectedShippingOption,
  normalizeShippingPostalCode,
  persistSelectedShippingOption,
  persistShippingPostalCode,
  readStoredShippingPostalCode,
  readStoredSelectedShippingOption,
} from "@/lib/shipping/postal-code-storage";
import {
  StorefrontShippingQuoteError,
  postStorefrontShippingQuote,
} from "@/lib/shipping/shipping-quote-client";
import type {
  StorefrontShippingCheckoutSnapshot,
  StorefrontShippingQuoteOption,
  StorefrontShippingQuoteResponse,
} from "@/lib/types/storefront";
import { cn } from "@/lib/utils/cn";

type CartShippingSelectorProps = {
  className?: string;
  items: StorefrontCartItem[];
  onSelectedOptionChange: (option: StorefrontShippingQuoteOption | null) => void;
};

function formatMoney(amount: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getUnavailableQuoteMessage(quote: StorefrontShippingQuoteResponse): string {
  if (quote.reason === "SHIPPING_PROVIDER_NOT_CONFIGURED") {
    return "El cotizador todavía no está configurado para esta tienda.";
  }

  if (quote.reason === "ORIGIN_POSTAL_CODE_NOT_CONFIGURED") {
    return "La tienda todavía no configuró el origen de despacho.";
  }

  return "No hay opciones de envío disponibles para ese código postal.";
}

function getQuoteErrorMessage(error: unknown): string {
  if (error instanceof StorefrontShippingQuoteError && error.status && error.status < 500) {
    return "No pudimos cotizar ese código postal. Revisalo e intentá nuevamente.";
  }

  return "No pudimos cotizar el envío en este momento.";
}

export function CartShippingSelector({
  className,
  items,
  onSelectedOptionChange,
}: CartShippingSelectorProps) {
  const [postalCode, setPostalCode] = useState("");
  const [quote, setQuote] = useState<StorefrontShippingQuoteResponse | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const trackedShippingRef = useRef<string | null>(null);

  const quotePackage = buildShippingQuotePackageFromCartItems(items);
  const options = quote?.options ?? [];

  useEffect(() => {
    const storedPostalCode = readStoredShippingPostalCode(window.localStorage);
    if (storedPostalCode) {
      setPostalCode(storedPostalCode);
    }

    const storedSnapshot = normalizeStoredShippingCheckoutSnapshot(
      readStoredSelectedShippingOption<StorefrontShippingCheckoutSnapshot>(window.localStorage),
    );
    if (storedSnapshot?.optionId) {
      if (isShippingCheckoutSnapshotExpired(storedSnapshot)) {
        clearSelectedShippingOption(window.localStorage);
        return;
      }

      setSelectedOptionId(storedSnapshot.optionId);
    }
  }, []);

  useEffect(() => {
    const selectedOption =
      options.find((option) => option.optionId === selectedOptionId) ?? null;

    onSelectedOptionChange(selectedOption);

    if (selectedOption) {
      persistSelectedShippingOption(window.localStorage, selectedOption.checkoutSnapshot);
      const analyticsItems = items.map((item) => ({
        id: item.productId,
        name: item.name,
        price: item.price.amount,
        quantity: item.quantity,
        ...(item.brand ? { brand: item.brand } : {}),
      }));
      const cartSignature = analyticsItems
        .map((item) => `${item.id}:${item.quantity}:${item.price}`)
        .join("|");
      const trackingKey = `${selectedOption.optionId}:${selectedOption.checkoutSnapshot.destinationPostalCode}:${cartSignature}`;

      if (trackedShippingRef.current !== trackingKey && analyticsItems.length > 0) {
        trackedShippingRef.current = trackingKey;
        const cartValue = analyticsItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
        const payload = buildAddShippingInfoPayload({
          eventId: `shipping_${selectedOption.optionId}_${Date.now()}`,
          items: analyticsItems,
          shippingAmount: selectedOption.priceWithTax,
          shippingTier: `${selectedOption.carrierName} ${selectedOption.serviceName}`.trim(),
          value: cartValue + selectedOption.priceWithTax,
        });

        trackStorefrontAnalyticsEvent({
          event: "add_shipping_info",
          googleEvent: "add_shipping_info",
          serverEvent: null,
          googlePayload: payload,
          options: {
            eventId: payload.eventId,
          },
        });
      }
      return;
    }

    clearSelectedShippingOption(window.localStorage);
  }, [onSelectedOptionChange, options, selectedOptionId]);

  useEffect(() => {
    setQuote(null);
    setSelectedOptionId(null);
  }, [items]);

  async function quoteShipping(nextPostalCode: string) {
    if (!quotePackage) {
      return;
    }

    setIsQuoting(true);
    setMessage(null);

    try {
      const result = await postStorefrontShippingQuote({
        destinationPostalCode: nextPostalCode,
        packages: [quotePackage],
      });
      const firstOption = result.options[0] ?? null;

      setQuote(result);
      setSelectedOptionId(firstOption?.optionId ?? null);
      setMessage(
        result.available && result.options.length > 0 ? null : getUnavailableQuoteMessage(result),
      );
    } catch (error) {
      setQuote(null);
      setSelectedOptionId(null);
      setMessage(getQuoteErrorMessage(error));
    } finally {
      setIsQuoting(false);
    }
  }

  useEffect(() => {
    const normalizedPostalCode = normalizeShippingPostalCode(postalCode);

    if (normalizedPostalCode && quotePackage && !quote) {
      void quoteShipping(normalizedPostalCode);
    }
    // Ejecutar solo cuando se hidrata/cambia el paquete del carrito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotePackage?.declaredValue, quotePackage?.volumeCm3, quotePackage?.weightKg, postalCode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPostalCode = normalizeShippingPostalCode(postalCode);

    if (!normalizedPostalCode) {
      setQuote(null);
      setSelectedOptionId(null);
      setMessage("Ingresá un código postal válido.");
      return;
    }

    persistShippingPostalCode(window.localStorage, normalizedPostalCode);
    setPostalCode(normalizedPostalCode);
    void quoteShipping(normalizedPostalCode);
  }

  return (
    <section className={cn("grid gap-3 border-t border-border pt-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-muted" aria-hidden="true" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Medios de envío
          </h3>
        </div>
        {postalCode ? (
          <span className="text-xs font-semibold text-muted">CP {postalCode}</span>
        ) : null}
      </div>

      <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="cart-shipping-postal-code">
          Código postal
        </label>
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="cart-shipping-postal-code"
            className="h-10 w-full rounded-lg border border-border bg-paper pl-9 pr-3 text-sm font-semibold text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/15"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="Ingresá tu código postal"
            value={postalCode}
            onChange={(event) => {
              setPostalCode(event.target.value);
            }}
          />
        </div>
        <Button className="h-10 rounded-lg text-xs font-black" type="submit" disabled={isQuoting}>
          {isQuoting ? "Cotizando" : options.length > 0 ? "Cambiar CP" : "Cotizar"}
        </Button>
      </form>

      {message ? <p className="text-xs leading-5 text-muted">{message}</p> : null}

      {options.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-xs text-muted">Elegí cómo querés recibir tu compra.</p>
          <ul
            className="grid max-h-[min(280px,36vh)] gap-2 overflow-y-auto pr-1"
            aria-label="Opciones de envío del carrito"
          >
            {options.map((option) => {
              const selected = option.optionId === selectedOptionId;

              return (
                <li key={option.optionId}>
                  <label
                    className={cn(
                      "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border p-3 transition",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-panel hover:border-foreground/40",
                    )}
                  >
                    <input
                      className="mt-1"
                      type="radio"
                      name="cart-shipping-option"
                      checked={selected}
                      onChange={() => {
                        setSelectedOptionId(option.optionId);
                      }}
                    />
                    <span className="grid gap-0.5">
                      <span className="text-sm font-semibold">{option.serviceName}</span>
                      <span className={cn("text-xs", selected ? "text-background/70" : "text-muted")}>
                        {option.carrierName}
                      </span>
                    </span>
                    <strong className="text-sm font-black">
                      {formatMoney(option.priceWithTax, quote?.currency ?? "ARS")}
                    </strong>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
