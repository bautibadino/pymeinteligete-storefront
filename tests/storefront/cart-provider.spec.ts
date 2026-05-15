import { describe, expect, it } from "vitest";

import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";
import type { StorefrontCartValidateResult } from "@/lib/types/storefront";
import {
  resolveCartValidationMessage,
  resolveStorefrontCartItemsWithPricing,
  resolveStorefrontCartSubtotal,
  shouldValidateStorefrontCart,
} from "@/components/storefront/cart/storefront-cart-provider";

const CART_ITEMS: StorefrontCartItem[] = [
  {
    productId: "prod_1",
    slug: "mate-imperial",
    name: "Mate Imperial",
    brand: "Acme",
    href: "/catalogo/mate-imperial",
    imageUrl: "https://cdn.test/mate.jpg",
    price: {
      amount: 12000,
      formatted: "$ 12.000",
      currency: "ARS",
    },
    quantity: 2,
  },
];

const CART_VALIDATION: StorefrontCartValidateResult = {
  items: [
    {
      productId: "prod_1",
      name: "Mate Imperial",
      price: 10000,
      priceWithTax: 12100,
      requestedQuantity: 2,
      availableStock: 8,
      isValid: true,
    },
  ],
  isValid: true,
  warnings: [],
  summary: {
    itemCount: 1,
    subtotal: 20000,
    taxAmount: 4200,
    total: 24200,
  },
};

describe("storefront cart validated pricing", () => {
  it("superpone el precio validado del backend sobre los items persistidos del carrito", () => {
    expect(resolveStorefrontCartItemsWithPricing(CART_ITEMS, CART_VALIDATION)).toEqual([
      expect.objectContaining({
        productId: "prod_1",
        price: expect.objectContaining({
          amount: 12100,
          currency: "ARS",
        }),
      }),
    ]);
  });

  it("prioriza el total validado cuando cart/validate ya resolvió el subtotal efectivo", () => {
    expect(resolveStorefrontCartSubtotal(CART_ITEMS, CART_VALIDATION)).toBe(24200);
    expect(resolveStorefrontCartSubtotal(CART_ITEMS, null)).toBe(24000);
  });

  it("expone el warning operativo cuando el carrito ya no es válido", () => {
    expect(
      resolveCartValidationMessage({
        ...CART_VALIDATION,
        isValid: false,
        warnings: ["Mate Imperial: Solo hay 1 unidad disponible"],
      }),
    ).toBe("Mate Imperial: Solo hay 1 unidad disponible");
  });

  it("solo dispara validación live cuando el usuario está usando el carrito", () => {
    expect(shouldValidateStorefrontCart("/catalogo", false)).toBe(false);
    expect(shouldValidateStorefrontCart("/carrito", false)).toBe(true);
    expect(shouldValidateStorefrontCart("/catalogo", true)).toBe(true);
  });
});
