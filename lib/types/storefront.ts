import type { StorefrontRequestContext } from "@/lib/runtime/storefront-request-context";
import type { Presentation } from "@/lib/types/presentation";

// ─────────────────────────────────────────────────────────────
// Envelope base (común a todos los endpoints)
// ─────────────────────────────────────────────────────────────

export type StorefrontSuccessResponse<TData> = {
  success: true;
  data: TData;
};

export type StorefrontStructuredError = {
  code?: string;
  message: string;
  requestId?: string;
  details?: unknown;
  [key: string]: unknown;
};

export type StorefrontErrorResponse = {
  success: false;
  error: string | StorefrontStructuredError;
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
  host?: string | null;
  canonicalHost?: string | null;
  canonicalUrl?: string | null;
  displayName?: string | null;
  additionalDomains?: string[] | null;
  [key: string]: unknown;
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
  accent?: string;
}

export interface StorefrontBranding {
  storeName: string;
  legalName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  colors?: StorefrontBrandingColors;
  typography?: StorefrontBrandingTypography;
  name?: string | null;
  theme?: unknown;
}

// ─────────────────────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────────────────────

export interface StorefrontTheme {
  preset: string;
  layout: string;
  tokensVersion?: string;
}

export type StorefrontPresentation = Presentation;
export type StorefrontPresentationState = Presentation;

// ─────────────────────────────────────────────────────────────
// SEO
// ─────────────────────────────────────────────────────────────

export interface StorefrontSeoConfig {
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  ogImage?: string;
  keywords?: string[];
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  canonicalHost?: string | null;
  ogImageUrl?: string | null;
  [key: string]: unknown;
}

export interface StorefrontThemeConfig {
  [key: string]: unknown;
  preset?: string | null;
  layout?: string | null;
  tokensVersion?: string | null;
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

export type StorefrontContactFormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "select"
  | "checkbox"
  | "number"
  | "hidden";

export type StorefrontContactFormValue = string | number | boolean | null;

export interface StorefrontContactFormFieldOption {
  label: string;
  value: string;
}

export interface StorefrontContactFormFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface StorefrontContactFormField {
  id: string;
  key: string;
  type: StorefrontContactFormFieldType;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required: boolean;
  order: number;
  options?: StorefrontContactFormFieldOption[];
  defaultValue?: string | number | boolean;
  validation?: StorefrontContactFormFieldValidation;
  metadata?: Record<string, unknown>;
}

export interface StorefrontContactForm {
  enabled: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
  successMessage?: string;
  fields: StorefrontContactFormField[];
  version?: number;
}

export interface StorefrontContactFormSubmissionRequest {
  values: Record<string, StorefrontContactFormValue>;
  website?: string;
}

export interface StorefrontContactFormSubmissionResult {
  message?: string;
  submissionId?: string;
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
  shipping?: {
    message?: string;
    freeShippingThreshold?: number;
  };
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
  presentation?: Presentation;
  storefrontExperience?: StorefrontExperienceConfig;
  theme: StorefrontTheme | StorefrontThemeConfig;
  seo: StorefrontSeoConfig;
  navigation: StorefrontNavigation;
  home: StorefrontHomeConfig;
  contact?: StorefrontContact;
  contactForm?: StorefrontContactForm;
  commerce: StorefrontCommerceConfig;
  features: StorefrontFeatures;
  pages: StorefrontPage[];
  analytics?: StorefrontAnalytics;
  shopStatus?: ShopStatus;
  modules?: StorefrontContentModule[] | null;
  paymentSettings?: unknown;
  [key: string]: unknown;
}

export interface StorefrontExperienceConfig {
  key: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────
// Catalog
// ─────────────────────────────────────────────────────────────

export interface StorefrontCatalogQuery extends StorefrontQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "price" | "createdAt" | "brand";
  sortOrder?: "asc" | "desc";
  sort?: string;
  search?: string;
  categoryId?: string;
  category?: string;
  brand?: string;
  family?: string;
  slug?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyImmediate?: boolean;
  availability?: string | boolean;
  vehicleVersionId?: string;
}

export interface StorefrontImageAsset {
  url?: string;
  src?: string;
  imageUrl?: string;
  alt?: string;
  key?: string;
}

export type StorefrontImageSource = string | StorefrontImageAsset;

export interface StorefrontPrice {
  amount: number;
  currency: string;
  compareAt?: number;
  compareAtPrice?: number;
  discountedAmount?: number;
  discountedPrice?: number;
  value?: number;
}

export interface StorefrontBrandReference {
  _id?: string;
  id?: string;
  name?: string;
  label?: string;
  slug?: string;
  logo?: StorefrontImageAsset;
}

export interface StorefrontAttributeDefinition {
  fieldName: string;
  displayLabel?: string;
  label?: string;
  fieldType?: string;
  options?: Array<{ label?: string; value?: string }>;
  icon?: string;
}

export interface StorefrontCategoryReference {
  categoryId?: string;
  id?: string;
  slug?: string;
  name?: string;
  label?: string;
  attributeDefinitions?: StorefrontAttributeDefinition[];
}

export interface StorefrontInstallmentsData {
  enabled?: boolean;
  count?: number;
  amount?: number;
  value?: number;
  formatted?: string;
  label?: string;
  interestFree?: boolean;
}

export interface StorefrontDiscountData {
  percentage?: number;
  percent?: number;
  value?: number;
  label?: string;
  formatted?: string;
}

export interface StorefrontBadgeData {
  label?: string;
  text?: string;
  title?: string;
  name?: string;
  tone?: string;
  variant?: string;
  type?: string;
}

export interface StorefrontDeliveryInfo {
  freeShipping?: boolean;
  dispatchType?: string;
  dispatchLabel?: string;
  label?: string;
  message?: string;
  badges?: StorefrontBadgeData[];
}

export interface StorefrontCommercialInfo {
  compareAt?: number;
  compareAtPrice?: number;
  installments?: StorefrontInstallmentsData;
  discountedPrice?: number;
  bestDiscount?: StorefrontDiscountData;
  cashDiscount?: StorefrontDiscountData;
  badges?: StorefrontBadgeData[];
}

export interface StorefrontSpecificationEntry {
  label?: string;
  name?: string;
  key?: string;
  title?: string;
  value?: string | number | boolean | null;
  values?: Array<string | number | boolean | null>;
}

export interface StorefrontCatalogProduct {
  productId: string;
  slug: string;
  sku?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  images?: StorefrontImageSource[];
  brand?: string;
  brandId?: StorefrontBrandReference;
  category?: string;
  categoryId?: StorefrontCategoryReference;
  price?: StorefrontPrice;
  availability?: unknown;
  stock?: number;
  inStock?: boolean;
  freeShipping?: boolean;
  dispatchType?: string;
  ecommerceSlug?: string;
  discountedPrice?: number;
  bestDiscount?: StorefrontDiscountData;
  installments?: StorefrontInstallmentsData;
  badges?: StorefrontBadgeData[];
  deliveryInfo?: StorefrontDeliveryInfo;
  commercialInfo?: StorefrontCommercialInfo;
}

export interface StorefrontPagination {
  page: number;
  pageSize: number;
  limit?: number;
  total: number;
  totalItems?: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface StorefrontCatalogFacetOption {
  id?: string;
  value?: string;
  label?: string;
  name?: string;
  slug?: string;
  categoryId?: string;
  count?: number;
  imageUrl?: string;
  logoUrl?: string;
  logo?: StorefrontImageAsset;
  children?: StorefrontCatalogFacetOption[];
}

export interface StorefrontCatalogFacets {
  brands?: StorefrontCatalogFacetOption[];
  brand?: StorefrontCatalogFacetOption[];
  categories?: StorefrontCatalogFacetOption[];
  category?: StorefrontCatalogFacetOption[];
  [key: string]: unknown;
}

export interface StorefrontCatalog {
  products: StorefrontCatalogProduct[];
  items?: StorefrontCatalogProduct[];
  pagination: StorefrontPagination;
  facets?: StorefrontCatalogFacets;
  filters?: StorefrontCatalogFacets;
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
  images?: StorefrontImageSource[];
  imageUrl?: string;
  category?: string;
  categoryId?: StorefrontCategoryReference;
  brand?: string;
  brandId?: StorefrontBrandReference;
  price?: StorefrontPrice;
  availability?: unknown;
  stock?: number;
  inStock?: boolean;
  stockByBranch?: Array<{
    branchId?: string;
    branchName?: string;
    stock?: number;
  }>;
  freeShipping?: boolean;
  dispatchType?: string;
  ecommerceSlug?: string;
  discountedPrice?: number;
  bestDiscount?: StorefrontDiscountData;
  installments?: StorefrontInstallmentsData;
  badges?: StorefrontBadgeData[];
  specifications?: StorefrontSpecificationEntry[];
  specs?: StorefrontSpecificationEntry[];
  dynamicAttributes?: Record<string, unknown>;
  typeSpecificAttributes?: Record<string, unknown>;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  deliveryInfo?: StorefrontDeliveryInfo;
  commercialInfo?: StorefrontCommercialInfo;
  equivalents?: Array<Record<string, unknown>>;
  relatedProducts?: Array<Record<string, unknown>>;
}

// ─────────────────────────────────────────────────────────────
// Shipping quote
// ─────────────────────────────────────────────────────────────

export interface StorefrontShippingQuotePackage {
  declaredValue: number;
  volumeCm3: number;
  weightKg: number;
}

export interface StorefrontShippingQuoteRequest {
  destinationPostalCode: string;
  packages: StorefrontShippingQuotePackage[];
  subtotal?: number;
  items?: Array<{
    productId?: string;
    categoryId?: string;
    categoryIds?: string[];
    brandId?: string;
    lineTotal?: number;
  }>;
}

export type StorefrontShippingDeliveryMode = "home_delivery" | "carrier_branch" | "pickup";

export type StorefrontShippingBenefitKind = "none" | "free" | "partial";

export interface StorefrontShippingBenefit {
  kind: StorefrontShippingBenefitKind;
  amount: number;
  originalPriceWithTax: number;
  finalPriceWithTax: number;
  label: string;
  reason?: string;
}

export interface StorefrontShippingBenefitHint {
  kind: "free_shipping_min_subtotal";
  ruleId: string;
  ruleName: string;
  deliveryType: StorefrontShippingDeliveryMode;
  minSubtotal: number;
  remainingSubtotal: number;
  label: string;
}

export interface StorefrontCarrierBranch {
  branchId?: string;
  id?: string;
  code?: string;
  name: string;
  address?: string;
  street?: string;
  number?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  openingHours?: string;
  [key: string]: unknown;
}

export interface StorefrontPickupLocation {
  locationId?: string;
  branchId?: string;
  id?: string;
  name: string;
  address?: string;
  street?: string;
  number?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  openingHours?: string;
  [key: string]: unknown;
}

export interface StorefrontShippingCheckoutSnapshot {
  contractVersion: "storefront.shipping.quote.v1";
  provider: string;
  optionId: string;
  carrierName: string;
  serviceName: string;
  deliveryType?: StorefrontShippingDeliveryMode;
  providerServiceCode?: string;
  priceWithTax: number;
  priceWithoutTax: number;
  originalShippingCost?: number;
  finalShippingCost?: number;
  discountAmount?: number;
  isFreeShipping?: boolean;
  displayMessage?: string;
  benefit?: StorefrontShippingBenefit;
  benefitHint?: StorefrontShippingBenefitHint;
  selectedCarrierBranch?: StorefrontCarrierBranch;
  pickupLocation?: StorefrontPickupLocation;
  billableWeightKg?: number;
  currency: "ARS";
  destinationPostalCode: string;
  originPostalCode?: string;
  packages: StorefrontShippingQuotePackage[];
  quotedAt: string;
  expiresAt: string;
}

export interface StorefrontShippingQuoteOption {
  optionId: string;
  provider: string;
  carrierName: string;
  serviceName: string;
  deliveryType?: StorefrontShippingDeliveryMode;
  providerServiceCode?: string;
  currency: "ARS";
  priceWithTax: number;
  priceWithoutTax: number;
  originalShippingCost?: number;
  finalShippingCost?: number;
  discountAmount?: number;
  isFreeShipping?: boolean;
  displayMessage?: string;
  benefit?: StorefrontShippingBenefit;
  benefitHint?: StorefrontShippingBenefitHint;
  selectedCarrierBranch?: StorefrontCarrierBranch;
  pickupLocation?: StorefrontPickupLocation;
  billableWeightKg?: number;
  checkoutSnapshot: StorefrontShippingCheckoutSnapshot;
}

export interface StorefrontShippingQuoteResponse {
  contractVersion: "storefront.shipping.quote.v1";
  provider: string;
  available: boolean;
  currency: "ARS";
  destinationPostalCode: string;
  originPostalCode?: string;
  quotedAt: string;
  expiresAt: string;
  options: StorefrontShippingQuoteOption[];
  reason?:
    | "SHIPPING_PROVIDER_NOT_CONFIGURED"
    | "ORIGIN_POSTAL_CODE_NOT_CONFIGURED"
    | "QUOTE_UNAVAILABLE";
}

export interface StorefrontShippingBranchesRequest {
  provider?: "andreani";
  postalCode: string;
  contract?: string;
}

export interface StorefrontShippingBranchesResponse {
  provider: "andreani";
  postalCode: string;
  branches: StorefrontCarrierBranch[];
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
  items?: StorefrontPaymentMethod[];
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
  shippingAddress?: StorefrontAddressInput;
  billingAddress?: StorefrontAddressInput;
  items: StorefrontCheckoutItemInput[];
  shippingQuoteSnapshot?: StorefrontShippingCheckoutSnapshot;
  deliverySelection?: {
    deliveryType?: StorefrontShippingDeliveryMode;
    provider?: string;
    carrierName?: string;
    serviceName?: string;
    selectedCarrierBranch?: StorefrontCarrierBranch;
    selectedPickupLocation?: StorefrontPickupLocation;
  };
  paymentMethodId?: string;
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
  method?: string;
  amount?: number;
  installments?: number;
  statusDetail?: string;
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
