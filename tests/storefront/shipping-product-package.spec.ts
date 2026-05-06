import { describe, expect, it } from "vitest";

import {
  DEFAULT_STOREFRONT_SHIPPING_VOLUME_CM3,
  DEFAULT_STOREFRONT_SHIPPING_WEIGHT_KG,
  buildShippingQuotePackageFromProductDetailData,
  buildShippingQuotePackageFromCartItems,
  buildShippingQuotePackageFromStorefrontProduct,
} from "@/lib/shipping/product-package";

describe("shipping product package", () => {
  it("usa peso y dimensiones del producto real cuando existen", () => {
    expect(
      buildShippingQuotePackageFromStorefrontProduct({
        productId: "prod-1",
        slug: "cubierta",
        name: "Cubierta",
        price: { amount: 120000, currency: "ARS" },
        weight: 7,
        dimensions: { length: 60, width: 20, height: 60 },
      }),
    ).toEqual({
      declaredValue: 120000,
      volumeCm3: 72000,
      weightKg: 7,
    });
  });

  it("degrada a paquete QA seguro cuando el contrato de producto no trae logística", () => {
    expect(
      buildShippingQuotePackageFromProductDetailData({
        id: "prod-1",
        slug: "aceite",
        name: "Aceite",
        images: [],
        price: { amount: 55000, currency: "ARS", formatted: "$55.000" },
        href: "/producto/aceite",
      }),
    ).toEqual({
      declaredValue: 55000,
      volumeCm3: DEFAULT_STOREFRONT_SHIPPING_VOLUME_CM3,
      weightKg: DEFAULT_STOREFRONT_SHIPPING_WEIGHT_KG,
    });
  });

  it("agrega los items del carrito en un paquete de cotización", () => {
    expect(
      buildShippingQuotePackageFromCartItems([
        {
          productId: "prod-1",
          slug: "cubierta",
          name: "Cubierta",
          href: "/producto/cubierta",
          price: { amount: 100000, currency: "ARS", formatted: "$100.000" },
          quantity: 2,
        },
        {
          productId: "prod-2",
          slug: "aceite",
          name: "Aceite",
          href: "/producto/aceite",
          price: { amount: 50000, currency: "ARS", formatted: "$50.000" },
          quantity: 1,
        },
      ]),
    ).toEqual({
      declaredValue: 250000,
      volumeCm3: DEFAULT_STOREFRONT_SHIPPING_VOLUME_CM3 * 3,
      weightKg: DEFAULT_STOREFRONT_SHIPPING_WEIGHT_KG * 3,
    });
  });
});
