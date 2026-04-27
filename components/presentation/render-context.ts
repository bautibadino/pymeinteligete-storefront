import type {
  StorefrontBootstrap,
  StorefrontCatalogProduct,
  StorefrontCategory,
  StorefrontPaymentMethod,
} from "@/lib/storefront-api";
import type {
  ProductCardBadge,
  ProductCardData,
  ProductCardInstallments,
} from "@/lib/templates/product-card-catalog";
import type { ProductGridSource } from "@/lib/modules/product-grid";
import type { CategoryTileItem } from "@/lib/modules/category-tile";
import type { TrustBarContent } from "@/lib/modules/trust-bar";

export type PresentationRenderContext = {
  bootstrap?: StorefrontBootstrap | null;
  host?: string;
  products?: StorefrontCatalogProduct[];
  categories?: StorefrontCategory[];
  paymentMethods?: StorefrontPaymentMethod[];
};

type ProductRecord = StorefrontCatalogProduct & Record<string, unknown>;

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

function readStringFromRecord(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = readString(record[key]);
    if (value) return value;
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

function readProductImages(product: ProductRecord): string | undefined {
  const directImage = readString(product.imageUrl);
  if (directImage) return directImage;

  if (Array.isArray(product.images)) {
    for (const image of product.images) {
      if (typeof image === "string" && image.trim()) return image.trim();
      if (isRecord(image)) {
        const url = readStringFromRecord(image, ["url", "src", "imageUrl"]);
        if (url) return url;
      }
    }
  }

  return undefined;
}

function readProductSlug(product: ProductRecord): string | undefined {
  return readStringFromRecord(product, ["slug", "ecommerceSlug", "handle", "urlSlug"]);
}

function readProductId(product: ProductRecord): string | undefined {
  return readStringFromRecord(product, ["productId", "_id", "id", "sku"]);
}

function readProductName(product: ProductRecord): string | undefined {
  return readStringFromRecord(product, ["name", "title"]);
}

function readProductBrand(product: ProductRecord): string | undefined {
  return readNestedString(product, "brand", ["name", "label", "slug"]);
}

function readProductCategory(product: ProductRecord): string | undefined {
  return readNestedString(product, "category", ["name", "label", "slug"]);
}

function readProductCategoryMatchValue(product: ProductRecord): string | undefined {
  const category = product.category;

  if (isRecord(category)) {
    return readStringFromRecord(category, ["slug", "categoryId", "id"]) ?? readStringFromRecord(category, ["name", "label"]);
  }

  return readString(category);
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
    const rawValues = product[key];
    if (!Array.isArray(rawValues)) continue;

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

function readPriceAmount(product: ProductRecord): number | undefined {
  if (isRecord(product.price)) {
    return readNumber(product.price.amount) ?? readNumber(product.price.value);
  }

  return (
    readNumber(product.priceWithTax) ??
    readNumber(product.discountedPrice) ??
    readNumber(product.finalPrice) ??
    readNumber(product.price)
  );
}

function readCompareAtPrice(product: ProductRecord): number | undefined {
  if (isRecord(product.price)) {
    return readNumber(product.price.compareAt) ?? readNumber(product.price.compareAtPrice);
  }

  return readNumber(product.compareAtPrice) ?? readNumber(product.originalPrice);
}

function readCurrency(product: ProductRecord): string {
  if (isRecord(product.price)) {
    return readString(product.price.currency) ?? "ARS";
  }

  return readString(product.currency) ?? "ARS";
}

function readInstallments(product: ProductRecord, amount: number | undefined, currency: string): ProductCardInstallments | undefined {
  if (!isRecord(product.installments)) {
    return undefined;
  }

  const enabled = readBoolean(product.installments.enabled);
  if (enabled === false) return undefined;

  const count = readNumber(product.installments.count);
  if (!count || count < 1) return undefined;

  const installmentAmount = readNumber(product.installments.amount) ?? (amount ? amount / count : undefined);
  if (!installmentAmount) return undefined;

  return {
    count,
    amount: installmentAmount,
    formatted: formatMoney(installmentAmount, currency),
    interestFree: readBoolean(product.installments.interestFree) ?? false,
  };
}

function readCashDiscount(product: ProductRecord, amount: number | undefined, currency: string): ProductCardData["cashDiscount"] {
  if (!isRecord(product.bestDiscount)) {
    return undefined;
  }

  const percentage = readNumber(product.bestDiscount.percentage) ?? readNumber(product.bestDiscount.value);
  if (!percentage || percentage <= 0) return undefined;

  const label = readString(product.bestDiscount.label) ?? `${percentage}% OFF`;

  return {
    percent: percentage,
    formatted: label.includes("%") ? label : `${label} ${formatMoney(amount, currency)}`,
  };
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

  return undefined;
}

function readBadges(product: ProductRecord): ProductCardBadge[] | undefined {
  const badges: ProductCardBadge[] = [];

  if (readBoolean(product.isFeatured)) badges.push({ label: "Top", tone: "accent" });
  if (readBoolean(product.isNewProduct)) badges.push({ label: "Nuevo", tone: "info" });
  if (readBoolean(product.isOnSale)) badges.push({ label: "Oferta", tone: "warning" });

  const dispatchType = readString(product.dispatchType);
  if (dispatchType === "IMMEDIATE") {
    badges.push({ label: "Despacho inmediato", tone: "success" });
  }

  return badges.length > 0 ? badges : undefined;
}

export function mapCatalogProductToCardData(product: StorefrontCatalogProduct): ProductCardData | null {
  const record = product as ProductRecord;
  const slug = readProductSlug(record);
  const id = readProductId(record) ?? slug;
  const name = readProductName(record);

  if (!id || !slug || !name) {
    return null;
  }

  const amount = readPriceAmount(record);
  const currency = readCurrency(record);
  const compareAt = readCompareAtPrice(record);
  const stock = resolveProductStock(record);
  const imageUrl = readProductImages(record);
  const brand = readProductBrand(record);
  const category = readProductCategory(record);
  const installments = readInstallments(record, amount, currency);
  const cashDiscount = readCashDiscount(record, amount, currency);
  const badges = readBadges(record);

  return {
    id,
    name,
    slug,
    ...(brand ? { brand } : category ? { brand: category } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    price: {
      amount: amount ?? 0,
      currency,
      formatted: formatMoney(amount, currency),
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

function matchesCategory(product: StorefrontCatalogProduct, categorySlug: string): boolean {
  const record = product as ProductRecord;
  const category = readProductCategoryMatchValue(record)?.toLowerCase();
  const slug = categorySlug.toLowerCase();

  return category === slug || category?.replaceAll(" ", "-") === slug;
}

function matchesCollection(product: StorefrontCatalogProduct, collectionId: string): boolean {
  const record = product as ProductRecord;
  const normalizedCollectionId = collectionId.toLowerCase();

  return readProductCollectionValues(record).some((value) => value.toLowerCase() === normalizedCollectionId);
}

function matchesStableProductId(product: StorefrontCatalogProduct, ids: Set<string>): boolean {
  const record = product as ProductRecord;
  const stableId = readProductId(record);
  const stableSlug = readProductSlug(record);

  return Boolean((stableId && ids.has(stableId)) || (stableSlug && ids.has(stableSlug)));
}

export function selectProductsForGrid(
  products: StorefrontCatalogProduct[] | undefined,
  source: ProductGridSource,
  limit = 12,
): ProductCardData[] {
  const sourceProducts = products ?? [];
  let selected = sourceProducts;

  if (source.type === "category") {
    selected = sourceProducts.filter((product) => matchesCategory(product, source.categorySlug));
  }

  if (source.type === "handpicked") {
    const ids = new Set(source.productIds);
    // `handpicked` solo puede resolver IDs presentes en el catálogo recibido;
    // no consulta ni inventa productos fuera de la página cargada por host.
    selected = sourceProducts.filter((product) => matchesStableProductId(product, ids));
  }

  if (source.type === "collection") {
    selected = sourceProducts.filter((product) => matchesCollection(product, source.collectionId));
  }

  if (source.type === "featured") {
    selected = sourceProducts.filter((product) => hasExplicitFeaturedFlag(product as ProductRecord));
  }

  if (source.type === "newest") {
    selected = sourceProducts
      .map((product) => ({ product, createdAt: readProductCreatedAt(product as ProductRecord) }))
      .filter((entry): entry is { product: StorefrontCatalogProduct; createdAt: number } => entry.createdAt !== undefined)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((entry) => entry.product);
  }

  return selected
    .slice(0, limit)
    .map(mapCatalogProductToCardData)
    .filter((product): product is ProductCardData => product !== null);
}

export function buildCategoryCatalogHref(category: StorefrontCategory): string {
  return category.categoryId ? `/catalogo?categoryId=${encodeURIComponent(category.categoryId)}` : "/catalogo";
}

export function mapCategoriesToTiles(categories: StorefrontCategory[] | undefined): CategoryTileItem[] {
  return (categories ?? []).map((category) => ({
    label: category.name,
    href: buildCategoryCatalogHref(category),
    ...(category.imageUrl ? { imageUrl: category.imageUrl } : {}),
  }));
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
