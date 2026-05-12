"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { trackStorefrontAnalyticsEvent } from "@/lib/analytics/client";
import { buildAddShippingInfoPayload } from "@/lib/analytics/events";
import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";
import {
  getShippingBenefitLabel,
  getShippingBenefitHintLabel,
  getShippingDeliveryMode,
  getShippingDeliveryModeLabel,
  getShippingFinalCost,
  getShippingOriginalCost,
  hasExplicitShippingBenefit,
  isShippingCheckoutSnapshotExpired,
  normalizeStoredShippingCheckoutSnapshot,
  normalizeShippingQuoteOptionCosts,
} from "@/lib/shipping/checkout-shipping";
import { buildShippingQuotePackageFromCartItems } from "@/lib/shipping/product-package";
import {
  clearSelectedShippingOption,
  normalizeShippingPostalCode,
  persistSelectedShippingOption,
  persistShippingPostalCode,
  readStoredShippingPostalCode,
  readStoredSelectedShippingOption,
  type StorefrontShippingStorageScope,
} from "@/lib/shipping/postal-code-storage";
import {
  StorefrontShippingQuoteError,
  getStorefrontShippingBranches,
  postStorefrontShippingQuote,
} from "@/lib/shipping/shipping-quote-client";
import type {
  StorefrontCarrierBranch,
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

function buildCartShippingStorageKey(items: StorefrontCartItem[]): string {
  return items
    .map((item) => `${item.productId}:${item.quantity}:${item.price.amount}`)
    .sort()
    .join("|");
}

function buildShippingQuoteItems(items: StorefrontCartItem[]) {
  return items.map((item) => ({
    productId: item.productId,
    lineTotal: item.price.amount * item.quantity,
  }));
}

function getBranchId(branch: StorefrontCarrierBranch): string {
  const code = typeof branch.code === "string" ? branch.code : undefined;
  return branch.branchId ?? branch.id ?? code ?? branch.name;
}

function getBranchDescription(branch: StorefrontCarrierBranch): string {
  return [
    branch.address,
    branch.city,
    branch.province,
    branch.postalCode ? `CP ${branch.postalCode}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function getBenefitHintProgress(option: StorefrontShippingQuoteOption): number | null {
  const hint = option.benefitHint ?? option.checkoutSnapshot.benefitHint;
  if (!hint || hint.minSubtotal <= 0) {
    return null;
  }

  const reachedSubtotal = Math.max(0, hint.minSubtotal - hint.remainingSubtotal);
  return Math.max(0, Math.min(100, Math.round((reachedSubtotal / hint.minSubtotal) * 100)));
}

function withSelectedCarrierBranch(
  option: StorefrontShippingQuoteOption,
  branch: StorefrontCarrierBranch,
): StorefrontShippingQuoteOption {
  return {
    ...option,
    selectedCarrierBranch: branch,
    checkoutSnapshot: {
      ...option.checkoutSnapshot,
      selectedCarrierBranch: branch,
    },
  };
}

export function CartShippingSelector({
  className,
  items,
  onSelectedOptionChange,
}: CartShippingSelectorProps) {
  const [postalCode, setPostalCode] = useState("");
  const [quote, setQuote] = useState<StorefrontShippingQuoteResponse | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [carrierBranches, setCarrierBranches] = useState<StorefrontCarrierBranch[]>([]);
  const [selectedCarrierBranchId, setSelectedCarrierBranchId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [branchMessage, setBranchMessage] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const trackedShippingRef = useRef<string | null>(null);

  const quotePackage = buildShippingQuotePackageFromCartItems(items);
  const storageScope = useMemo(
    (): StorefrontShippingStorageScope => ({
      host: typeof window === "undefined" ? "" : window.location.host,
      cartKey: buildCartShippingStorageKey(items),
    }),
    [items],
  );
  const options = quote?.options ?? [];
  const selectedBaseOption =
    options.find((option) => option.optionId === selectedOptionId) ?? null;
  const selectedBaseDeliveryMode = getShippingDeliveryMode(selectedBaseOption);
  const needsCarrierBranchSelection =
    selectedBaseOption?.provider === "andreani" && selectedBaseDeliveryMode === "carrier_branch";
  const selectedCarrierBranch =
    carrierBranches.find((branch) => getBranchId(branch) === selectedCarrierBranchId) ?? null;
  const selectedOptionForCheckout = useMemo(
    () =>
      selectedBaseOption && needsCarrierBranchSelection
        ? selectedCarrierBranch
          ? withSelectedCarrierBranch(selectedBaseOption, selectedCarrierBranch)
          : null
        : selectedBaseOption,
    [needsCarrierBranchSelection, selectedBaseOption, selectedCarrierBranch],
  );

  useEffect(() => {
    const storedPostalCode = readStoredShippingPostalCode(window.localStorage, storageScope);
    if (storedPostalCode) {
      setPostalCode(storedPostalCode);
    }

    const storedSnapshot = normalizeStoredShippingCheckoutSnapshot(
      readStoredSelectedShippingOption<StorefrontShippingCheckoutSnapshot>(
        window.localStorage,
        storageScope,
      ),
    );
    if (storedSnapshot?.optionId) {
      if (isShippingCheckoutSnapshotExpired(storedSnapshot)) {
        clearSelectedShippingOption(window.localStorage, storageScope);
        return;
      }

      setSelectedOptionId(storedSnapshot.optionId);
    }
  }, [storageScope]);

  useEffect(() => {
    onSelectedOptionChange(selectedOptionForCheckout);

    if (selectedOptionForCheckout) {
      const selectedSnapshot = selectedOptionForCheckout.checkoutSnapshot;
      const selectedShippingCost = getShippingFinalCost(selectedOptionForCheckout);

      persistSelectedShippingOption(window.localStorage, selectedSnapshot, {
        ...storageScope,
        deliveryMode: getShippingDeliveryMode(selectedSnapshot),
      });
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
      const trackingKey = `${selectedOptionForCheckout.optionId}:${selectedOptionForCheckout.checkoutSnapshot.destinationPostalCode}:${selectedCarrierBranchId ?? ""}:${cartSignature}`;

      if (trackedShippingRef.current !== trackingKey && analyticsItems.length > 0) {
        trackedShippingRef.current = trackingKey;
        const cartValue = analyticsItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
        const payload = buildAddShippingInfoPayload({
          eventId: `shipping_${selectedOptionForCheckout.optionId}_${Date.now()}`,
          items: analyticsItems,
          shippingAmount: selectedShippingCost,
          shippingTier: `${getShippingDeliveryModeLabel(selectedOptionForCheckout)} ${selectedOptionForCheckout.carrierName} ${selectedOptionForCheckout.serviceName}`.trim(),
          value: cartValue + selectedShippingCost,
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

    clearSelectedShippingOption(window.localStorage, storageScope);
  }, [items, onSelectedOptionChange, selectedCarrierBranchId, selectedOptionForCheckout, storageScope]);

  useEffect(() => {
    if (!selectedBaseOption || !needsCarrierBranchSelection) {
      setCarrierBranches([]);
      setSelectedCarrierBranchId(null);
      setBranchMessage(null);
      setIsLoadingBranches(false);
      return;
    }

    let cancelled = false;
    const postalCode = selectedBaseOption.checkoutSnapshot.destinationPostalCode;

    setIsLoadingBranches(true);
    setBranchMessage(null);
    setCarrierBranches([]);
    setSelectedCarrierBranchId(null);

    getStorefrontShippingBranches({
      provider: "andreani",
      postalCode,
      ...(selectedBaseOption.providerServiceCode
        ? { contract: selectedBaseOption.providerServiceCode }
        : {}),
    })
      .then((result) => {
        if (cancelled) return;

        setCarrierBranches(result.branches);
        if (result.branches.length === 0) {
          setBranchMessage("Andreani no devolvió sucursales para ese código postal.");
          return;
        }

        const onlyBranch = result.branches[0];
        if (result.branches.length === 1 && onlyBranch) {
          setSelectedCarrierBranchId(getBranchId(onlyBranch));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setBranchMessage("No pudimos obtener las sucursales Andreani para ese código postal.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingBranches(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    needsCarrierBranchSelection,
    selectedBaseOption?.checkoutSnapshot.destinationPostalCode,
    selectedBaseOption?.optionId,
    selectedBaseOption?.providerServiceCode,
  ]);

  useEffect(() => {
    setQuote(null);
    setSelectedOptionId(null);
    setCarrierBranches([]);
    setSelectedCarrierBranchId(null);
    setBranchMessage(null);
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
        subtotal: quotePackage.declaredValue,
        items: buildShippingQuoteItems(items),
      });
      const normalizedResult = {
        ...result,
        options: result.options.map(normalizeShippingQuoteOptionCosts),
      };
      const firstOption = normalizedResult.options[0] ?? null;

      setQuote(normalizedResult);
      setSelectedOptionId(firstOption?.optionId ?? null);
      setMessage(
        normalizedResult.available && normalizedResult.options.length > 0
          ? null
          : getUnavailableQuoteMessage(normalizedResult),
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
      setCarrierBranches([]);
      setSelectedCarrierBranchId(null);
      setBranchMessage(null);
      setMessage("Ingresá un código postal válido.");
      return;
    }

    persistShippingPostalCode(window.localStorage, normalizedPostalCode, storageScope);
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
              const originalCost = getShippingOriginalCost(option);
              const finalCost = getShippingFinalCost(option);
              const benefitLabel = getShippingBenefitLabel(option);
              const benefitHintLabel = getShippingBenefitHintLabel(option);
              const benefitHintProgress = getBenefitHintProgress(option);
              const showBenefit = hasExplicitShippingBenefit(option) && benefitLabel;

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
                        setSelectedCarrierBranchId(null);
                      }}
                    />
                    <span className="grid gap-0.5">
                      <span className="text-sm font-semibold">
                        {getShippingDeliveryModeLabel(option)}
                      </span>
                      <span className={cn("text-xs", selected ? "text-background/70" : "text-muted")}>
                        {option.serviceName}
                        {option.carrierName ? ` · ${option.carrierName}` : ""}
                      </span>
                      {option.displayMessage || showBenefit ? (
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            selected ? "text-background/80" : "text-emerald-700",
                          )}
                        >
                          {benefitLabel ?? option.displayMessage}
                        </span>
                      ) : null}
                      {!showBenefit && benefitHintLabel && benefitHintProgress !== null ? (
                        <span className="mt-1 grid gap-1.5">
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              selected ? "text-background/80" : "text-amber-700",
                            )}
                          >
                            {benefitHintLabel}
                          </span>
                          <span
                            className={cn(
                              "block h-1.5 overflow-hidden rounded-full",
                              selected ? "bg-background/20" : "bg-amber-100",
                            )}
                            aria-hidden="true"
                          >
                            <span
                              className={cn(
                                "block h-full rounded-full",
                                selected ? "bg-background" : "bg-amber-500",
                              )}
                              style={{ width: `${benefitHintProgress}%` }}
                            />
                          </span>
                        </span>
                      ) : null}
                    </span>
                    <span className="grid justify-items-end gap-0.5">
                      {originalCost > finalCost ? (
                        <span
                          className={cn(
                            "text-xs line-through",
                            selected ? "text-background/60" : "text-muted",
                          )}
                        >
                          {formatMoney(originalCost, quote?.currency ?? "ARS")}
                        </span>
                      ) : null}
                      <strong className="text-sm font-black">
                        {finalCost === 0 ? "Gratis" : formatMoney(finalCost, quote?.currency ?? "ARS")}
                      </strong>
                    </span>
                  </label>
                  {selected && getShippingDeliveryMode(option) === "carrier_branch" ? (
                    <div className="mt-2 grid gap-2 rounded-xl border border-border bg-background p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                          Sucursal Andreani
                        </p>
                        {isLoadingBranches ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted">
                            <Loader2 className="size-3 animate-spin" />
                            Buscando
                          </span>
                        ) : null}
                      </div>
                      {branchMessage ? (
                        <p className="text-xs leading-5 text-muted">{branchMessage}</p>
                      ) : null}
                      {carrierBranches.length > 0 ? (
                        <ul className="grid max-h-56 gap-2 overflow-y-auto pr-1">
                          {carrierBranches.map((branch) => {
                            const branchId = getBranchId(branch);
                            const branchSelected = branchId === selectedCarrierBranchId;
                            const branchDescription = getBranchDescription(branch);

                            return (
                              <li key={branchId}>
                                <label
                                  className={cn(
                                    "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-lg border px-3 py-2 transition",
                                    branchSelected
                                      ? "border-foreground bg-panel"
                                      : "border-border bg-paper hover:border-foreground/40",
                                  )}
                                >
                                  <input
                                    className="mt-1"
                                    type="radio"
                                    name={`carrier-branch-${option.optionId}`}
                                    checked={branchSelected}
                                    onChange={() => setSelectedCarrierBranchId(branchId)}
                                  />
                                  <span className="grid gap-0.5">
                                    <span className="text-sm font-semibold text-foreground">
                                      {branch.name}
                                    </span>
                                    {branchDescription ? (
                                      <span className="text-xs leading-5 text-muted">
                                        {branchDescription}
                                      </span>
                                    ) : null}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                      {!isLoadingBranches && carrierBranches.length > 1 && !selectedCarrierBranchId ? (
                        <p className="text-xs font-semibold text-amber-700">
                          Elegí una sucursal para mantener este envío y continuar.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
