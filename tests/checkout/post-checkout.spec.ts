import { describe, expect, it } from "vitest";

import {
  shouldClearCartForOrder,
  shouldTrackPurchase,
} from "@/lib/checkout/post-checkout";
import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";
import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

function order(overrides: Partial<StorefrontOrderByTokenResult> = {}): StorefrontOrderByTokenResult {
  return {
    orderId: "ord_1",
    orderNumber: "000123",
    status: "pending",
    isPaid: false,
    total: 15200,
    createdAt: "2026-05-03T13:00:00.000Z",
    customer: {
      name: "Juan Perez",
      email: "juan@test.com",
    },
    shippingAddress: {
      street: "Belgrano",
      number: "123",
      city: "Corral de Bustos",
      province: "Cordoba",
      postalCode: "2645",
    },
    items: [
      {
        productId: "prod_1",
        description: "Producto 1",
        quantity: 2,
        unitPrice: 5000,
        total: 10000,
      },
      {
        productId: "prod_2",
        description: "Producto 2",
        quantity: 1,
        unitPrice: 5200,
        total: 5200,
      },
    ],
    payment: null,
    ...overrides,
  };
}

const cartItems: StorefrontCartItem[] = [
  {
    productId: "prod_1",
    slug: "prod-1",
    name: "Producto 1",
    href: "/catalogo/prod-1",
    quantity: 2,
    price: {
      amount: 5000,
      formatted: "$ 5.000",
      currency: "ARS",
    },
  },
  {
    productId: "prod_2",
    slug: "prod-2",
    name: "Producto 2",
    href: "/catalogo/prod-2",
    quantity: 1,
    price: {
      amount: 5200,
      formatted: "$ 5.200",
      currency: "ARS",
    },
  },
];

describe("shouldTrackPurchase", () => {
  it("trackea cuando la orden ya está paga", () => {
    expect(shouldTrackPurchase(order({ isPaid: true }))).toBe(true);
  });

  it("trackea cuando el estado viene approved aunque isPaid no haya actualizado", () => {
    expect(shouldTrackPurchase(order({ status: "approved" }))).toBe(true);
  });

  it("no trackea si la orden sigue pendiente", () => {
    expect(shouldTrackPurchase(order())).toBe(false);
  });
});

describe("shouldClearCartForOrder", () => {
  it("limpia el carrito cuando coincide exactamente con la orden", () => {
    expect(
      shouldClearCartForOrder(
        order({ createdAt: "2026-05-03T13:00:00.000Z" }),
        cartItems,
        new Date("2026-05-03T13:10:00.000Z").getTime(),
      ),
    ).toBe(true);
  });

  it("no limpia si cambia alguna cantidad", () => {
    const firstItem = cartItems[0]!;
    const secondItem = cartItems[1]!;

    expect(
      shouldClearCartForOrder(order(), [
        { ...firstItem, quantity: 1 },
        secondItem,
      ], new Date("2026-05-03T13:10:00.000Z").getTime()),
    ).toBe(false);
  });

  it("no limpia si el carrito actual tiene otros productos", () => {
    expect(
      shouldClearCartForOrder(order(), [
        ...cartItems,
        {
          productId: "prod_3",
          slug: "prod-3",
          name: "Producto 3",
          href: "/catalogo/prod-3",
          quantity: 1,
          price: {
            amount: 3000,
            formatted: "$ 3.000",
            currency: "ARS",
          },
        },
      ], new Date("2026-05-03T13:10:00.000Z").getTime()),
    ).toBe(false);
  });

  it("no limpia si la orden es vieja aunque coincida con el carrito", () => {
    expect(
      shouldClearCartForOrder(
        order({ createdAt: "2026-05-03T13:00:00.000Z" }),
        cartItems,
        new Date("2026-05-03T14:00:01.000Z").getTime(),
      ),
    ).toBe(false);
  });
});
