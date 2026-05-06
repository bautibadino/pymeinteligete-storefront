import { describe, expect, it } from "vitest";

import {
  extractFiscalAutofillData,
  resolveCheckoutDisplayItems,
  resolveInitialPaymentStrategy,
} from "@/components/storefront/checkout/checkout-form";
import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";

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
    quantity: 4,
  },
];

describe("resolveCheckoutDisplayItems", () => {
  it("enriquece los items del checkout con datos comerciales del carrito real", () => {
    const items = resolveCheckoutDisplayItems(
      [{ productId: "prod_1", quantity: 2 }],
      CART_ITEMS,
    );

    expect(items).toEqual([
      {
        productId: "prod_1",
        quantity: 2,
        title: "Mate Imperial",
        brand: "Acme",
        href: "/catalogo/mate-imperial",
        imageUrl: "https://cdn.test/mate.jpg",
        unitPriceLabel: "$ 12.000",
        linePriceLabel: "$ 24.000",
        linePriceAmount: 24000,
        isFallback: false,
      },
    ]);
  });

  it("mantiene un fallback comprador cuando el item llega por query pero no existe en el carrito local", () => {
    const items = resolveCheckoutDisplayItems(
      [{ productId: "prod_missing", quantity: 1 }],
      CART_ITEMS,
    );

    expect(items).toEqual([
      {
        productId: "prod_missing",
        quantity: 1,
        title: "Producto seleccionado",
        linePriceAmount: null,
        linePriceLabel: null,
        unitPriceLabel: null,
        isFallback: true,
      },
    ]);
  });
});

describe("resolveInitialPaymentStrategy", () => {
  it("prioriza pago online cuando el storefront ya tiene clave pública", () => {
    expect(
      resolveInitialPaymentStrategy({
        hasAutomaticPayment: true,
        hasVisibleMethods: true,
      }),
    ).toBe("auto");
  });

  it("cae a pago manual cuando hay métodos visibles pero todavía no está listo el flujo automático", () => {
    expect(
      resolveInitialPaymentStrategy({
        hasAutomaticPayment: false,
        hasVisibleMethods: true,
      }),
    ).toBe("manual");
  });

  it("cae a reserva de pedido cuando no hay cobros visibles", () => {
    expect(
      resolveInitialPaymentStrategy({
        hasAutomaticPayment: false,
        hasVisibleMethods: false,
      }),
    ).toBe("none");
  });
});

describe("extractFiscalAutofillData", () => {
  it("desenvuelve respuestas storefront con envelope success/data", () => {
    expect(
      extractFiscalAutofillData({
        success: true,
        data: {
          customer: {
            name: "Juan Perez",
            taxId: "20123456789",
            taxIdType: "80",
            taxpayerType: "Juridica",
            isMonotributo: false,
          },
        },
      }),
    ).toEqual({
      customer: {
        name: "Juan Perez",
        taxId: "20123456789",
        taxIdType: "80",
        taxpayerType: "Juridica",
        isMonotributo: false,
      },
    });
  });

  it("tolera respuestas planas por compatibilidad", () => {
    expect(
      extractFiscalAutofillData({
        customer: {
          name: "Juan Perez",
          taxId: "20123456789",
          taxIdType: "80",
          taxpayerType: "Juridica",
          isMonotributo: false,
        },
      }),
    ).toEqual({
      customer: {
        name: "Juan Perez",
        taxId: "20123456789",
        taxIdType: "80",
        taxpayerType: "Juridica",
        isMonotributo: false,
      },
    });
  });

  it("devuelve null si el payload no trae customer interpretable", () => {
    expect(
      extractFiscalAutofillData({
        success: true,
      }),
    ).toBeNull();
  });
});
