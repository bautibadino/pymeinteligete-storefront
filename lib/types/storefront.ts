import type { StorefrontRequestContext } from "@/lib/runtime/storefront-request-context";

// ─────────────────────────────────────────────────────────────
// Envelope base (común a todos los endpoints)
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Query / fetch helpers
// ─────────────────────────────────────────────────────────────

export type StorefrontQueryPrimitive = string | number | boolean;
export type StorefrontQueryValue =
  | StorefrontQueryPrimitive
  | readonly StorefrontQueryPrimitive[]
  | null
  | undefined;
export type StorefrontQueryParams = Record<string, StorefrontQueryValue>;

export type StorefrontFetchInput = string | StorefrontRequestContext;

// ─────────────────────────────────────────────────────────────
// Tenant
// ─────────────────────────────────────────────────────────────

export type ShopStatus = "active" | "paused" | "draft" | "disabled";

export type ResolvedBy = "custom_domain" | "platform_subdomain" | "dev_fallback";

export interface StorefrontTenantIdentity {
  tenantSlug: string;
  empresaId: string;
  status: ShopStatus;
  resolvedHost: string;
  resolvedBy: ResolvedBy;
  canonicalDomain?: string;
}

// ─────────────────────────────────────────────────────────────
// Branding
// ─────────────────────────────────────────────────────────────

export interface StorefrontBrandingColors {
  primary: string;
  secondary?: string;
  accent?: string;
  neutral?: string;
}

export interface StorefrontBrandingTypography {
  heading?: string;
  body?: string;
}

export interface StorefrontBranding {
  storeName: string;
  legalName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  colors: StorefrontBrandingColors;
  typography?: StorefrontBrandingTypography;
}

// ─────────────────────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────────────────────

export interface StorefrontTheme {
  preset: string;
  layout: string;
  tokensVersion?: string;
}

// ─────────────────────────────────────────────────────────────
// SEO
// ─────────────────────────────────────────────────────────────

export interface StorefrontSeoConfig {
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  ogImage?: string;
  keywords?: string[];
}

// ─────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────

export interface StorefrontNavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface StorefrontFooterColumn {
  title: string;
  links: StorefrontNavLink[];
}

export interface StorefrontNavigation {
  headerLinks: StorefrontNavLink[];
  footerColumns: StorefrontFooterColumn[];
}

// ─────────────────────────────────────────────────────────────
// Home modules
// ─────────────────────────────────────────────────────────────

export type StorefrontModuleType =
  | "hero"
  | "ticker"
  | "trust_chips"
  | "intent_cards"
  | "product_collection"
  | "reviews"
  | "info_banners";

export interface StorefrontContentModule {
  id: string;
  type: StorefrontModuleType;
  enabled: boolean;
  order: number;
  payload: Record<string, unknown>;
}

export interface StorefrontHomeConfig {
  modules: StorefrontContentModule[];
}

// ─────────────────────────────────────────────────────────────
// Contact
// ─────────────────────────────────────────────────────────────

export interface StorefrontSocialLinks {
  facebook?: string;
  instagram?: string;
}

export interface StorefrontContact {
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  social?: StorefrontSocialLinks;
}

// ─────────────────────────────────────────────────────────────
// Commerce
// ─────────────────────────────────────────────────────────────

export interface StorefrontInstallmentsConfig {
  enabled: boolean;
  count?: number;
  label?: string;
}

export interface StorefrontCommercePayment {
  visibleMethods: string[];
  publicKey?: string;
  installments?: StorefrontInstallmentsConfig;
}

export interface StorefrontCommerceConfig {
  payment: StorefrontCommercePayment;
}

// ─────────────────────────────────────────────────────────────
// Features
// ─────────────────────────────────────────────────────────────

export interface StorefrontFeatures {
  reviewsEnabled: boolean;
  compareEnabled: boolean;
  wishlistEnabled: boolean;
  contactBarEnabled: boolean;
  searchEnabled: boolean;
}

// ─────────────────────────────────────────────────────────────
// Pages
// ─────────────────────────────────────────────────────────────

export interface StorefrontPage {
  slug: string;
  title: string;
  excerpt?: string;
}

// ─────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────

export interface StorefrontPixelConfig {
  enabled: boolean;
  pixelId?: string;
  testEventCode?: string;
}

export interface StorefrontAnalytics {
  pixel?: StorefrontPixelConfig;
}

// ─────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────

export interface StorefrontRequestContextData {
  requestId: string;
  storefrontVersion: string;
  apiVersion: "v1";
}

export interface StorefrontBootstrap {
  requestContext: StorefrontRequestContextData;
  tenant: StorefrontTenantIdentity;
  branding: StorefrontBranding;
  theme: StorefrontTheme;
  seo: StorefrontSeoConfig;
  navigation: StorefrontNavigation;
  home: StorefrontHomeConfig;
  contact?: StorefrontContact;
  commerce: StorefrontCommerceConfig;
  features: StorefrontFeatures;
  pages: StorefrontPage[];
  analytics?: StorefrontAnalytics;
  presentation?: import("@/lib/types/presentation").Presentation;
}

// ─────────────────────────────────────────────────────────────
// Catalog
// ─────────────────────────────────────────────────────────────

export interface StorefrontCatalogQuery extends StorefrontQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "price" | "createdAt" | "brand";
  sortOrder?: "asc" | "desc";
  search?: string;
  categoryId?: string;
  brand?: string;
  family?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyImmediate?: boolean;
}

export interface StorefrontPrice {
  amount: number;
  currency: string;
  compareAt?: number;
}

export interface StorefrontCatalogProduct {
  productId: string;
  slug: string;
  sku?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  brand?: string;
  category?: string;
  price?: StorefrontPrice;
  availability?: unknown;
}

export interface StorefrontPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface StorefrontCatalog {
  products: StorefrontCatalogProduct[];
  pagination: StorefrontPagination;
}

// ─────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────

export interface StorefrontCategory {
  categoryId: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  children?: StorefrontCategory[];
}

// ─────────────────────────────────────────────────────────────
// Product detail
// ─────────────────────────────────────────────────────────────

export interface StorefrontProductDetail {
  productId: string;
  slug: string;
  sku?: string;
  name: string;
  description?: string;
  images?: string[];
  category?: string;
  brand?: string;
  price?: StorefrontPrice;
  availability?: unknown;
  deliveryInfo?: unknown;
  commercialInfo?: unknown;
}

// ─────────────────────────────────────────────────────────────
// Payment methods
// ─────────────────────────────────────────────────────────────

export interface StorefrontPaymentMethodDiscount {
  type: "percentage" | "fixed";
  value: number;
}

export interface StorefrontPaymentMethod {
  methodId: string;
  methodType: string;
  displayName: string;
  description: string;
  icon: string | null;
  color: string | null;
  discount: StorefrontPaymentMethodDiscount | null;
}

export interface StorefrontPaymentMethods {
  paymentMethods: StorefrontPaymentMethod[];
}

// ─────────────────────────────────────────────────────────────
// Checkout
// ─────────────────────────────────────────────────────────────

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
  fbc?: string;
  fbp?: string;
  ga_client_id?: string;
  anonymous_id?: string;
}

export interface StorefrontCheckoutRequest {
  customer: StorefrontCustomerInput;
  shippingAddress: StorefrontAddressInput;
  billingAddress?: StorefrontAddressInput;
  items: StorefrontCheckoutItemInput[];
  notes?: string;
  idempotencyKey?: string;
  analytics?: StorefrontAnalyticsInput;
}

export interface StorefrontCheckoutResult {
  orderId: string;
  orderToken: string;
  orderNumber: string;
  total: number;
  payerEmail: string;
  idempotent?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Payment processing (MercadoPago)
// ─────────────────────────────────────────────────────────────

export interface StorefrontPaymentPayerIdentification {
  type: string;
  number: string;
}

export interface StorefrontPaymentPayer {
  email: string;
  identification?: StorefrontPaymentPayerIdentification;
}

export interface StorefrontPaymentData {
  token?: string;
  payment_method_id: string;
  transaction_amount: number;
  installments?: number;
  issuer_id?: string;
  payer: StorefrontPaymentPayer;
}

export interface StorefrontProcessPaymentRequest {
  orderId: string;
  idempotencyKey?: string;
  paymentData: StorefrontPaymentData;
}

export interface StorefrontProcessPaymentResult {
  paymentId: string;
  status: string;
  statusDetail: string;
  orderId: string;
  orderToken: string;
}

// ─────────────────────────────────────────────────────────────
// Order by token
// ─────────────────────────────────────────────────────────────

export interface StorefrontOrderCustomer {
  name: string;
  email: string;
  phone?: string;
}

export interface StorefrontOrderAddress {
  street: string;
  number: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface StorefrontOrderLine {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface StorefrontOrderPayment {
  provider: string;
  reference: string;
}

export interface StorefrontOrderByTokenResult {
  orderId: string;
  orderNumber: string;
  status: string;
  isPaid: boolean;
  total: number;
  createdAt: string;
  customer: StorefrontOrderCustomer;
  shippingAddress: StorefrontOrderAddress;
  items: StorefrontOrderLine[];
  payment: StorefrontOrderPayment | null;
}

// ─────────────────────────────────────────────────────────────
// Manual payment
// Contrato formalizado en ERP commit 5f0996a4.
// POST /api/storefront/v1/orders/:token/payment/manual
// ─────────────────────────────────────────────────────────────

export interface StorefrontManualPaymentRequest {
  methodId: string;
}

export interface StorefrontManualPaymentBankAccount {
  bank: string;
  cbu: string;
  alias?: string;
}

export interface StorefrontManualPaymentContactInfo {
  email?: string;
  phone?: string;
  whatsapp?: string;
}

export interface StorefrontManualPaymentResult {
  paymentAttemptId: string;
  orderId: string;
  orderToken: string;
  amount: number;
  instructions?: string;
  bankAccounts?: StorefrontManualPaymentBankAccount[];
  contactInfo?: StorefrontManualPaymentContactInfo;
  methodDisplayName: string;
}
