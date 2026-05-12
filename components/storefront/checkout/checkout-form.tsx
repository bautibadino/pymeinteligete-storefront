"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";

import {
  type CheckoutActionState,
  initialCheckoutActionState,
} from "@/app/(storefront)/checkout/action-state";
import { submitCheckoutAction } from "@/app/(storefront)/checkout/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useStorefrontCart } from "@/components/storefront/cart/storefront-cart-provider";
import { CheckoutStepCard } from "@/components/storefront/checkout/checkout-step-card";
import { PaymentBrick } from "@/components/storefront/checkout/payment-brick";
import { trackStorefrontAnalyticsEvent } from "@/lib/analytics/client";
import { buildAddPaymentInfoPayload, buildInitiateCheckoutPayload } from "@/lib/analytics/events";
import { markTrackedEvent } from "@/lib/analytics/storage";
import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";
import {
  getShippingBenefitLabel,
  getShippingDeliveryMode,
  getShippingDeliveryModeLabel,
  getShippingFinalCost,
  getShippingOriginalCost,
  hasExplicitShippingBenefit,
  isShippingCheckoutSnapshotExpired,
  normalizeStoredShippingCheckoutSnapshot,
  requiresHomeShippingAddress,
} from "@/lib/shipping/checkout-shipping";
import {
  readStoredSelectedShippingOption,
  type StorefrontShippingStorageScope,
} from "@/lib/shipping/postal-code-storage";
import { createRandomId } from "@/lib/utils/random-id";
import type {
  StorefrontPaymentMethod,
  StorefrontPaymentMethods,
} from "@/lib/storefront-api";
import type { StorefrontShippingCheckoutSnapshot } from "@/lib/types/storefront";

type CheckoutFormProps = {
  paymentMethods: StorefrontPaymentMethods | null;
  publicKey?: string;
  installmentsLabel?: string;
  installmentsCount?: number;
  initialItems?: Array<{
    productId: string;
    quantity?: number;
  }>;
};

type CheckoutDisplayItem = {
  productId: string;
  quantity: number;
  title: string;
  brand?: string;
  href?: string;
  imageUrl?: string;
  unitPriceLabel: string | null;
  linePriceLabel: string | null;
  linePriceAmount: number | null;
  isFallback: boolean;
};

type CheckoutPaymentStrategy = "none" | "manual" | "auto";

type OrderState = {
  orderId: string;
  orderToken: string;
  orderNumber: string;
  total: number;
  payerEmail: string;
};

type CheckoutAnalyticsItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CheckoutFormValues = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDni: string;
  shippingStreet: string;
  shippingNumber: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  shippingNotes: string;
};

type StorefrontFiscalAutofillCustomer = {
  name: string;
  taxId: string;
  taxIdType: string;
  taxpayerType?: string;
  taxCondition?: string;
  taxConditionCode?: string;
  isMonotributo?: boolean;
};

type StorefrontFiscalAutofillAddress = {
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
};

type StorefrontFiscalAutofillData = {
  customer: StorefrontFiscalAutofillCustomer;
  billingAddress?: StorefrontFiscalAutofillAddress;
  metadata?: {
    source?: string;
    fetchedAt?: string;
  };
};

type StorefrontFiscalAutofillResponse =
  | StorefrontFiscalAutofillData
  | {
      success?: boolean;
      data?: StorefrontFiscalAutofillData;
      error?: string;
    };

const STUB_FISCAL_NAME_PATTERN = /\b(stub|empresa\s+de\s+prueba|prueba)\b/i;

const EMPTY_FORM_VALUES: CheckoutFormValues = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerDni: "",
  shippingStreet: "",
  shippingNumber: "",
  shippingCity: "",
  shippingProvince: "",
  shippingPostalCode: "",
  shippingNotes: "",
};

const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount).replaceAll(" ", " ").replaceAll(" ", " ");
}

function resolvePaymentStrategyFromMethod(methodType: string): CheckoutPaymentStrategy {
  return methodType === "automatic" ? "auto" : "manual";
}

function formatPaymentMethodDiscountLabel(method: StorefrontPaymentMethod): string | null {
  const discount = method.discount;

  if (!discount) {
    return null;
  }

  if (discount.type === "percentage") {
    return `${discount.value}% OFF`;
  }

  return `${formatCurrency(discount.value)} OFF`;
}

function calculateDiscountAmount(
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

function buildCheckoutAnalyticsItems(items: CheckoutDisplayItem[]): CheckoutAnalyticsItem[] {
  return items.map((item) => ({
    id: item.productId,
    name: item.title,
    price:
      item.linePriceAmount !== null && item.quantity > 0
        ? item.linePriceAmount / item.quantity
        : 0,
    quantity: item.quantity,
  }));
}

function buildCheckoutShippingStorageKey(items: CheckoutDisplayItem[]): string {
  return items
    .map((item) => {
      const unitPrice =
        item.linePriceAmount !== null && item.quantity > 0
          ? item.linePriceAmount / item.quantity
          : 0;

      return `${item.productId}:${item.quantity}:${unitPrice}`;
    })
    .sort()
    .join("|");
}

function normalizeProvinceName(rawProvince: string | undefined): string {
  if (!rawProvince) {
    return "";
  }

  const normalized = rawProvince
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  if (
    normalized.includes("CIUDAD") ||
    normalized.includes("CABA") ||
    normalized.includes("CAPITAL")
  ) {
    return "CABA";
  }

  const normalizeBase = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  const exactMatch = PROVINCES.find((province) => normalizeBase(province) === normalized);
  if (exactMatch) {
    return exactMatch;
  }

  const partialMatch = PROVINCES.find((province) => {
    const candidate = normalizeBase(province);
    return normalized.includes(candidate) || candidate.includes(normalized);
  });

  return partialMatch ?? rawProvince;
}

export function extractFiscalAutofillData(
  payload: StorefrontFiscalAutofillResponse,
): StorefrontFiscalAutofillData | null {
  if ("customer" in payload && payload.customer) {
    return isStubFiscalAutofillData(payload) ? null : payload;
  }

  if ("data" in payload && payload.data?.customer) {
    return isStubFiscalAutofillData(payload.data) ? null : payload.data;
  }

  return null;
}

function isStubFiscalAutofillData(data: StorefrontFiscalAutofillData): boolean {
  const source = data.metadata?.source?.toLowerCase() ?? "";
  const customerName = data.customer.name ?? "";

  return source.includes("stub") || STUB_FISCAL_NAME_PATTERN.test(customerName);
}

export function resolveCheckoutDisplayItems(
  initialItems: Array<{ productId: string; quantity?: number }> | undefined,
  cartItems: StorefrontCartItem[],
): CheckoutDisplayItem[] {
  if (!initialItems || initialItems.length === 0) {
    return cartItems.map((cartItem) => ({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      title: cartItem.name,
      ...(cartItem.brand ? { brand: cartItem.brand } : {}),
      ...(cartItem.href ? { href: cartItem.href } : {}),
      ...(cartItem.imageUrl ? { imageUrl: cartItem.imageUrl } : {}),
      unitPriceLabel: cartItem.price.formatted,
      linePriceLabel: formatCurrency(cartItem.price.amount * cartItem.quantity),
      linePriceAmount: cartItem.price.amount * cartItem.quantity,
      isFallback: false,
    }));
  }

  return (initialItems ?? []).map((item) => {
    const quantity = Number.isFinite(item.quantity) && (item.quantity ?? 0) > 0 ? item.quantity ?? 1 : 1;
    const cartItem = cartItems.find((entry) => entry.productId === item.productId);

    if (!cartItem) {
      return {
        productId: item.productId,
        quantity,
        title: "Producto seleccionado",
        unitPriceLabel: null,
        linePriceLabel: null,
        linePriceAmount: null,
        isFallback: true,
      };
    }

    const linePriceAmount = cartItem.price.amount * quantity;

    return {
      productId: item.productId,
      quantity,
      title: cartItem.name,
      ...(cartItem.brand ? { brand: cartItem.brand } : {}),
      ...(cartItem.href ? { href: cartItem.href } : {}),
      ...(cartItem.imageUrl ? { imageUrl: cartItem.imageUrl } : {}),
      unitPriceLabel: cartItem.price.formatted,
      linePriceLabel: formatCurrency(linePriceAmount),
      linePriceAmount,
      isFallback: false,
    };
  });
}

export function resolveInitialPaymentStrategy(input: {
  hasAutomaticPayment: boolean;
  hasVisibleMethods: boolean;
}): CheckoutPaymentStrategy {
  if (input.hasAutomaticPayment) {
    return "auto";
  }

  if (input.hasVisibleMethods) {
    return "manual";
  }

  return "none";
}

function SubmitButton({
  disabled,
  paymentStrategy,
}: {
  disabled?: boolean;
  paymentStrategy: CheckoutPaymentStrategy;
}) {
  const { pending } = useFormStatus();
  const label =
    paymentStrategy === "auto"
      ? pending
        ? "Preparando pago..."
        : "Continuar al pago"
      : paymentStrategy === "manual"
        ? pending
          ? "Generando orden..."
          : "Continuar con pago manual"
        : pending
          ? "Reservando pedido..."
          : "Reservar pedido";

  return (
    <Button
      className="h-11 w-full rounded-full px-6 sm:w-auto"
      size="lg"
      type="submit"
      disabled={pending || disabled}
    >
      {label}
    </Button>
  );
}

function FieldError({
  state,
  field,
}: {
  state: CheckoutActionState;
  field: keyof NonNullable<CheckoutActionState["fieldErrors"]>;
}) {
  const message = state.fieldErrors?.[field];

  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function SummaryItem({ item }: { item: CheckoutDisplayItem }) {
  return (
    <article className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-2xl border border-border/70 bg-background p-3">
      <div className="overflow-hidden rounded-xl bg-muted/50">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-[72px] w-[72px] object-cover" />
        ) : (
          <div className="flex h-[72px] w-[72px] items-center justify-center bg-muted text-foreground">
            <Package className="size-5" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="space-y-1">
          {item.brand ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {item.brand}
            </p>
          ) : null}
          <p className="line-clamp-2 text-sm font-semibold text-foreground">{item.title}</p>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {item.quantity} {item.quantity === 1 ? "unidad" : "unidades"}
          </span>
          {item.linePriceLabel ? (
            <span className="font-semibold text-foreground">{item.linePriceLabel}</span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Precio al confirmar</span>
          )}
        </div>
      </div>
    </article>
  );
}

function ShippingSummary({
  snapshot,
  expired,
}: {
  snapshot: StorefrontShippingCheckoutSnapshot | null;
  expired: boolean;
}) {
  if (!snapshot) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        No hay un envío seleccionado desde el carrito.
      </div>
    );
  }

  const originalCost = getShippingOriginalCost(snapshot);
  const finalCost = getShippingFinalCost(snapshot);
  const benefitLabel = getShippingBenefitLabel(snapshot);
  const showBenefit = hasExplicitShippingBenefit(snapshot) && benefitLabel;
  const location =
    getShippingDeliveryMode(snapshot) === "carrier_branch"
      ? snapshot.selectedCarrierBranch
      : snapshot.pickupLocation;

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Envío elegido
          </p>
          <p className="text-base font-semibold text-foreground">
            {getShippingDeliveryModeLabel(snapshot)}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {snapshot.serviceName}
            {snapshot.carrierName ? ` · ${snapshot.carrierName}` : ""} · CP{" "}
            {snapshot.destinationPostalCode}
          </p>
          {location?.name ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {location.name}
              {location.address ? ` · ${location.address}` : ""}
            </p>
          ) : null}
          {snapshot.displayMessage || showBenefit ? (
            <p className="text-sm font-semibold text-emerald-700">
              {benefitLabel ?? snapshot.displayMessage}
            </p>
          ) : null}
        </div>
        <span className="grid shrink-0 justify-items-end gap-0.5">
          {originalCost > finalCost ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(originalCost)}
            </span>
          ) : null}
          <strong className="text-sm text-foreground">
            {finalCost === 0 ? "Gratis" : formatCurrency(finalCost)}
          </strong>
        </span>
      </div>
      {expired ? (
        <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
          Esta cotización venció. Volvé al carrito y cotizá nuevamente antes de finalizar.
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm({
  paymentMethods,
  publicKey,
  installmentsLabel,
  installmentsCount,
  initialItems,
}: CheckoutFormProps) {
  const [state, formAction] = useActionState(
    submitCheckoutAction,
    initialCheckoutActionState,
  );
  const { items: cartItems, subtotal } = useStorefrontCart();
  const paymentOptions = paymentMethods?.paymentMethods ?? [];
  const automaticPaymentMethods = paymentOptions.filter((method) => method.methodType === "automatic");
  const manualPaymentMethods = paymentOptions.filter((method) => method.methodType === "manual");
  const hasAutomaticPayment =
    Boolean(publicKey) && automaticPaymentMethods.length > 0;
  const [paymentStrategy, setPaymentStrategy] = useState<CheckoutPaymentStrategy>(() =>
    resolveInitialPaymentStrategy({
      hasAutomaticPayment,
      hasVisibleMethods: paymentOptions.length > 0,
    }),
  );
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>(() => {
    const initialMethod =
      paymentOptions.find((method) =>
        resolvePaymentStrategyFromMethod(method.methodType) ===
        resolveInitialPaymentStrategy({
          hasAutomaticPayment,
          hasVisibleMethods: paymentOptions.length > 0,
        }),
      ) ?? paymentOptions[0];

    return initialMethod?.methodId ?? "";
  });
  const [formValues, setFormValues] = useState<CheckoutFormValues>(EMPTY_FORM_VALUES);
  const [selectedShippingSnapshot, setSelectedShippingSnapshot] =
    useState<StorefrontShippingCheckoutSnapshot | null>(null);
  const [isSelectedShippingExpired, setIsSelectedShippingExpired] = useState(false);
  const [fiscalAutofill, setFiscalAutofill] = useState<StorefrontFiscalAutofillData | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUpTaxpayer, setIsLookingUpTaxpayer] = useState(false);
  const displayItems = useMemo(
    () => resolveCheckoutDisplayItems(initialItems, cartItems),
    [cartItems, initialItems],
  );
  const pricedTotal = useMemo(
    () => displayItems.reduce((total, item) => total + (item.linePriceAmount ?? 0), 0),
    [displayItems],
  );
  const displayItemsCount = useMemo(
    () => displayItems.reduce((total, item) => total + item.quantity, 0),
    [displayItems],
  );
  const checkoutValue = pricedTotal > 0 ? pricedTotal : subtotal;
  const orderState = useMemo<OrderState | null>(() => {
    if (
      state.status !== "success" ||
      !state.orderId ||
      !state.orderToken ||
      !state.orderNumber ||
      state.total === undefined ||
      !state.payerEmail
    ) {
      return null;
    }

    return {
      orderId: state.orderId,
      orderToken: state.orderToken,
      orderNumber: state.orderNumber,
      total: state.total,
      payerEmail: state.payerEmail,
    };
  }, [state]);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string>(createRandomId());
  const lastTrackedPaymentMethodRef = useRef<string | null>(null);
  const identifiedCustomer = fiscalAutofill?.customer ?? null;
  const billingAddress = fiscalAutofill?.billingAddress;
  const hasPaymentOptions = paymentOptions.length > 0;
  const selectedPaymentMethod =
    paymentOptions.find((method) => method.methodId === selectedPaymentMethodId) ?? null;
  const selectedDiscountAmount = calculateDiscountAmount(
    checkoutValue,
    selectedPaymentMethod?.discount ?? null,
  );
  const selectedDiscountedTotal = Math.max(0, checkoutValue - selectedDiscountAmount);
  const selectedShippingAmount =
    selectedShippingSnapshot && !isSelectedShippingExpired
      ? getShippingFinalCost(selectedShippingSnapshot)
      : 0;
  const hasValidSelectedShipping =
    Boolean(selectedShippingSnapshot) && !isSelectedShippingExpired;
  const selectedDiscountedTotalWithShipping = selectedDiscountedTotal + selectedShippingAmount;
  const checkoutValueWithShipping = checkoutValue + selectedShippingAmount;
  const selectedInstallmentAmount =
    selectedPaymentMethod?.methodType === "automatic" &&
    installmentsCount &&
    installmentsCount > 0 &&
    checkoutValueWithShipping > 0
      ? Math.round(checkoutValueWithShipping / installmentsCount)
      : null;
  const shippingStorageScope = useMemo(
    (): StorefrontShippingStorageScope => ({
      host: typeof window === "undefined" ? "" : window.location.host,
      cartKey: buildCheckoutShippingStorageKey(displayItems),
    }),
    [displayItems],
  );
  const mustCollectHomeShippingAddress =
    !selectedShippingSnapshot || requiresHomeShippingAddress(selectedShippingSnapshot);

  useEffect(() => {
    const nextStrategy = resolveInitialPaymentStrategy({
      hasAutomaticPayment,
      hasVisibleMethods: paymentOptions.length > 0,
    });
    const nextMethod =
      paymentOptions.find(
        (method) => resolvePaymentStrategyFromMethod(method.methodType) === nextStrategy,
      ) ?? paymentOptions[0];

    setPaymentStrategy(nextStrategy);
    setSelectedPaymentMethodId(nextMethod?.methodId ?? "");
  }, [hasAutomaticPayment, paymentOptions.length]);

  useEffect(() => {
    if (typeof window === "undefined" || displayItems.length === 0) {
      return;
    }

    const analyticsItems = buildCheckoutAnalyticsItems(displayItems);
    const checkoutSignature = analyticsItems
      .map((item) => `${item.id}:${item.quantity}:${item.price}`)
      .join("|");
    const storageKey = `checkout:initiate:${checkoutSignature}:${pricedTotal > 0 ? pricedTotal : subtotal}`;

    if (!markTrackedEvent(window.localStorage, storageKey)) {
      return;
    }

    const payload = buildInitiateCheckoutPayload({
      eventId: `initiate_${Date.now()}`,
      value: checkoutValue,
      items: analyticsItems,
    });

    trackStorefrontAnalyticsEvent({
      event: "InitiateCheckout",
      googleEvent: "begin_checkout",
      metaEvent: "InitiateCheckout",
      metaPayload: payload,
      googlePayload: payload,
      options: {
        eventId: payload.eventId,
      },
    });
  }, [checkoutValue, displayItems]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const snapshot = normalizeStoredShippingCheckoutSnapshot(
      readStoredSelectedShippingOption<StorefrontShippingCheckoutSnapshot>(
        window.localStorage,
        shippingStorageScope,
      ),
    );

    setSelectedShippingSnapshot(snapshot);
    setIsSelectedShippingExpired(snapshot ? isShippingCheckoutSnapshotExpired(snapshot) : false);

    if (snapshot?.destinationPostalCode) {
      setFormValues((current) =>
        current.shippingPostalCode
          ? current
          : { ...current, shippingPostalCode: snapshot.destinationPostalCode },
      );
    }
  }, [shippingStorageScope]);

  function updateField(field: keyof CheckoutFormValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePaymentSelection(
    nextStrategy: CheckoutPaymentStrategy,
    selectedMethodLabel: string,
    dedupeKey: string,
  ) {
    setPaymentStrategy(nextStrategy);

    if (lastTrackedPaymentMethodRef.current === dedupeKey) {
      return;
    }

    lastTrackedPaymentMethodRef.current = dedupeKey;

    if (nextStrategy === "none") {
      return;
    }

    const analyticsItems = buildCheckoutAnalyticsItems(displayItems);
    const payload = buildAddPaymentInfoPayload({
      eventId: `payment_${dedupeKey}_${Date.now()}`,
      methodLabel: selectedMethodLabel,
      value: checkoutValue,
      items: analyticsItems,
    });

    trackStorefrontAnalyticsEvent({
      event: "AddPaymentInfo",
      googleEvent: "add_payment_info",
      metaEvent: "AddPaymentInfo",
      metaPayload: payload,
      googlePayload: payload,
      options: {
        eventId: payload.eventId,
      },
    });
  }

  function handlePaymentMethodSelection(method: StorefrontPaymentMethod) {
    setSelectedPaymentMethodId(method.methodId);
    handlePaymentSelection(
      resolvePaymentStrategyFromMethod(method.methodType),
      method.displayName,
      method.methodId,
    );
  }

  async function handleFiscalLookup() {
    const documentValue = formValues.customerDni.replace(/\D/g, "");

    if (documentValue.length < 7) {
      setLookupError("Ingresá un DNI o CUIT válido para autocompletar los datos.");
      return;
    }

    setIsLookingUpTaxpayer(true);
    setLookupError(null);

    try {
      const response = await fetch(`/api/fiscal/autofill?id=${encodeURIComponent(documentValue)}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as StorefrontFiscalAutofillResponse;

      if (!response.ok) {
        setFiscalAutofill(null);
        setLookupError(
          ("error" in payload && payload.error) ||
            "No se pudieron recuperar datos fiscales para este documento.",
        );
        return;
      }

      const resolvedData = extractFiscalAutofillData(payload);

      if (!resolvedData) {
        setFiscalAutofill(null);
        setLookupError("No encontramos datos fiscales reales para este documento. Podés completar los datos manualmente y continuar.");
        return;
      }

      setFiscalAutofill(resolvedData);
      setFormValues((current) => ({
        ...current,
        customerName: resolvedData.customer.name ?? current.customerName,
        shippingStreet: resolvedData.billingAddress?.street ?? current.shippingStreet,
        shippingNumber: resolvedData.billingAddress?.number ?? current.shippingNumber,
        shippingCity: resolvedData.billingAddress?.city ?? current.shippingCity,
        shippingProvince:
          normalizeProvinceName(resolvedData.billingAddress?.province) ?? current.shippingProvince,
        shippingPostalCode: resolvedData.billingAddress?.postalCode ?? current.shippingPostalCode,
      }));
    } catch {
      setFiscalAutofill(null);
      setLookupError("No se pudieron recuperar datos fiscales en este momento.");
    } finally {
      setIsLookingUpTaxpayer(false);
    }
  }

  if (orderState && paymentStrategy === "auto" && publicKey) {
    return (
      <section className="mx-auto grid w-full max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <CheckoutStepCard
            step="4"
            title="Confirmá el pago"
            description={`La orden ${orderState.orderNumber} ya quedó creada. Completá el pago seguro para finalizar la compra.`}
            aside={<Badge variant="soft">Pago online</Badge>}
          >
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Orden</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{orderState.orderNumber}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Total</p>
                  <p className="mt-1 text-base font-semibold text-foreground">
                    {formatCurrency(orderState.total)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Email</p>
                  <p className="mt-1 truncate text-base font-semibold text-foreground">
                    {orderState.payerEmail}
                  </p>
                </div>
              </div>

              {paymentError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {paymentError}
                </div>
              ) : null}

              <PaymentBrick
                publicKey={publicKey}
                amount={orderState.total}
                orderId={orderState.orderId}
                orderToken={orderState.orderToken}
                payerEmail={orderState.payerEmail}
                onPaymentSuccess={() => setPaymentError(null)}
                onPaymentError={setPaymentError}
                {...(installmentsLabel ? { installmentsLabel } : {})}
              />
            </div>
          </CheckoutStepCard>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] border border-border/70 bg-background p-5 shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Resumen
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Pedido listo para pagar
              </h2>
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              {displayItems.map((item) => (
                <SummaryItem key={`${item.productId}-${item.quantity}`} item={item} />
              ))}
            </div>
          </div>
        </aside>
      </section>
    );
  }

  return (
    <form
      action={formAction}
      className="mx-auto grid w-full max-w-[1180px] gap-8 lg:items-start lg:grid-cols-[minmax(0,1fr)_340px]"
    >
      <input type="hidden" name="idempotencyKey" value={idempotencyKeyRef.current} />
      <input type="hidden" name="paymentStrategy" value={paymentStrategy} />
      <input type="hidden" name="paymentMethodId" value={selectedPaymentMethodId} />
      <input
        type="hidden"
        name="shippingQuoteSnapshot"
        value={
          selectedShippingSnapshot && !isSelectedShippingExpired
            ? JSON.stringify(selectedShippingSnapshot)
            : ""
        }
      />
      {displayItems.map((item) => (
        <div key={`${item.productId}-${item.quantity}`} className="hidden">
          <input type="hidden" name="itemProductId" value={item.productId} />
          <input type="hidden" name="itemQuantity" value={String(item.quantity)} />
        </div>
      ))}
      <input type="hidden" name="customerTaxId" value={identifiedCustomer?.taxId ?? ""} />
      <input type="hidden" name="customerTaxIdType" value={identifiedCustomer?.taxIdType ?? ""} />
      <input type="hidden" name="customerTaxCondition" value={identifiedCustomer?.taxCondition ?? ""} />
      <input type="hidden" name="billingStreet" value={billingAddress?.street ?? ""} />
      <input type="hidden" name="billingNumber" value={billingAddress?.number ?? ""} />
      <input type="hidden" name="billingCity" value={billingAddress?.city ?? ""} />
      <input type="hidden" name="billingProvince" value={normalizeProvinceName(billingAddress?.province)} />
      <input type="hidden" name="billingPostalCode" value={billingAddress?.postalCode ?? ""} />

      <div className="space-y-6">
        <CheckoutStepCard
          step="1"
          title="Datos de contacto"
          description="Ingresá tu DNI o CUIT para buscar tus datos fiscales. Si encontramos información, completamos lo principal para que sigas más rápido."
        >
          <div className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex-1 space-y-2">
                  <span className="text-sm font-medium text-foreground">DNI o CUIT</span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                    <Input
                      name="customerDni"
                      value={formValues.customerDni}
                      onChange={(event) => updateField("customerDni", event.target.value)}
                      placeholder="Ej: 20123456789"
                      className="h-11 pl-10"
                    />
                  </div>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full px-5"
                  onClick={handleFiscalLookup}
                  disabled={isLookingUpTaxpayer}
                >
                  {isLookingUpTaxpayer ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {isLookingUpTaxpayer ? "Consultando" : "Validar"}
                </Button>
              </div>

              {lookupError ? (
                <p className="mt-3 text-sm text-destructive">{lookupError}</p>
              ) : identifiedCustomer ? (
                <div className="mt-3 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                  <div className="space-y-1">
                    <p className="font-medium">Datos fiscales encontrados</p>
                    <p>
                      {identifiedCustomer.taxpayerType ?? "Cliente"}
                      {identifiedCustomer.taxCondition ? ` · ${identifiedCustomer.taxCondition}` : ""}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  {identifiedCustomer?.taxpayerType === "Juridica" ? "Razón social" : "Nombre y apellido"}
                </span>
                <Input
                  name="customerName"
                  value={formValues.customerName}
                  onChange={(event) => updateField("customerName", event.target.value)}
                  placeholder={identifiedCustomer?.taxpayerType === "Juridica" ? "Empresa SRL" : "Juan Pérez"}
                  className="h-11"
                />
                <FieldError field="customerName" state={state} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Email</span>
                <Input
                  name="customerEmail"
                  type="email"
                  value={formValues.customerEmail}
                  onChange={(event) => updateField("customerEmail", event.target.value)}
                  placeholder="juan@correo.com"
                  className="h-11"
                />
                <FieldError field="customerEmail" state={state} />
              </label>
              <label className="space-y-2 sm:max-w-[360px]">
                <span className="text-sm font-medium text-foreground">Teléfono / WhatsApp</span>
                <Input
                  name="customerPhone"
                  value={formValues.customerPhone}
                  onChange={(event) => updateField("customerPhone", event.target.value)}
                  placeholder="3515551234"
                  className="h-11"
                />
                <FieldError field="customerPhone" state={state} />
              </label>
            </div>
          </div>
        </CheckoutStepCard>

        <CheckoutStepCard
          step="2"
          title="Entrega"
          description={
            mustCollectHomeShippingAddress
              ? "Completá la dirección donde querés recibir el pedido. Si el domicilio fiscal sirve, sólo revisás y corregís lo necesario."
              : "La entrega se toma desde el envío seleccionado en el carrito."
          }
        >
          {mustCollectHomeShippingAddress ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Calle</span>
                <Input
                  name="shippingStreet"
                  value={formValues.shippingStreet}
                  onChange={(event) => updateField("shippingStreet", event.target.value)}
                  placeholder="Belgrano"
                  className="h-11"
                />
                <FieldError field="shippingStreet" state={state} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Número</span>
                <Input
                  name="shippingNumber"
                  value={formValues.shippingNumber}
                  onChange={(event) => updateField("shippingNumber", event.target.value)}
                  placeholder="123"
                  className="h-11"
                />
                <FieldError field="shippingNumber" state={state} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Ciudad</span>
                <Input
                  name="shippingCity"
                  value={formValues.shippingCity}
                  onChange={(event) => updateField("shippingCity", event.target.value)}
                  placeholder="Corral de Bustos"
                  className="h-11"
                />
                <FieldError field="shippingCity" state={state} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Provincia</span>
                <select
                  name="shippingProvince"
                  value={formValues.shippingProvince}
                  onChange={(event) => updateField("shippingProvince", event.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Seleccioná una provincia</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                <FieldError field="shippingProvince" state={state} />
              </label>
              <label className="space-y-2 sm:max-w-[220px]">
                <span className="text-sm font-medium text-foreground">Código postal</span>
                <Input
                  name="shippingPostalCode"
                  value={formValues.shippingPostalCode}
                  onChange={(event) => updateField("shippingPostalCode", event.target.value)}
                  placeholder="2645"
                  className="h-11"
                />
                <FieldError field="shippingPostalCode" state={state} />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-foreground">Indicaciones de entrega</span>
                <textarea
                  name="shippingNotes"
                  rows={4}
                  value={formValues.shippingNotes}
                  onChange={(event) => updateField("shippingNotes", event.target.value)}
                  placeholder="Ejemplo: avisar antes de llegar o entregar por la tarde."
                  className="min-h-[120px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </label>
            </div>
          ) : (
            <div className="grid gap-4">
              <ShippingSummary
                snapshot={selectedShippingSnapshot}
                expired={isSelectedShippingExpired}
              />
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Indicaciones para la entrega</span>
                <textarea
                  name="shippingNotes"
                  rows={4}
                  value={formValues.shippingNotes}
                  onChange={(event) => updateField("shippingNotes", event.target.value)}
                  placeholder="Ejemplo: persona autorizada para retirar o comentario para el comercio."
                  className="min-h-[120px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </label>
            </div>
          )}
        </CheckoutStepCard>

        <CheckoutStepCard
          step="3"
          title="Cómo querés pagar"
          description="Elegí directamente el medio de pago que prefieras para terminar la compra."
        >
          <div className="space-y-4">
            {hasPaymentOptions ? (
              <div className="grid gap-3">
                {paymentOptions.map((method) => {
                  const isSelected = selectedPaymentMethodId === method.methodId;
                  const MethodIcon = method.methodType === "automatic" ? CreditCard : Landmark;
                  const benefitLabel =
                    method.methodType === "automatic"
                      ? installmentsLabel ?? null
                      : formatPaymentMethodDiscountLabel(method);

                  return (
                    <button
                      key={method.methodId}
                      type="button"
                      onClick={() => handlePaymentMethodSelection(method)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border/70 bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/60 text-foreground">
                            <MethodIcon className="size-4" />
                          </span>
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">{method.displayName}</p>
                            <p className="text-sm leading-6 text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {benefitLabel ? (
                          <span
                            className={
                              method.methodType === "automatic"
                                ? "inline-flex max-w-full self-start rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-center text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-emerald-950 shadow-sm whitespace-normal"
                                : "inline-flex max-w-full self-start rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-center text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-amber-950 shadow-sm whitespace-normal"
                            }
                          >
                            {benefitLabel}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => handlePaymentSelection("none", "Reserva de pedido", "reserve")}
                  className="rounded-2xl border border-primary bg-primary/5 p-4 text-left"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Reservar pedido</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Dejamos la orden preparada para que el comercio te contacte y continúe por otro canal.
                    </p>
                  </div>
                </button>
              </div>
            )}

            {paymentStrategy === "manual" && manualPaymentMethods.length > 0 ? (
              <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">
                  Al continuar te mostramos las instrucciones exactas para este medio.
                </p>
              </div>
            ) : null}

            {paymentStrategy === "auto" && hasAutomaticPayment ? (
              <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                Vas a confirmar tus datos y después te llevamos al pago seguro para finalizar la compra.
              </div>
            ) : (
              !hasPaymentOptions ? (
                <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Esta tienda todavía no expone medios de pago online. Igual podés dejar la orden preparada.
                </div>
              ) : null
            )}

            <div className="flex justify-end">
              <SubmitButton
                disabled={!hasValidSelectedShipping}
                paymentStrategy={paymentStrategy}
              />
            </div>
            {!hasValidSelectedShipping ? (
              <p className="text-right text-sm text-muted-foreground">
                Seleccioná un envío válido desde el carrito para finalizar la compra.
              </p>
            ) : null}
          </div>
        </CheckoutStepCard>

        {state.status === "error" && state.message ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {state.message}
          </div>
        ) : null}
      </div>

      <aside className="space-y-5 lg:self-start">
        <div className="rounded-[28px] border border-border/70 bg-background p-5 shadow-sm lg:sticky lg:top-32 lg:h-fit xl:top-36">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Resumen
              </p>
              <h2 className="text-[1.9rem] font-semibold tracking-[-0.03em] text-foreground">
                Tu pedido
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-sm text-muted-foreground">
              <ShoppingBag className="size-4" />
              {displayItemsCount} {displayItemsCount === 1 ? "item" : "items"}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {displayItems.length > 0 ? (
              displayItems.map((item) => (
                <SummaryItem key={`${item.productId}-${item.quantity}`} item={item} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                No encontramos productos precargados para este checkout.
              </div>
            )}
          </div>

          <Separator className="my-5" />

          <div className="space-y-3 text-sm">
            {selectedPaymentMethod ? (
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Medio elegido
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {selectedPaymentMethod.displayName}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {selectedPaymentMethod.methodType === "automatic"
                      ? selectedInstallmentAmount && installmentsCount
                        ? `${installmentsCount} cuotas de ${formatCurrency(selectedInstallmentAmount)} sin interés. Total estimado ${formatCurrency(checkoutValueWithShipping)}.`
                        : "Pagás online con el total confirmado al momento de procesar el pago."
                      : selectedDiscountAmount > 0
                        ? `Con este medio ahorrás ${formatCurrency(selectedDiscountAmount)} sobre el total.`
                        : "Al continuar te mostramos las instrucciones exactas para concretar el pago."}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{checkoutValue > 0 ? formatCurrency(checkoutValue) : "A confirmar"}</span>
            </div>
            <ShippingSummary
              snapshot={selectedShippingSnapshot}
              expired={isSelectedShippingExpired}
            />
            {selectedShippingAmount > 0 ? (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Envío</span>
                <span>{formatCurrency(selectedShippingAmount)}</span>
              </div>
            ) : null}
            {selectedDiscountAmount > 0 ? (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Descuento aplicado</span>
                <span>-{formatCurrency(selectedDiscountAmount)}</span>
              </div>
            ) : null}
            {selectedInstallmentAmount && installmentsCount ? (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{`${installmentsCount} cuotas sin interés`}</span>
                <span>{formatCurrency(selectedInstallmentAmount)} c/u</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-base font-semibold text-foreground">
              <span>{selectedDiscountAmount > 0 ? "Total con descuento" : "Total estimado"}</span>
              <span>
                {checkoutValue > 0
                  ? formatCurrency(
                      selectedDiscountAmount > 0
                        ? selectedDiscountedTotalWithShipping
                        : checkoutValueWithShipping,
                    )
                  : "Se confirma al crear la orden"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
