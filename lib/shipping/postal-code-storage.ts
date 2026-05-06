export const STOREFRONT_SHIPPING_POSTAL_CODE_STORAGE_KEY =
  "pymeinteligente.storefront.shipping.postalCode.v1";
export const STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY =
  "pymeinteligente.storefront.shipping.selectedOption.v1";

const POSTAL_CODE_PATTERN = /^\d{4,8}$/;

export function normalizeShippingPostalCode(value: string): string | null {
  const normalized = value.replace(/\D/g, "").trim();

  return POSTAL_CODE_PATTERN.test(normalized) ? normalized : null;
}

export function readStoredShippingPostalCode(storage: Pick<Storage, "getItem">): string | null {
  const storedValue = storage.getItem(STOREFRONT_SHIPPING_POSTAL_CODE_STORAGE_KEY);

  return storedValue ? normalizeShippingPostalCode(storedValue) : null;
}

export function persistShippingPostalCode(
  storage: Pick<Storage, "setItem">,
  postalCode: string,
): string | null {
  const normalized = normalizeShippingPostalCode(postalCode);

  if (!normalized) {
    return null;
  }

  storage.setItem(STOREFRONT_SHIPPING_POSTAL_CODE_STORAGE_KEY, normalized);

  return normalized;
}

export function readStoredSelectedShippingOption<TSnapshot>(
  storage: Pick<Storage, "getItem">,
): TSnapshot | null {
  const storedValue = storage.getItem(STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as TSnapshot;
  } catch {
    return null;
  }
}

export function persistSelectedShippingOption<TSnapshot>(
  storage: Pick<Storage, "setItem">,
  snapshot: TSnapshot,
) {
  storage.setItem(STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearSelectedShippingOption(storage: Pick<Storage, "removeItem">) {
  storage.removeItem(STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY);
}
