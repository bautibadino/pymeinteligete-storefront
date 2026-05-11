import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

type AnalyticsItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  brand?: string;
  category?: string;
};

type CommercePayloadBase = {
  eventId: string;
  items: AnalyticsItem[];
  orderToken?: string;
  value: number;
};

type CatalogAnalyticsItem = Omit<AnalyticsItem, "quantity"> & {
  quantity?: number;
};

type SingleItemPayloadInput = {
  eventId: string;
  item: CatalogAnalyticsItem | undefined;
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

function normalizeItem(item: CatalogAnalyticsItem | undefined, quantity = item?.quantity ?? 1): AnalyticsItem {
  if (!item) {
    throw new Error("No se pudo construir el payload de analytics sin item.");
  }

  return {
    id: item.id,
    name: item.name,
    price: item.price,
    quantity,
    ...(item.brand ? { brand: item.brand } : {}),
    ...(item.category ? { category: item.category } : {}),
  };
}

export function buildViewItemListPayload({
  eventId,
  items,
  listId,
  listName,
}: {
  eventId: string;
  items: CatalogAnalyticsItem[];
  listId: string;
  listName: string;
}) {
  const normalizedItems = items.map((item) => normalizeItem(item));

  return {
    eventId,
    currency: "ARS",
    content_type: "product_group",
    content_ids: normalizedItems.map((item) => item.id),
    item_list_id: listId,
    item_list_name: listName,
    items: normalizedItems,
  };
}

export function buildSelectItemPayload({
  eventId,
  index,
  item,
  listId,
  listName,
}: SingleItemPayloadInput & {
  index: number;
  listId: string;
  listName: string;
}) {
  const normalizedItem = normalizeItem(item);

  return {
    ...buildCommercePayload({
      eventId,
      items: [normalizedItem],
      value: normalizedItem.price * normalizedItem.quantity,
    }),
    item_list_id: listId,
    item_list_name: listName,
    index,
  };
}

export function buildViewItemPayload({ eventId, item }: SingleItemPayloadInput) {
  const normalizedItem = normalizeItem(item);

  return {
    ...buildCommercePayload({
      eventId,
      items: [normalizedItem],
      value: normalizedItem.price * normalizedItem.quantity,
    }),
    content_name: normalizedItem.name,
  };
}

export function buildAddToCartPayload({
  eventId,
  item,
  quantity,
}: SingleItemPayloadInput & {
  quantity: number;
}) {
  const normalizedItem = normalizeItem(item, quantity);

  return buildCommercePayload({
    eventId,
    items: [normalizedItem],
    value: normalizedItem.price * normalizedItem.quantity,
  });
}

export function buildSearchPayload({
  eventId,
  resultsCount,
  searchTerm,
}: {
  eventId: string;
  resultsCount?: number;
  searchTerm: string;
}) {
  return {
    eventId,
    search_string: searchTerm,
    content_category: "catalog",
    ...(resultsCount !== undefined ? { results_count: resultsCount } : {}),
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

export function buildAddShippingInfoPayload(
  input: CommercePayloadBase & {
    shippingAmount: number;
    shippingTier: string;
  },
) {
  return {
    ...buildCommercePayload(input),
    shipping: input.shippingAmount,
    shipping_tier: input.shippingTier,
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

export function buildLeadPayload({
  eventId,
  label,
  method,
  surface,
}: {
  eventId: string;
  label: string;
  method: string;
  surface: string;
}) {
  return {
    eventId,
    content_name: label,
    content_category: surface,
    contact_method: method,
  };
}
