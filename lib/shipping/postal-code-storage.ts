export const STOREFRONT_SHIPPING_POSTAL_CODE_STORAGE_KEY =
  "pymeinteligente.storefront.shipping.postalCode.v1";
export const STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY =
  "pymeinteligente.storefront.shipping.selectedOption.v1";

const POSTAL_CODE_PATTERN = /^\d{4,8}$/;

export type StorefrontShippingStorageScope = {
  host?: string;
  cartKey?: string;
  deliveryMode?: "home_delivery" | "carrier_branch" | "pickup";
};

type ScopedSelectedShippingOption<TSnapshot> = {
  scope: Required<StorefrontShippingStorageScope>;
  snapshot: TSnapshot;
};

function normalizeScopeValue(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function encodeScopeValue(value: string): string {
  return encodeURIComponent(value).replaceAll("%", "_");
}

export function buildShippingStorageScope(
  scope: StorefrontShippingStorageScope,
): Required<StorefrontShippingStorageScope> {
  return {
    host: normalizeScopeValue(scope.host),
    cartKey: scope.cartKey?.trim() ?? "",
    deliveryMode: scope.deliveryMode ?? "home_delivery",
  };
}

function buildPostalCodeStorageKey(scope?: StorefrontShippingStorageScope): string {
  if (!scope?.host) {
    return STOREFRONT_SHIPPING_POSTAL_CODE_STORAGE_KEY;
  }

  const normalized = buildShippingStorageScope(scope);
  return `${STOREFRONT_SHIPPING_POSTAL_CODE_STORAGE_KEY}:${encodeScopeValue(normalized.host)}`;
}

function buildSelectedOptionStorageKey(scope?: StorefrontShippingStorageScope): string {
  if (!scope?.host && !scope?.cartKey) {
    return STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY;
  }

  const normalized = buildShippingStorageScope(scope ?? {});
  return [
    STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY,
    encodeScopeValue(normalized.host),
    encodeScopeValue(normalized.cartKey),
  ].join(":");
}

function scopesMatch(
  stored: StorefrontShippingStorageScope | undefined,
  expected: StorefrontShippingStorageScope | undefined,
): boolean {
  if (!expected) {
    return true;
  }

  if (!stored) {
    return false;
  }

  const normalizedStored = buildShippingStorageScope(stored);
  const normalizedExpected = buildShippingStorageScope(expected);

  return (
    normalizedStored.host === normalizedExpected.host &&
    normalizedStored.cartKey === normalizedExpected.cartKey &&
    (!expected.deliveryMode || normalizedStored.deliveryMode === normalizedExpected.deliveryMode)
  );
}

function readSnapshotDeliveryMode(snapshot: unknown): StorefrontShippingStorageScope["deliveryMode"] {
  if (!snapshot || typeof snapshot !== "object") {
    return undefined;
  }

  const value = (snapshot as { deliveryType?: unknown }).deliveryType;

  return value === "carrier_branch" || value === "pickup" || value === "home_delivery"
    ? value
    : undefined;
}

export function normalizeShippingPostalCode(value: string): string | null {
  const normalized = value.replace(/\D/g, "").trim();

  return POSTAL_CODE_PATTERN.test(normalized) ? normalized : null;
}

export function readStoredShippingPostalCode(
  storage: Pick<Storage, "getItem">,
  scope?: StorefrontShippingStorageScope,
): string | null {
  const storedValue = storage.getItem(buildPostalCodeStorageKey(scope));

  return storedValue ? normalizeShippingPostalCode(storedValue) : null;
}

export function persistShippingPostalCode(
  storage: Pick<Storage, "setItem">,
  postalCode: string,
  scope?: StorefrontShippingStorageScope,
): string | null {
  const normalized = normalizeShippingPostalCode(postalCode);

  if (!normalized) {
    return null;
  }

  storage.setItem(buildPostalCodeStorageKey(scope), normalized);

  return normalized;
}

export function readStoredSelectedShippingOption<TSnapshot>(
  storage: Pick<Storage, "getItem">,
  scope?: StorefrontShippingStorageScope,
): TSnapshot | null {
  const storedValue = storage.getItem(buildSelectedOptionStorageKey(scope));

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue) as
      | TSnapshot
      | ScopedSelectedShippingOption<TSnapshot>;

    if (
      parsed &&
      typeof parsed === "object" &&
      "snapshot" in parsed &&
      "scope" in parsed
    ) {
      const scoped = parsed as ScopedSelectedShippingOption<TSnapshot>;
      return scopesMatch(scoped.scope, scope) ? scoped.snapshot : null;
    }

    return scope ? null : (parsed as TSnapshot);
  } catch {
    return null;
  }
}

export function persistSelectedShippingOption<TSnapshot>(
  storage: Pick<Storage, "setItem">,
  snapshot: TSnapshot,
  scope?: StorefrontShippingStorageScope,
) {
  if (!scope) {
    storage.setItem(STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY, JSON.stringify(snapshot));
    return;
  }

  const deliveryMode = scope.deliveryMode ?? readSnapshotDeliveryMode(snapshot);
  const normalizedScope = buildShippingStorageScope({
    ...scope,
    ...(deliveryMode ? { deliveryMode } : {}),
  });

  storage.setItem(
    buildSelectedOptionStorageKey(normalizedScope),
    JSON.stringify({
      scope: normalizedScope,
      snapshot,
    }),
  );
}

export function clearSelectedShippingOption(
  storage: Pick<Storage, "removeItem">,
  scope?: StorefrontShippingStorageScope,
) {
  storage.removeItem(buildSelectedOptionStorageKey(scope));
}
