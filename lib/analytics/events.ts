import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

type AnalyticsItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CommercePayloadBase = {
  eventId: string;
  items: AnalyticsItem[];
  orderToken?: string;
  value: number;
};

type ContactPayloadInput = {
  surface: string;
  method: string;
  orderToken: string;
  orderNumber: string;
  label: string;
};

function buildCommercePayload({
  eventId,
  items,
  orderToken,
  value,
}: CommercePayloadBase) {
  return {
    eventId,
    value,
    currency: "ARS",
    content_type: "product",
    ...(orderToken ? { order_token: orderToken } : {}),
    num_items: items.reduce((total, item) => total + item.quantity, 0),
    content_ids: items.map((item) => item.id),
    items,
  };
}

export function buildInitiateCheckoutPayload(input: CommercePayloadBase) {
  return buildCommercePayload(input);
}

export function buildAddPaymentInfoPayload(
  input: CommercePayloadBase & { methodLabel: string },
) {
  return {
    ...buildCommercePayload(input),
    payment_type: input.methodLabel,
  };
}

export function buildPurchasePayload(order: StorefrontOrderByTokenResult) {
  const items = order.items.map((item) => ({
    id: item.productId,
    name: item.description,
    price: item.unitPrice,
    quantity: item.quantity,
  }));

  return buildCommercePayload({
    eventId: order.orderNumber,
    items,
    value: order.total,
  });
}

export function buildContactPayload({
  label,
  method,
  orderNumber,
  orderToken,
  surface,
}: ContactPayloadInput) {
  return {
    content_name: label,
    content_category: surface,
    contact_method: method,
    order_token: orderToken,
    order_number: orderNumber,
  };
}
