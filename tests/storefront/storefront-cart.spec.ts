import { describe, expect, it } from "vitest";

import {
  buildCheckoutHrefFromCartItems,
  parseCheckoutItemsFromSearchParams,
  resolveCartItemPrice,
  type StorefrontCartItem,
} from "@/lib/cart/storefront-cart";

function createCartItem(
  overrides: Partial<StorefrontCartItem> = {},
): StorefrontCartItem {
  return {
    productId: "prod-1",
    slug: "producto-1",
    name: "Producto 1",
    href: "/producto-1",
    price: {
      amount: 100000,
      currency: "ARS",
      formatted: "$100.000",
    },
    quantity: 1,
    ...overrides,
  };
}

describe("storefront cart helpers", () => {
  it("construye un checkout href con múltiples items del carrito", () => {
    const href = buildCheckoutHrefFromCartItems([
      createCartItem(),
      createCartItem({
        productId: "prod-2",
        slug: "producto-2",
        name: "Producto 2",
        href: "/producto-2",
        quantity: 3,
      }),
    ]);

    expect(href).toBe("/checkout?item=prod-1%3A1&item=prod-2%3A3");
  });

  it("parsea items repetidos del querystring con retrocompat para productId simple", () => {
    expect(
      parseCheckoutItemsFromSearchParams({
        item: ["prod-1:2", "prod-2:4"],
      }),
    ).toEqual([
      { productId: "prod-1", quantity: 2 },
      { productId: "prod-2", quantity: 4 },
    ]);

    expect(
      parseCheckoutItemsFromSearchParams({
        productId: "legacy-prod",
        quantity: "5",
      }),
    ).toEqual([{ productId: "legacy-prod", quantity: 5 }]);
  });

  it("usa el precio base para carrito cuando existe basePrice", () => {
    expect(
      resolveCartItemPrice({
        price: {
          amount: 80000,
          currency: "ARS",
          formatted: "$80.000",
        },
        basePrice: {
          amount: 100000,
          formatted: "$100.000",
          currency: "ARS",
        },
      }),
    ).toEqual({
      amount: 100000,
      currency: "ARS",
      formatted: "$100.000",
    });
  });

  it("conserva el precio visible cuando no existe compareAtPrice", () => {
    expect(
      resolveCartItemPrice({
        price: {
          amount: 80000,
          currency: "ARS",
          formatted: "$80.000",
        },
      }),
    ).toEqual({
      amount: 80000,
      currency: "ARS",
      formatted: "$80.000",
    });
  });
});
