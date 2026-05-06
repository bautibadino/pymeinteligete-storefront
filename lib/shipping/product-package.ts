import type { ProductDetailData } from "@/lib/modules/product-detail";
import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";
import type { StorefrontProductDetail, StorefrontShippingQuotePackage } from "@/lib/types/storefront";

export const DEFAULT_STOREFRONT_SHIPPING_WEIGHT_KG = 5;
export const DEFAULT_STOREFRONT_SHIPPING_VOLUME_CM3 = 9000;
export const MIN_STOREFRONT_DECLARED_VALUE = 1;

type ShippingPackageProduct = {
  price?: { amount?: number } | undefined;
  discountedPrice?: number | undefined;
  weight?: number | undefined;
  dimensions?: {
    length?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
  } | undefined;
};

function readPositiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function resolveDeclaredValue(product: ShippingPackageProduct): number {
  return (
    readPositiveNumber(product.discountedPrice) ??
    readPositiveNumber(product.price?.amount) ??
    MIN_STOREFRONT_DECLARED_VALUE
  );
}

function resolveWeightKg(product: ShippingPackageProduct): number {
  return readPositiveNumber(product.weight) ?? DEFAULT_STOREFRONT_SHIPPING_WEIGHT_KG;
}

function resolveVolumeCm3(product: ShippingPackageProduct): number {
  const length = readPositiveNumber(product.dimensions?.length);
  const width = readPositiveNumber(product.dimensions?.width);
  const height = readPositiveNumber(product.dimensions?.height);

  if (length && width && height) {
    return Math.round(length * width * height);
  }

  return DEFAULT_STOREFRONT_SHIPPING_VOLUME_CM3;
}

export function buildShippingQuotePackageFromStorefrontProduct(
  product: StorefrontProductDetail,
): StorefrontShippingQuotePackage {
  return {
    declaredValue: resolveDeclaredValue(product),
    volumeCm3: resolveVolumeCm3(product),
    weightKg: resolveWeightKg(product),
  };
}

export function buildShippingQuotePackageFromProductDetailData(
  product: ProductDetailData,
): StorefrontShippingQuotePackage {
  return {
    declaredValue: resolveDeclaredValue(product),
    volumeCm3: DEFAULT_STOREFRONT_SHIPPING_VOLUME_CM3,
    weightKg: DEFAULT_STOREFRONT_SHIPPING_WEIGHT_KG,
  };
}

export function buildShippingQuotePackageFromCartItems(
  items: StorefrontCartItem[],
): StorefrontShippingQuotePackage | null {
  if (items.length === 0) {
    return null;
  }

  const totals = items.reduce(
    (current, item) => {
      const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;

      return {
        declaredValue: current.declaredValue + item.price.amount * quantity,
        volumeCm3: current.volumeCm3 + DEFAULT_STOREFRONT_SHIPPING_VOLUME_CM3 * quantity,
        weightKg: current.weightKg + DEFAULT_STOREFRONT_SHIPPING_WEIGHT_KG * quantity,
      };
    },
    { declaredValue: 0, volumeCm3: 0, weightKg: 0 },
  );

  return {
    declaredValue: Math.max(MIN_STOREFRONT_DECLARED_VALUE, totals.declaredValue),
    volumeCm3: totals.volumeCm3,
    weightKg: totals.weightKg,
  };
}
