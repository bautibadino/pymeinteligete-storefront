import type { StorefrontRequestContext } from "@/lib/runtime/storefront-request-context";

export type ShopStatus = "active" | "paused" | "draft" | "disabled";

export type StorefrontSuccessResponse<TData> = {
  success: true;
  data: TData;
};

export type StorefrontErrorResponse = {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
};

export type StorefrontResponseEnvelope<TData> =
  | StorefrontSuccessResponse<TData>
  | StorefrontErrorResponse;

export type StorefrontQueryPrimitive = string | number | boolean;
export type StorefrontQueryValue =
  | StorefrontQueryPrimitive
  | readonly StorefrontQueryPrimitive[]
  | null
  | undefined;
export type StorefrontQueryParams = Record<string, StorefrontQueryValue>;

export type StorefrontFetchInput = string | StorefrontRequestContext;

export interface StorefrontTenantIdentity {
  [key: string]: unknown;
  tenantSlug?: string | null;
  host?: string | null;
  canonicalHost?: string | null;
  canonicalUrl?: string | null;
  displayName?: string | null;
}

export interface StorefrontBranding {
  [key: string]: unknown;
  name?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  theme?: unknown;
}

export interface StorefrontSeoConfig {
  [key: string]: unknown;
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  keywords?: string[] | null;
}

export interface StorefrontContact {
  [key: string]: unknown;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
}

export interface StorefrontContentModule {
  [key: string]: unknown;
  id?: string | null;
  type?: string | null;
  title?: string | null;
}

export interface StorefrontBootstrap {
  [key: string]: unknown;
  tenant?: StorefrontTenantIdentity;
  shopStatus: ShopStatus;
  branding?: StorefrontBranding;
  seo?: StorefrontSeoConfig;
  contact?: StorefrontContact;
  modules?: StorefrontContentModule[] | null;
  features?: unknown;
  paymentSettings?: unknown;
}

export interface StorefrontCatalogQuery extends StorefrontQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  category?: string;
  brand?: string;
  availability?: string;
}

export interface StorefrontPrice {
  [key: string]: unknown;
  amount?: number | null;
  currency?: string | null;
  compareAt?: number | null;
}

export interface StorefrontCatalogProduct {
  [key: string]: unknown;
  productId?: string | null;
  slug?: string | null;
  sku?: string | null;
  name?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  brand?: string | null;
  category?: string | null;
  price?: StorefrontPrice | null;
  availability?: unknown;
}

export interface StorefrontPagination {
  [key: string]: unknown;
  page?: number | null;
  pageSize?: number | null;
  totalItems?: number | null;
  totalPages?: number | null;
}

export interface StorefrontCatalog {
  [key: string]: unknown;
  items: StorefrontCatalogProduct[];
  pagination?: StorefrontPagination;
  filters?: unknown;
}

export interface StorefrontCategory {
  [key: string]: unknown;
  categoryId?: string | null;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  imageUrl?: string | null;
}

export interface StorefrontProductDetail {
  [key: string]: unknown;
  productId?: string | null;
  slug?: string | null;
  sku?: string | null;
  name?: string | null;
  description?: string | null;
  images?: string[] | null;
  category?: string | null;
  brand?: string | null;
  price?: StorefrontPrice | null;
  availability?: unknown;
  deliveryInfo?: unknown;
  commercialInfo?: unknown;
}

export interface StorefrontPaymentMethod {
  [key: string]: unknown;
  id?: string | null;
  code?: string | null;
  name?: string | null;
  provider?: string | null;
  discountLabel?: string | null;
  publicConfig?: unknown;
}

export interface StorefrontPaymentMethods {
  [key: string]: unknown;
  items: StorefrontPaymentMethod[];
}

export interface StorefrontCustomerInput {
  name: string;
  email: string;
  phone?: string;
  dni?: string;
  taxId?: string;
  taxCondition?: string;
  taxIdType?: string;
}

export interface StorefrontAddressInput {
  street: string;
  number: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface StorefrontCheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface StorefrontAnalyticsInput {
  [key: string]: string | null | undefined;
  fbc?: string;
  fbp?: string;
  ga_client_id?: string;
}

export interface StorefrontCheckoutRequest {
  customer: StorefrontCustomerInput;
  shippingAddress: StorefrontAddressInput;
  billingAddress?: StorefrontAddressInput;
  items: StorefrontCheckoutItemInput[];
  notes?: string;
  idempotencyKey: string;
  analytics?: StorefrontAnalyticsInput;
}

export interface StorefrontCheckoutResult {
  [key: string]: unknown;
  orderId: string;
  orderToken: string;
  orderNumber: string;
  total: number;
}

export interface StorefrontPaymentPayer {
  email?: string;
  identification?: {
    type?: string;
    number?: string;
  };
}

export interface StorefrontPaymentData {
  [key: string]: unknown;
  token?: string;
  payment_method_id?: string;
  transaction_amount?: number;
  installments?: number;
  payer?: StorefrontPaymentPayer;
}

export interface StorefrontProcessPaymentRequest {
  orderId: string;
  idempotencyKey: string;
  paymentData: StorefrontPaymentData;
}

export interface StorefrontProcessPaymentResult {
  [key: string]: unknown;
  paymentId?: string | null;
  status?: string | null;
  statusDetail?: string | null;
  orderId?: string | null;
}

export interface StorefrontOrderCustomer {
  [key: string]: unknown;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface StorefrontOrderLine {
  [key: string]: unknown;
  productId?: string | null;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  total?: number | null;
}

export interface StorefrontOrderPayment {
  [key: string]: unknown;
  provider?: string | null;
  reference?: string | null;
  status?: string | null;
}

export interface StorefrontOrderByTokenResult {
  [key: string]: unknown;
  orderId?: string | null;
  orderNumber?: string | null;
  status?: string | null;
  isPaid?: boolean | null;
  total?: number | null;
  customer?: StorefrontOrderCustomer;
  items?: StorefrontOrderLine[] | null;
  payment?: StorefrontOrderPayment | null;
}

// TODO: el payload final del flujo manual no está documentado en la fuente actual.
export type StorefrontManualPaymentRequest = Record<string, unknown>;

// TODO: la respuesta final del flujo manual no está congelada en la documentación actual.
export type StorefrontManualPaymentResult = Record<string, unknown>;
