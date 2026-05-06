import type { StorefrontShippingCheckoutSnapshot } from "@/lib/types/storefront";

type StoredShippingSnapshotCandidate = Partial<StorefrontShippingCheckoutSnapshot>;

function isFinitePrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
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
    snapshot.provider !== "andreani" ||
    snapshot.currency !== "ARS" ||
    typeof snapshot.optionId !== "string" ||
    typeof snapshot.carrierName !== "string" ||
    typeof snapshot.serviceName !== "string" ||
    typeof snapshot.destinationPostalCode !== "string" ||
    typeof snapshot.quotedAt !== "string" ||
    typeof snapshot.expiresAt !== "string" ||
    !Array.isArray(snapshot.packages) ||
    !isFinitePrice(snapshot.priceWithTax) ||
    !isFinitePrice(snapshot.priceWithoutTax)
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

