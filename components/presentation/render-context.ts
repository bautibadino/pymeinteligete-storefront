import type {
  StorefrontBootstrap,
  StorefrontCatalogProduct,
  StorefrontCategory,
  StorefrontPaymentMethod,
  StorefrontProductDetail,
} from "@/lib/storefront-api";
import type {
  ProductCardBadge,
  ProductCardData,
  ProductCardInstallments,
} from "@/lib/templates/product-card-catalog";
import type {
  ProductDetailData,
  ProductDetailImage,
  ProductDetailSpecification,
} from "@/lib/modules/product-detail";
import { getStorefrontInstallmentsCount } from "@/lib/commerce/installments";
import { buildCategoryCatalogHref as buildCategoryCatalogHrefInternal } from "@/lib/presentation/catalog-routing";
import type { ProductGridSource } from "@/lib/modules/product-grid";
import type { CategoryTileItem } from "@/lib/modules/category-tile";
import type { TrustBarContent } from "@/lib/modules/trust-bar";

export type PresentationRenderContext = {
  bootstrap?: StorefrontBootstrap | null;
  host?: string;
  product?: StorefrontProductDetail | null;
  products?: StorefrontCatalogProduct[];
  categories?: StorefrontCategory[];
  paymentMethods?: StorefrontPaymentMethod[];
};

type ProductRecord = Record<string, unknown>;
type ProductPaymentContext = Pick<StorefrontBootstrap, "commerce"> | null | undefined;

const DISPATCH_LABELS: Record<string, string> = {
  IMMEDIATE: "Despacho inmediato",
  DELAYED_72H: "Despacho 72 hs",
};

function formatMoney(amount: number | undefined, currency = "ARS"): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "Precio a confirmar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeComparableText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

function readArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function readStringFromRecord(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = readString(record[key]);
    if (value) return value;
  }

  return undefined;
}

function readNumberFromRecord(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = readNumber(record[key]);
    if (value !== undefined) return value;
  }

  return undefined;
}

function readNestedString(record: Record<string, unknown>, key: string, nestedKeys: string[]): string | undefined {
  const value = record[key];

  if (typeof value === "string") {
    return readString(value);
  }

  if (isRecord(value)) {
    return readStringFromRecord(value, nestedKeys);
  }

  return undefined;
}

function readNestedRecord(record: Record<string, unknown>, keys: string[]): Record<string, unknown> | undefined {
  for (const key of keys) {
    const value = readRecord(record[key]);
    if (value) return value;
  }

  return undefined;
}

function normalizeBadgeTone(value: string | undefined): ProductCardBadge["tone"] {
  switch (value?.toLowerCase()) {
    case "success":
    case "positive":
    case "green":
      return "success";
    case "warning":
    case "alert":
    case "yellow":
      return "warning";
    case "accent":
    case "primary":
    case "promo":
      return "accent";
    default:
      return "info";
  }
}

function normalizeSpecificationValue(value: unknown): string | undefined {
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    return readString(value);
  }

  if (Array.isArray(value)) {
    const values = value
      .map((entry) => normalizeSpecificationValue(entry))
      .filter((entry): entry is string => Boolean(entry));

    return values.length > 0 ? values.join(", ") : undefined;
  }

  if (isRecord(value)) {
    return readStringFromRecord(value, ["value", "label", "name", "title", "text"]);
  }

  return undefined;
}

function pushUniqueBadge(
  badges: ProductCardBadge[],
  seen: Set<string>,
  badge: ProductCardBadge | undefined,
): void {
  if (!badge?.label) {
    return;
  }

  const key = badge.label.toLowerCase();
  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  badges.push(badge);
}

function pushUniqueSpecification(
  specifications: ProductDetailSpecification[],
  seen: Set<string>,
  label: string | undefined,
  value: string | undefined,
): void {
  const normalizedLabel = readString(label);
  const normalizedValue = readString(value);

  if (!normalizedLabel || !normalizedValue) {
    return;
  }

  const key = normalizedLabel.toLowerCase();
  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  specifications.push({ label: normalizedLabel, value: normalizedValue });
}

const PRIVATE_SPECIFICATION_LABELS = new Set([
  "peso",
  "peso neto",
  "peso bruto",
  "dimensiones",
  "dimension",
  "medidas",
  "medidas del paquete",
  "dimensiones del paquete",
  "tamano del paquete",
  "tamano",
]);

const PRIVATE_SPECIFICATION_FIELDS = new Set([
  "weight",
  "packageweight",
  "shippingweight",
  "peso",
  "pesoneto",
  "pesobruto",
  "dimensions",
  "dimension",
  "packagedimensions",
  "shippingdimensions",
  "dimensiones",
  "medidas",
  "tamano",
  "size",
]);

function shouldHideSpecification(label: string | undefined, fieldName?: string | undefined): boolean {
  const normalizedLabel = label ? normalizeComparableText(label) : "";
  const normalizedFieldName = fieldName ? normalizeComparableText(fieldName).replace(/[\s_-]+/g, "") : "";

  return (
    (normalizedLabel.length > 0 && PRIVATE_SPECIFICATION_LABELS.has(normalizedLabel)) ||
    (normalizedFieldName.length > 0 && PRIVATE_SPECIFICATION_FIELDS.has(normalizedFieldName))
  );
}

function readProductSlug(product: ProductRecord): string | undefined {
  return readStringFromRecord(product, ["ecommerceSlug", "slug", "handle", "urlSlug"]);
}

function readProductId(product: ProductRecord): string | undefined {
  return readStringFromRecord(product, ["productId", "_id", "id", "sku"]);
}

function readProductName(product: ProductRecord): string | undefined {
  return readStringFromRecord(product, ["name", "title"]);
}

function readProductBrand(product: ProductRecord): string | undefined {
  return (
    readNestedString(product, "brand", ["name", "label", "slug"]) ??
    readNestedString(product, "brandId", ["name", "label", "slug"])
  );
}

function readProductCategory(product: ProductRecord): string | undefined {
  return (
    readNestedString(product, "category", ["name", "label", "slug"]) ??
    readNestedString(product, "categoryId", ["name", "label", "slug"])
  );
}

function readProductCategoryMatchValue(product: ProductRecord): string | undefined {
  const category = readRecord(product.category) ?? readRecord(product.categoryId);

  if (category) {
    return readStringFromRecord(category, ["slug", "categoryId", "id"]) ?? readStringFromRecord(category, ["name", "label"]);
  }

  return readString(product.category);
}

function readProductImageItems(product: ProductRecord, fallbackAlt?: string): ProductDetailImage[] {
  const images: ProductDetailImage[] = [];
  const seen = new Set<string>();
  const directImage = readString(product.imageUrl);

  const pushImage = (url: string | undefined, alt?: string) => {
    if (!url) return;
    if (seen.has(url)) return;
    seen.add(url);
    const normalizedAlt = readString(alt) ?? fallbackAlt;

    images.push({
      url,
      ...(normalizedAlt ? { alt: normalizedAlt } : {}),
    });
  };

  pushImage(directImage, fallbackAlt);

  for (const image of readArray(product.images) ?? []) {
    if (typeof image === "string") {
      pushImage(readString(image), fallbackAlt);
      continue;
    }

    if (isRecord(image)) {
      pushImage(
        readStringFromRecord(image, ["url", "src", "imageUrl"]),
        readString(image.alt) ?? fallbackAlt,
      );
    }
  }

  return images;
}

function readProductPrimaryImageUrl(product: ProductRecord): string | undefined {
  return readProductImageItems(product)[0]?.url;
}

function readProductCollectionValues(product: ProductRecord): string[] {
  const values: string[] = [];
  const directCollectionId = readString(product.collectionId);
  const directCollectionSlug = readString(product.collectionSlug);
  const collection = product.collection;

  if (directCollectionId) values.push(directCollectionId);
  if (directCollectionSlug) values.push(directCollectionSlug);

  if (typeof collection === "string") {
    const collectionValue = readString(collection);
    if (collectionValue) values.push(collectionValue);
  }

  if (isRecord(collection)) {
    const collectionValue = readStringFromRecord(collection, ["collectionId", "id", "slug"]);
    if (collectionValue) values.push(collectionValue);
  }

  for (const key of ["collectionIds", "collectionSlugs", "collections"]) {
    const rawValues = readArray(product[key]);
    if (!rawValues) continue;

    for (const rawValue of rawValues) {
      if (typeof rawValue === "string") {
        const value = readString(rawValue);
        if (value) values.push(value);
        continue;
      }

      if (isRecord(rawValue)) {
        const value = readStringFromRecord(rawValue, ["collectionId", "id", "slug"]);
        if (value) values.push(value);
      }
    }
  }

  return values;
}

function readProductCreatedAt(product: ProductRecord): number | undefined {
  const date = readStringFromRecord(product, ["createdAt", "created_at", "creationDate", "publishedAt"]);
  if (!date) return undefined;

  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function hasExplicitFeaturedFlag(product: ProductRecord): boolean {
  return (
    readBoolean(product.isFeatured) === true ||
    readBoolean(product.featured) === true ||
    readBoolean(product.is_featured) === true ||
    readBoolean(product.featuredInStorefront) === true
  );
}

function readCommercialInfo(product: ProductRecord): ProductRecord | undefined {
  return readRecord(product.commercialInfo);
}

function readDeliveryInfo(product: ProductRecord): ProductRecord | undefined {
  return readRecord(product.deliveryInfo);
}

function readPriceAmount(product: ProductRecord): number | undefined {
  const commercialInfo = readCommercialInfo(product);
  const enrichedPrice =
    readNumber(product.priceWithTax) ??
    readNumber(product.finalPrice) ??
    (commercialInfo ? readNumberFromRecord(commercialInfo, ["priceWithTax", "finalPrice", "amount", "value"]) : undefined);

  if (enrichedPrice !== undefined) return enrichedPrice;

  if (isRecord(product.price)) {
    return readNumberFromRecord(product.price, ["amount", "value"]);
  }

  return readNumber(product.price);
}

function readDiscountedPriceAmount(product: ProductRecord): number | undefined {
  const commercialInfo = readCommercialInfo(product);
  return (
    readNumber(product.discountedPrice) ??
    (commercialInfo ? readNumberFromRecord(commercialInfo, ["discountedPrice", "cashPrice"]) : undefined) ??
    (isRecord(product.price)
      ? readNumberFromRecord(product.price, ["discountedAmount", "discountedPrice"])
      : undefined)
  );
}

function readCompareAtPrice(product: ProductRecord): number | undefined {
  const commercialInfo = readCommercialInfo(product);

  if (isRecord(product.price)) {
    const compareAt = readNumberFromRecord(product.price, ["compareAt", "compareAtPrice", "originalAmount"]);
    if (compareAt !== undefined) return compareAt;
  }

  return (
    readNumber(product.compareAtPrice) ??
    readNumber(product.originalPrice) ??
    (commercialInfo ? readNumberFromRecord(commercialInfo, ["compareAt", "compareAtPrice", "originalPrice"]) : undefined)
  );
}

function readCurrency(product: ProductRecord): string {
  const commercialInfo = readCommercialInfo(product);

  if (isRecord(product.price)) {
    return readString(product.price.currency) ?? "ARS";
  }

  return readString(product.currency) ?? readString(commercialInfo?.currency) ?? "ARS";
}

function readInstallmentsRecord(product: ProductRecord): ProductRecord | undefined {
  const commercialInfo = readCommercialInfo(product);

  return (
    readRecord(product.installments) ??
    readRecord(commercialInfo?.installments) ??
    readRecord(product.paymentPlan)
  );
}

function readInstallments(
  product: ProductRecord,
  amount: number | undefined,
  currency: string,
): ProductCardInstallments | undefined {
  const installments = readInstallmentsRecord(product);
  if (!installments) {
    return undefined;
  }

  const enabled = readBoolean(installments.enabled);
  if (enabled === false) return undefined;

  const count = readNumberFromRecord(installments, ["count", "installments", "quantity"]);
  if (!count || count < 1) return undefined;

  const baseAmount = amount && amount > 0 ? amount : undefined;
  const installmentAmount =
    readNumberFromRecord(installments, ["amount", "value", "installmentAmount", "monthlyAmount"]) ??
    (baseAmount ? Math.round((baseAmount / count) * 100) / 100 : undefined);

  if (!installmentAmount) return undefined;

  const formatted = readString(installments.formatted) ?? formatMoney(installmentAmount, currency);
  const interestFree =
    readBoolean(installments.interestFree) ??
    readBoolean(installments.withoutInterest) ??
    readBoolean(installments.noInterest) ??
    readString(installments.label)?.toLowerCase().includes("sin interés") ??
    false;

  return {
    count,
    amount: installmentAmount,
    formatted,
    interestFree,
  };
}

function readBootstrapInstallments(
  bootstrap: ProductPaymentContext,
  amount: number | undefined,
  currency: string,
): ProductCardInstallments | undefined {
  const count = getStorefrontInstallmentsCount(bootstrap);

  if (!count || count < 2 || typeof amount !== "number" || amount <= 0) {
    return undefined;
  }

  const installmentAmount = Math.round((amount / count) * 100) / 100;

  return {
    count,
    amount: installmentAmount,
    formatted: formatMoney(installmentAmount, currency),
    interestFree: true,
  };
}

function readCashDiscountRecord(product: ProductRecord): ProductRecord | undefined {
  const commercialInfo = readCommercialInfo(product);

  return (
    readRecord(product.bestDiscount) ??
    readRecord(product.cashDiscount) ??
    readRecord(commercialInfo?.bestDiscount) ??
    readRecord(commercialInfo?.cashDiscount)
  );
}

function readCashDiscount(
  product: ProductRecord,
  amount: number | undefined,
  currency: string,
): ProductCardData["cashDiscount"] {
  const discount = readCashDiscountRecord(product);
  if (!discount) {
    return undefined;
  }

  const percentage = readNumberFromRecord(discount, ["percentage", "percent", "value"]);
  if (!percentage || percentage <= 0) return undefined;

  const label = readString(discount.formatted) ?? readString(discount.label) ?? `${percentage}% OFF contado`;

  return {
    percent: percentage,
    formatted: label.includes("%") ? label : `${label} ${formatMoney(amount, currency)}`,
  };
}

function hasFreeShipping(
  product: ProductRecord,
  bootstrap: ProductPaymentContext,
  amount: number | undefined,
): boolean {
  if (readBoolean(product.freeShipping) === true) {
    return true;
  }

  if (readBoolean(readDeliveryInfo(product)?.freeShipping) === true) {
    return true;
  }

  const threshold = readNumber(bootstrap?.commerce?.shipping?.freeShippingThreshold);
  return typeof threshold === "number" && threshold > 0 && typeof amount === "number" && amount >= threshold;
}

function readDispatchType(product: ProductRecord): string | undefined {
  return (
    readString(product.dispatchType) ??
    readString(readDeliveryInfo(product)?.dispatchType) ??
    readString(readDeliveryInfo(product)?.type) ??
    readString(readDeliveryInfo(product)?.serviceLevel)
  );
}

function readDispatchLabel(product: ProductRecord): string | undefined {
  const deliveryInfo = readDeliveryInfo(product);
  const dispatchType = readDispatchType(product);

  return (
    readString(deliveryInfo?.dispatchLabel) ??
    readString(deliveryInfo?.label) ??
    (dispatchType ? DISPATCH_LABELS[dispatchType] : undefined)
  );
}

function resolveProductStock(product: ProductRecord): ProductCardData["stock"] {
  const availability = product.availability;

  if (isRecord(availability)) {
    const explicitAvailable = readBoolean(availability.available) ?? readBoolean(availability.inStock);
    const label =
      readString(availability.label) ??
      readString(availability.statusLabel) ??
      readString(availability.status) ??
      readString(availability.message);

    return {
      available: explicitAvailable ?? true,
      ...(label ? { label } : {}),
    };
  }

  if (typeof availability === "string" && availability.trim()) {
    const normalized = availability.toLowerCase();
    return {
      available: !normalized.includes("sin stock") && !normalized.includes("no disponible"),
      label: availability,
    };
  }

  const stockAmount = readNumber(product.stock);
  if (stockAmount !== undefined) {
    return {
      available: stockAmount > 0,
      label: stockAmount > 0 ? "Stock disponible" : "Sin stock",
    };
  }

  const inStock = readBoolean(product.inStock);
  if (inStock !== undefined) {
    return {
      available: inStock,
      label: inStock ? "Stock disponible" : "Sin stock",
    };
  }

  return undefined;
}

function readExplicitBadges(product: ProductRecord): ProductCardBadge[] {
  const badges: ProductCardBadge[] = [];
  const seen = new Set<string>();

  for (const source of [
    readArray(product.badges),
    readArray(readCommercialInfo(product)?.badges),
    readArray(readDeliveryInfo(product)?.badges),
  ]) {
    if (!source) continue;

    for (const badge of source) {
      if (!isRecord(badge)) continue;
      const label = readStringFromRecord(badge, ["label", "text", "title", "name"]);
      if (!label) continue;
      const tone = normalizeBadgeTone(readStringFromRecord(badge, ["tone", "variant", "type"]));

      pushUniqueBadge(badges, seen, {
        label,
        ...(tone ? { tone } : {}),
      });
    }
  }

  return badges;
}

function readBadges(
  product: ProductRecord,
  bootstrap: ProductPaymentContext,
  amount: number | undefined,
): ProductCardBadge[] | undefined {
  const badges = readExplicitBadges(product);
  const seen = new Set(badges.map((badge) => badge.label.toLowerCase()));

  if (readBoolean(product.isFeatured)) pushUniqueBadge(badges, seen, { label: "Top", tone: "accent" });
  if (readBoolean(product.isNewProduct)) pushUniqueBadge(badges, seen, { label: "Nuevo", tone: "info" });
  if (readBoolean(product.isOnSale)) pushUniqueBadge(badges, seen, { label: "Oferta", tone: "warning" });
  if (readBoolean(product.isOutlet)) pushUniqueBadge(badges, seen, { label: "Outlet", tone: "warning" });
  if (hasFreeShipping(product, bootstrap, amount)) {
    pushUniqueBadge(badges, seen, { label: "Envío gratis", tone: "success" });
  }

  const dispatchLabel = readDispatchLabel(product);
  if (dispatchLabel) {
    pushUniqueBadge(badges, seen, {
      label: dispatchLabel,
      tone: readDispatchType(product) === "DELAYED_72H" ? "warning" : "success",
    });
  }

  return badges.length > 0 ? badges : undefined;
}

function readAttributeDefinitions(product: ProductRecord): Array<Record<string, unknown>> {
  const category = readRecord(product.categoryId);
  const definitions = readArray(category?.attributeDefinitions);
  return definitions?.filter((definition): definition is Record<string, unknown> => isRecord(definition)) ?? [];
}

function readSpecifications(product: ProductRecord): ProductDetailSpecification[] | undefined {
  const specifications: ProductDetailSpecification[] = [];
  const seen = new Set<string>();

  for (const key of ["specifications", "specs"]) {
    const source = readArray(product[key]);
    if (!source) continue;

    for (const entry of source) {
      if (!isRecord(entry)) continue;
      const label = readStringFromRecord(entry, ["label", "name", "key", "title"]);
      const fieldName = readStringFromRecord(entry, ["fieldName", "key", "name", "code"]);

      if (shouldHideSpecification(label, fieldName)) {
        continue;
      }

      pushUniqueSpecification(
        specifications,
        seen,
        label,
        normalizeSpecificationValue(entry.value ?? entry.values ?? entry.text),
      );
    }
  }

  const definitions = readAttributeDefinitions(product);
  const definitionLabels = new Map(
    definitions.map((definition) => [
      readString(definition.fieldName) ?? "",
      readString(definition.displayLabel) ?? readString(definition.label) ?? readString(definition.fieldName) ?? "",
    ]),
  );

  for (const key of ["dynamicAttributes", "typeSpecificAttributes"]) {
    const source = readRecord(product[key]);
    if (!source) continue;

    for (const [fieldName, rawValue] of Object.entries(source)) {
      const label = definitionLabels.get(fieldName) ?? fieldName;

      if (shouldHideSpecification(label, fieldName)) {
        continue;
      }

      pushUniqueSpecification(
        specifications,
        seen,
        label,
        normalizeSpecificationValue(rawValue),
      );
    }
  }

  return specifications.length > 0 ? specifications : undefined;
}

function normalizeRelatedProductCandidate(candidate: unknown): StorefrontCatalogProduct | null {
  if (!isRecord(candidate)) {
    return null;
  }

  const slug = readProductSlug(candidate);
  const id = readProductId(candidate) ?? slug;
  const name = readProductName(candidate);

  if (!id || !slug || !name) {
    return null;
  }

  const amount = readPriceAmount(candidate);
  const currency = readCurrency(candidate);
  const compareAt = readCompareAtPrice(candidate);
  const brand = readProductBrand(candidate);
  const category = readProductCategory(candidate);
  const imageUrl =
    readProductPrimaryImageUrl(candidate) ??
    readString(candidate.image);
  const sku = readString(candidate.sku);
  const discountedPrice = readNumber(candidate.discountedPrice);
  const bestDiscount = readRecord(candidate.bestDiscount);
  const installments = readRecord(candidate.installments);
  const freeShipping = readBoolean(candidate.freeShipping);
  const dispatchType = readDispatchType(candidate);

  return {
    productId: id,
    slug,
    name,
    ...(sku ? { sku } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(brand ? { brand } : {}),
    ...(category ? { category } : {}),
    ...(amount !== undefined ? { price: { amount, currency, ...(compareAt !== undefined ? { compareAt } : {}) } } : {}),
    ...(discountedPrice !== undefined ? { discountedPrice } : {}),
    ...(bestDiscount ? { bestDiscount: bestDiscount as NonNullable<StorefrontCatalogProduct["bestDiscount"]> } : {}),
    ...(installments ? { installments: installments as NonNullable<StorefrontCatalogProduct["installments"]> } : {}),
    ...(freeShipping !== undefined ? { freeShipping } : {}),
    ...(dispatchType ? { dispatchType } : {}),
  };
}

export function extractRelatedCatalogProductsFromDetail(
  product: StorefrontProductDetail | null | undefined,
): StorefrontCatalogProduct[] {
  if (!product) {
    return [];
  }

  const record = product as unknown as ProductRecord;
  const relatedCandidates = [
    ...(readArray(record.relatedProducts) ?? []),
    ...(readArray(record.equivalents) ?? []),
  ];

  const seen = new Set<string>();
  const relatedProducts: StorefrontCatalogProduct[] = [];

  for (const candidate of relatedCandidates) {
    const normalized = normalizeRelatedProductCandidate(candidate);
    if (!normalized) continue;

    const key = `${normalized.productId}:${normalized.slug}`;
    if (seen.has(key)) continue;

    seen.add(key);
    relatedProducts.push(normalized);
  }

  return relatedProducts;
}

export function mapCatalogProductToCardData(
  product: StorefrontCatalogProduct,
  bootstrap?: ProductPaymentContext,
): ProductCardData | null {
  const record = product as unknown as ProductRecord;
  const slug = readProductSlug(record);
  const id = readProductId(record) ?? slug;
  const name = readProductName(record);

  if (!id || !slug || !name) {
    return null;
  }

  const listAmount = readPriceAmount(record);
  const discountedAmount = readDiscountedPriceAmount(record);
  const effectiveAmount = discountedAmount ?? listAmount;
  const currency = readCurrency(record);
  const compareAt = discountedAmount !== undefined ? listAmount : readCompareAtPrice(record);
  const stock = resolveProductStock(record);
  const imageUrl = readProductPrimaryImageUrl(record);
  const brand = readProductBrand(record);
  const category = readProductCategory(record);
  const installments =
    readInstallments(record, compareAt ?? effectiveAmount, currency) ??
    readBootstrapInstallments(bootstrap, compareAt ?? effectiveAmount, currency);
  const cashDiscount = readCashDiscount(record, effectiveAmount, currency);
  const badges = readBadges(record, bootstrap, effectiveAmount);

  return {
    id,
    name,
    slug,
    ...(brand ? { brand } : category ? { brand: category } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(typeof listAmount === "number"
      ? {
          basePrice: {
            amount: listAmount,
            currency,
            formatted: formatMoney(listAmount, currency),
          },
        }
      : {}),
    price: {
      amount: effectiveAmount ?? 0,
      currency,
      formatted: formatMoney(effectiveAmount, currency),
    },
    ...(typeof compareAt === "number"
      ? { compareAtPrice: { amount: compareAt, formatted: formatMoney(compareAt, currency) } }
      : {}),
    ...(installments ? { installments } : {}),
    ...(cashDiscount ? { cashDiscount } : {}),
    ...(badges ? { badges } : {}),
    ...(stock ? { stock } : {}),
    href: `/producto/${encodeURIComponent(slug)}`,
  };
}

export function mapProductDetailToData(
  product: StorefrontProductDetail | null | undefined,
  bootstrap?: ProductPaymentContext,
): ProductDetailData | undefined {
  if (!product) {
    return undefined;
  }

  const record = product as unknown as ProductRecord;
  const slug = readProductSlug(record) ?? product.slug;
  const id = readProductId(record) ?? slug;
  const name = readProductName(record) ?? product.name;

  if (!id || !slug || !name) {
    return undefined;
  }

  const listAmount = readPriceAmount(record);
  const discountedAmount = readDiscountedPriceAmount(record);
  const effectiveAmount = discountedAmount ?? listAmount;
  const currency = readCurrency(record);
  const compareAt = discountedAmount !== undefined ? listAmount : readCompareAtPrice(record);
  const stock = resolveProductStock(record);
  const installments =
    readInstallments(record, compareAt ?? effectiveAmount, currency) ??
    readBootstrapInstallments(bootstrap, compareAt ?? effectiveAmount, currency);
  const cashDiscount = readCashDiscount(record, effectiveAmount, currency);
  const badges = readBadges(record, bootstrap, effectiveAmount);
  const specifications = readSpecifications(record);
  const brand = readProductBrand(record);
  const description = readString(product.description);
  const dispatchType = readDispatchType(record);
  const dispatchLabel = readDispatchLabel(record);
  const freeShipping = hasFreeShipping(record, bootstrap, effectiveAmount);

  return {
    id,
    name,
    slug,
    ...(brand ? { brand } : {}),
    ...(description ? { description } : {}),
    images: readProductImageItems(record, name),
    ...(typeof listAmount === "number"
      ? {
          basePrice: {
            amount: listAmount,
            currency,
            formatted: formatMoney(listAmount, currency),
          },
        }
      : {}),
    price: {
      amount: effectiveAmount ?? 0,
      currency,
      formatted: formatMoney(effectiveAmount, currency),
    },
    ...(typeof compareAt === "number"
      ? { compareAtPrice: { amount: compareAt, formatted: formatMoney(compareAt, currency) } }
      : {}),
    ...(installments ? { installments } : {}),
    ...(cashDiscount ? { cashDiscount } : {}),
    ...(stock ? { stock } : {}),
    ...(freeShipping ? { freeShipping: true } : {}),
    ...(dispatchType && dispatchLabel ? { dispatch: { type: dispatchType, label: dispatchLabel } } : {}),
    ...(badges ? { badges } : {}),
    ...(specifications ? { specifications } : {}),
    href: `/producto/${encodeURIComponent(slug)}`,
  };
}

function matchesCategory(product: StorefrontCatalogProduct, categorySlug: string): boolean {
  const record = product as unknown as ProductRecord;
  const category = readProductCategoryMatchValue(record)?.toLowerCase();
  const slug = categorySlug.toLowerCase();

  return category === slug || category?.replaceAll(" ", "-") === slug;
}

function matchesCollection(product: StorefrontCatalogProduct, collectionId: string): boolean {
  const record = product as unknown as ProductRecord;
  const normalizedCollectionId = collectionId.toLowerCase();

  return readProductCollectionValues(record).some((value) => value.toLowerCase() === normalizedCollectionId);
}

function matchesStableProductId(product: StorefrontCatalogProduct, ids: Set<string>): boolean {
  const record = product as unknown as ProductRecord;
  const stableId = readProductId(record);
  const stableSlug = readProductSlug(record);

  return Boolean((stableId && ids.has(stableId)) || (stableSlug && ids.has(stableSlug)));
}

export function selectProductsForGrid(
  products: StorefrontCatalogProduct[] | undefined,
  source: ProductGridSource,
  limit = 12,
  bootstrap?: ProductPaymentContext,
): ProductCardData[] {
  const sourceProducts = products ?? [];
  let selected = sourceProducts;

  if (source.type === "category") {
    selected = sourceProducts.filter((product) => matchesCategory(product, source.categorySlug));
  }

  if (source.type === "handpicked") {
    const ids = new Set(source.productIds);
    selected = sourceProducts.filter((product) => matchesStableProductId(product, ids));
  }

  if (source.type === "collection") {
    selected = sourceProducts.filter((product) => matchesCollection(product, source.collectionId));
  }

  if (source.type === "featured") {
    selected = sourceProducts.filter((product) => hasExplicitFeaturedFlag(product as unknown as ProductRecord));
  }

  if (source.type === "newest") {
    selected = sourceProducts
      .map((product) => ({ product, createdAt: readProductCreatedAt(product as unknown as ProductRecord) }))
      .filter((entry): entry is { product: StorefrontCatalogProduct; createdAt: number } => entry.createdAt !== undefined)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((entry) => entry.product);
  }

  return selected
    .slice(0, limit)
    .map((product) => mapCatalogProductToCardData(product, bootstrap))
    .filter((product): product is ProductCardData => product !== null);
}

export function mapCatalogProductsToCardData(
  products: StorefrontCatalogProduct[] | undefined,
  limit = 12,
  bootstrap?: ProductPaymentContext,
): ProductCardData[] {
  return (products ?? [])
    .map((product) => mapCatalogProductToCardData(product, bootstrap))
    .filter((product): product is ProductCardData => product !== null)
    .slice(0, limit);
}

function matchesBrand(product: StorefrontCatalogProduct, brand: string): boolean {
  const productBrand = readProductBrand(product as unknown as ProductRecord)?.toLowerCase();
  return Boolean(productBrand && productBrand === brand.toLowerCase());
}

export function selectRelatedProductsForDetail(
  product: StorefrontProductDetail | null | undefined,
  products: StorefrontCatalogProduct[] | undefined,
  relatedSource: "category" | "brand" | "collection" | undefined,
  limit = 4,
  bootstrap?: ProductPaymentContext,
): ProductCardData[] {
  if (!product || !products || products.length === 0 || !relatedSource) {
    return [];
  }

  const record = product as unknown as ProductRecord;
  const currentSlug = readProductSlug(record) ?? product.slug;
  const currentId = readProductId(record) ?? product.productId;
  const sourceProducts = products.filter((candidate) => {
    const candidateRecord = candidate as unknown as ProductRecord;
    return (
      readProductSlug(candidateRecord) !== currentSlug &&
      readProductId(candidateRecord) !== currentId
    );
  });

  let selected = sourceProducts;

  if (relatedSource === "category") {
    const categoryValue = readProductCategoryMatchValue(record);
    if (categoryValue) {
      selected = sourceProducts.filter((candidate) => matchesCategory(candidate, categoryValue));
    }
  }

  if (relatedSource === "brand") {
    const brand = readProductBrand(record);
    if (brand) {
      selected = sourceProducts.filter((candidate) => matchesBrand(candidate, brand));
    }
  }

  if (relatedSource === "collection") {
    selected = [];
  }

  if (selected.length === 0) {
    selected = sourceProducts;
  }

  return selected
    .slice(0, limit)
    .map((candidate) => mapCatalogProductToCardData(candidate, bootstrap))
    .filter((candidate): candidate is ProductCardData => candidate !== null);
}

export function mapCategoriesToTiles(categories: StorefrontCategory[] | undefined): CategoryTileItem[] {
  return (categories ?? []).map((category) => ({
    label: category.name,
    href: buildCategoryCatalogHrefInternal(category),
    ...(category.imageUrl ? { imageUrl: category.imageUrl } : {}),
  }));
}

export function buildCategoryCatalogHref(category: StorefrontCategory): string {
  return buildCategoryCatalogHrefInternal(category);
}

export function mapPaymentMethodsToTrustItems(
  paymentMethods: StorefrontPaymentMethod[] | undefined,
): TrustBarContent["items"] {
  const methods = paymentMethods ?? [];

  if (methods.length === 0) {
    return [];
  }

  const discount = methods.find((method) => method.discount)?.discount;
  const paymentCopy = discount
    ? discount.type === "percentage"
      ? `${discount.value}% de beneficio según método disponible.`
      : `Beneficio de ${formatMoney(discount.value)} según método disponible.`
    : `${methods.length} medio${methods.length === 1 ? "" : "s"} de pago disponible${methods.length === 1 ? "" : "s"}.`;

  return [
    {
      icon: "credit-card",
      title: "Medios de pago",
      subtitle: paymentCopy,
    },
  ];
}

export function resolveStoreName(context?: PresentationRenderContext): string {
  return (
    context?.bootstrap?.branding?.storeName ??
    context?.bootstrap?.tenant?.tenantSlug ??
    context?.host ??
    "Tienda"
  );
}
