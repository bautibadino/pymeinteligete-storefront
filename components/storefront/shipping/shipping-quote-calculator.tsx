"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { Loader2, MapPin, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  normalizeShippingPostalCode,
  persistShippingPostalCode,
  readStoredShippingPostalCode,
} from "@/lib/shipping/postal-code-storage";
import {
  StorefrontShippingQuoteError,
  postStorefrontShippingQuote,
} from "@/lib/shipping/shipping-quote-client";
import { cn } from "@/lib/utils/cn";
import type {
  StorefrontShippingQuoteOption,
  StorefrontShippingQuotePackage,
  StorefrontShippingQuoteResponse,
} from "@/lib/types/storefront";

type ShippingQuoteCalculatorProps = {
  quotePackage: StorefrontShippingQuotePackage;
  className?: string | undefined;
};

function formatMoney(amount: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getUnavailableMessage(error: unknown): string {
  if (error instanceof StorefrontShippingQuoteError && error.status && error.status < 500) {
    return "No pudimos cotizar ese código postal. Revisalo e intentá nuevamente.";
  }

  return "El cotizador no está disponible por ahora. Podés avanzar y confirmar la entrega en checkout.";
}

function getUnavailableQuoteMessage(quote: StorefrontShippingQuoteResponse): string {
  if (quote.reason === "SHIPPING_PROVIDER_NOT_CONFIGURED") {
    return "El cotizador de envíos todavía no está configurado para esta tienda.";
  }

  if (quote.reason === "ORIGIN_POSTAL_CODE_NOT_CONFIGURED") {
    return "La tienda todavía no configuró el código postal de despacho.";
  }

  return "No hay opciones de envío disponibles para ese código postal.";
}

function ShippingQuoteOptionRow({
  option,
  currency,
}: {
  option: StorefrontShippingQuoteOption;
  currency: string;
}) {
  return (
    <li className="grid gap-1 rounded-[14px] border border-border bg-background/70 px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{option.serviceName}</span>
        <strong className="text-sm font-black text-foreground">
          {formatMoney(option.priceWithTax, currency)}
        </strong>
      </div>
      <span className="text-xs text-muted-foreground">{option.carrierName}</span>
    </li>
  );
}

export function ShippingQuoteCalculator({
  quotePackage,
  className,
}: ShippingQuoteCalculatorProps) {
  const [postalCode, setPostalCode] = useState("");
  const [quote, setQuote] = useState<StorefrontShippingQuoteResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const storedPostalCode = readStoredShippingPostalCode(window.localStorage);

    if (storedPostalCode) {
      setPostalCode(storedPostalCode);
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPostalCode = normalizeShippingPostalCode(postalCode);

    if (!normalizedPostalCode) {
      setQuote(null);
      setMessage("Ingresá un código postal válido.");
      return;
    }

    persistShippingPostalCode(window.localStorage, normalizedPostalCode);
    setPostalCode(normalizedPostalCode);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await postStorefrontShippingQuote({
          destinationPostalCode: normalizedPostalCode,
          packages: [quotePackage],
        });

        setQuote(result);
        setMessage(
          result.available && result.options.length > 0
            ? null
            : getUnavailableQuoteMessage(result),
        );
      } catch (error) {
        setQuote(null);
        setMessage(getUnavailableMessage(error));
      }
    });
  }

  const options = quote?.options ?? [];

  return (
    <section className={cn("grid gap-3 rounded-lg border border-border bg-panel p-3", className)}>
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-foreground">
          <Truck className="size-4" aria-hidden="true" />
        </span>
        <div className="grid gap-0.5">
          <h2 className="text-sm font-black text-foreground">Cotizá tu envío</h2>
          <p className="text-xs leading-5 text-muted-foreground">
            Guardamos tu código postal en este navegador para próximas consultas.
          </p>
        </div>
      </div>

      <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="shipping-postal-code">
          Código postal
        </label>
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="shipping-postal-code"
            className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm font-semibold text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/15"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="Código postal"
            value={postalCode}
            onChange={(event) => {
              setPostalCode(event.target.value);
            }}
          />
        </div>
        <Button className="h-11 rounded-md font-black" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isPending ? "Cotizando" : "Cotizar"}
        </Button>
      </form>

      {message ? <p className="text-xs leading-5 text-muted-foreground">{message}</p> : null}

      {options.length > 0 ? (
        <ul className="grid gap-2" aria-label="Opciones de envío disponibles">
          {options.map((option) => (
            <ShippingQuoteOptionRow
              key={option.optionId}
              option={option}
              currency={quote?.currency ?? "ARS"}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
