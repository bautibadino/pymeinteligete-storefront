import type {
  StorefrontShippingCheckoutSnapshot,
  StorefrontShippingDeliveryMode,
  StorefrontShippingQuoteOption,
} from "@/lib/types/storefront";

type StoredShippingSnapshotCandidate = Partial<StorefrontShippingCheckoutSnapshot>;
type ShippingCostSource = Pick<StorefrontShippingCheckoutSnapshot, "deliveryType" | "priceWithTax"> &
  Partial<
    Pick<
      StorefrontShippingCheckoutSnapshot,
      | "originalShippingCost"
      | "finalShippingCost"
      | "discountAmount"
      | "isFreeShipping"
      | "benefit"
      | "benefitHint"
    >
  >;

function isFinitePrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isDeliveryMode(value: unknown): value is StorefrontShippingDeliveryMode {
  return value === "home_delivery" || value === "carrier_branch" || value === "pickup";
}

function isOptionalFinitePrice(value: unknown): boolean {
  return value === undefined || isFinitePrice(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidBenefit(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.kind === "none" || value.kind === "free" || value.kind === "partial") &&
    isFinitePrice(value.amount) &&
    isFinitePrice(value.originalPriceWithTax) &&
    isFinitePrice(value.finalPriceWithTax) &&
    typeof value.label === "string" &&
    isOptionalString(value.reason)
  );
}

function isValidBenefitHint(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  return (
    value.kind === "free_shipping_min_subtotal" &&
    typeof value.ruleId === "string" &&
    typeof value.ruleName === "string" &&
    isDeliveryMode(value.deliveryType) &&
    isFinitePrice(value.minSubtotal) &&
    isFinitePrice(value.remainingSubtotal) &&
    value.remainingSubtotal > 0 &&
    typeof value.label === "string"
  );
}

export function normalizeStoredShippingCheckoutSnapshot(
  value: unknown,
): StorefrontShippingCheckoutSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const snapshot = value as StoredShippingSnapshotCandidate;

  if (
    snapshot.contractVersion !== "storefront.shipping.quote.v1" ||
    typeof snapshot.provider !== "string" ||
    !snapshot.provider.trim() ||
    snapshot.currency !== "ARS" ||
    typeof snapshot.optionId !== "string" ||
    typeof snapshot.carrierName !== "string" ||
    typeof snapshot.serviceName !== "string" ||
    typeof snapshot.destinationPostalCode !== "string" ||
    typeof snapshot.quotedAt !== "string" ||
    typeof snapshot.expiresAt !== "string" ||
    !Array.isArray(snapshot.packages) ||
    !isFinitePrice(snapshot.priceWithTax) ||
    !isFinitePrice(snapshot.priceWithoutTax) ||
    (snapshot.deliveryType !== undefined && !isDeliveryMode(snapshot.deliveryType)) ||
    !isOptionalFinitePrice(snapshot.originalShippingCost) ||
    !isOptionalFinitePrice(snapshot.finalShippingCost) ||
    !isOptionalFinitePrice(snapshot.discountAmount) ||
    (snapshot.isFreeShipping !== undefined && typeof snapshot.isFreeShipping !== "boolean") ||
    !isOptionalString(snapshot.displayMessage) ||
    !isValidBenefit(snapshot.benefit) ||
    !isValidBenefitHint(snapshot.benefitHint)
  ) {
    return null;
  }

  return snapshot as StorefrontShippingCheckoutSnapshot;
}

export function isShippingCheckoutSnapshotExpired(
  snapshot: StorefrontShippingCheckoutSnapshot,
  now = new Date(),
): boolean {
  const expiresAt = Date.parse(snapshot.expiresAt);

  return Number.isNaN(expiresAt) || expiresAt <= now.getTime();
}

export function getShippingDeliveryMode(
  value: Pick<StorefrontShippingCheckoutSnapshot, "deliveryType"> | null | undefined,
): StorefrontShippingDeliveryMode {
  return value?.deliveryType ?? "home_delivery";
}

export function getShippingDeliveryModeLabel(
  value: Pick<StorefrontShippingCheckoutSnapshot, "deliveryType"> | null | undefined,
): string {
  switch (getShippingDeliveryMode(value)) {
    case "carrier_branch":
      return "Andreani - retiro en sucursal";
    case "pickup":
      return "Retiro local";
    case "home_delivery":
    default:
      return "Envío a domicilio";
  }
}

export function getShippingOriginalCost(value: ShippingCostSource): number {
  return value.originalShippingCost ?? value.priceWithTax;
}

export function getShippingFinalCost(value: ShippingCostSource): number {
  return value.finalShippingCost ?? value.priceWithTax;
}

export function getShippingDiscountAmount(value: ShippingCostSource): number {
  if (typeof value.discountAmount === "number") {
    return value.discountAmount;
  }

  return Math.max(0, getShippingOriginalCost(value) - getShippingFinalCost(value));
}

export function hasExplicitShippingBenefit(value: ShippingCostSource): boolean {
  return Boolean(
    (value.benefit && value.benefit.kind !== "none") ||
      value.isFreeShipping === true ||
      getShippingDiscountAmount(value) > 0,
  );
}

export function getShippingBenefitLabel(value: ShippingCostSource): string | null {
  if (value.benefit?.label) {
    return value.benefit.label;
  }

  if (value.isFreeShipping) {
    return "Envío gratis";
  }

  return null;
}

export function getShippingBenefitHintLabel(value: ShippingCostSource): string | null {
  return value.benefitHint?.label ?? null;
}

export function requiresHomeShippingAddress(
  value: Pick<StorefrontShippingCheckoutSnapshot, "deliveryType"> | null | undefined,
): boolean {
  return getShippingDeliveryMode(value) === "home_delivery";
}

export function normalizeShippingQuoteOptionCosts(
  option: StorefrontShippingQuoteOption,
): StorefrontShippingQuoteOption {
  const deliveryType = option.checkoutSnapshot.deliveryType ?? option.deliveryType;
  const originalShippingCost =
    option.checkoutSnapshot.originalShippingCost ?? option.originalShippingCost;
  const finalShippingCost = option.checkoutSnapshot.finalShippingCost ?? option.finalShippingCost;
  const discountAmount = option.checkoutSnapshot.discountAmount ?? option.discountAmount;
  const isFreeShipping = option.checkoutSnapshot.isFreeShipping ?? option.isFreeShipping;
  const displayMessage = option.checkoutSnapshot.displayMessage ?? option.displayMessage;
  const benefit = option.checkoutSnapshot.benefit ?? option.benefit;
  const benefitHint = option.checkoutSnapshot.benefitHint ?? option.benefitHint;
  const selectedCarrierBranch =
    option.checkoutSnapshot.selectedCarrierBranch ?? option.selectedCarrierBranch;
  const pickupLocation = option.checkoutSnapshot.pickupLocation ?? option.pickupLocation;

  return {
    ...option,
    checkoutSnapshot: {
      ...option.checkoutSnapshot,
      ...(deliveryType ? { deliveryType } : {}),
      ...(originalShippingCost !== undefined ? { originalShippingCost } : {}),
      ...(finalShippingCost !== undefined ? { finalShippingCost } : {}),
      ...(discountAmount !== undefined ? { discountAmount } : {}),
      ...(isFreeShipping !== undefined ? { isFreeShipping } : {}),
      ...(displayMessage !== undefined ? { displayMessage } : {}),
      ...(benefit !== undefined ? { benefit } : {}),
      ...(benefitHint !== undefined ? { benefitHint } : {}),
      ...(selectedCarrierBranch !== undefined ? { selectedCarrierBranch } : {}),
      ...(pickupLocation !== undefined ? { pickupLocation } : {}),
    },
  };
}
