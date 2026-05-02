export interface StorefrontCartItemPrice {
  amount: number;
  currency?: string;
  formatted: string;
}

export interface StorefrontCartItem {
  productId: string;
  slug: string;
  name: string;
  brand?: string;
  href: string;
  imageUrl?: string;
  price: StorefrontCartItemPrice;
  quantity: number;
}

export function resolveCartItemPrice(input: {
  price: StorefrontCartItemPrice;
  basePrice?: StorefrontCartItemPrice | undefined;
}): StorefrontCartItemPrice {
  const { price, basePrice } = input;

  if (!basePrice) {
    return price;
  }

  return {
    amount: basePrice.amount,
    formatted: basePrice.formatted,
    ...(basePrice.currency ? { currency: basePrice.currency } : {}),
  };
}

export const STOREFRONT_CART_UI_MODES = [
  "drawer",
  "floating-drawer",
  "bubble",
] as const;

export type StorefrontCartUiMode = (typeof STOREFRONT_CART_UI_MODES)[number];

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getMultiValue(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function buildCheckoutHrefFromCartItems(items: StorefrontCartItem[]): string {
  const params = new URLSearchParams();

  for (const item of items) {
    const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    params.append("item", `${item.productId}:${quantity}`);
  }

  const query = params.toString();
  return query ? `/checkout?${query}` : "/checkout";
}

export function parseCheckoutItemsFromSearchParams(
  searchParams: SearchParamsRecord,
): Array<{ productId: string; quantity: number }> {
  const encodedItems = getMultiValue(searchParams.item);

  if (encodedItems.length > 0) {
    return encodedItems.flatMap((entry) => {
      const [productId, rawQuantity] = entry.split(":");
      const normalizedProductId = productId?.trim();
      const quantityValue = Number(rawQuantity);
      const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;

      return normalizedProductId ? [{ productId: normalizedProductId, quantity }] : [];
    });
  }

  const productId = getSingleValue(searchParams.productId)?.trim();
  const quantityValue = Number(getSingleValue(searchParams.quantity));
  const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;

  return productId ? [{ productId, quantity }] : [];
}
