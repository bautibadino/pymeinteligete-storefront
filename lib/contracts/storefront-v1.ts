export const STOREFRONT_API_PREFIX = "/api/storefront/v1";

export const STOREFRONT_HEADERS = {
  host: "x-storefront-host",
  tenantSlug: "x-tenant-slug",
  version: "x-storefront-version",
  requestId: "x-request-id",
  idempotencyKey: "Idempotency-Key",
} as const;

export const STOREFRONT_API_PATHS = {
  bootstrap: `${STOREFRONT_API_PREFIX}/bootstrap`,
  catalog: `${STOREFRONT_API_PREFIX}/catalog`,
  cartValidate: `${STOREFRONT_API_PREFIX}/cart/validate`,
  categories: `${STOREFRONT_API_PREFIX}/categories`,
  facebookCatalog: `${STOREFRONT_API_PREFIX}/catalog/facebook`,
  shippingQuote: `${STOREFRONT_API_PREFIX}/shipping/quote`,
  shippingBranches: `${STOREFRONT_API_PREFIX}/shipping/branches`,
  paymentMethods: `${STOREFRONT_API_PREFIX}/payment-methods`,
  contact: `${STOREFRONT_API_PREFIX}/contact`,
  checkout: `${STOREFRONT_API_PREFIX}/checkout`,
  processPayment: `${STOREFRONT_API_PREFIX}/payments/process`,
  product(slug: string) {
    return `${STOREFRONT_API_PREFIX}/products/${encodeURIComponent(slug)}`;
  },
  orderByToken(token: string) {
    return `${STOREFRONT_API_PREFIX}/orders/${encodeURIComponent(token)}`;
  },
  manualPayment(token: string) {
    return `${STOREFRONT_API_PREFIX}/orders/${encodeURIComponent(token)}/payment/manual`;
  },
} as const;

export const STOREFRONT_INTERNAL_ERROR_CODES = {
  missingApiBaseUrl: "MISSING_API_BASE_URL",
  invalidJson: "INVALID_JSON_RESPONSE",
  invalidEnvelope: "INVALID_RESPONSE_ENVELOPE",
  network: "STOREFRONT_NETWORK_ERROR",
} as const;
