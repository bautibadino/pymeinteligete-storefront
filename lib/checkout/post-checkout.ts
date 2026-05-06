import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";
import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

function normalizeLineCollection(
  lines: Array<{ productId: string; quantity: number }>,
): string[] {
  return lines
    .map((line) => `${line.productId}:${line.quantity}`)
    .sort((left, right) => left.localeCompare(right));
}

export function shouldTrackPurchase(order: StorefrontOrderByTokenResult): boolean {
  if (order.isPaid) {
    return true;
  }

  const normalizedStatus = order.status.trim().toLowerCase();
  return normalizedStatus === "approved" || normalizedStatus === "acreditado";
}

export function shouldClearCartForOrder(
  order: StorefrontOrderByTokenResult,
  cartItems: StorefrontCartItem[],
  now = Date.now(),
): boolean {
  if (cartItems.length === 0 || order.items.length === 0) {
    return false;
  }

  const createdAtTimestamp = new Date(order.createdAt).getTime();
  if (!Number.isFinite(createdAtTimestamp) || now - createdAtTimestamp > 30 * 60 * 1000) {
    return false;
  }

  const normalizedOrderItems = normalizeLineCollection(order.items);
  const normalizedCartItems = normalizeLineCollection(cartItems);

  if (normalizedOrderItems.length !== normalizedCartItems.length) {
    return false;
  }

  return normalizedOrderItems.every((item, index) => item === normalizedCartItems[index]);
}
