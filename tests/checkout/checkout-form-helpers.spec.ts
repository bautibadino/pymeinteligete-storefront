import { describe, expect, it } from "vitest";

import {
  extractFiscalAutofillData,
  resolveCheckoutDisplayItems,
  resolveCheckoutPricingSummary,
  resolveInitialPaymentStrategy,
} from "@/components/storefront/checkout/checkout-form";
import type { StorefrontCartItem } from "@/lib/cart/storefront-cart";
import type { StorefrontCartValidateResult } from "@/lib/storefront-api";

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

const CART_VALIDATION: StorefrontCartValidateResult = {
  items: [
    {
      productId: "prod_1",
      name: "Mate Imperial",
      price: 10000,
      priceWithTax: 12100,
      requestedQuantity: 2,
      availableStock: 10,
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
        unitBasePriceAmount: null,
        unitPriceWithTaxAmount: null,
        unitPriceLabel: "$ 12.000",
        linePriceLabel: "$ 24.000",
        linePriceAmount: 24000,
        isValidated: false,
        isFallback: false,
      },
    ]);
  });

  it("prioriza los precios validados del backend cuando cart/validate ya resolvió el carrito", () => {
    const items = resolveCheckoutDisplayItems(
      [{ productId: "prod_1", quantity: 2 }],
      CART_ITEMS,
      CART_VALIDATION,
    );

    expect(items).toEqual([
      expect.objectContaining({
        productId: "prod_1",
        quantity: 2,
        title: "Mate Imperial",
        unitBasePriceAmount: 10000,
        unitPriceWithTaxAmount: 12100,
        linePriceAmount: 24200,
        isValidated: true,
        isFallback: false,
      }),
    ]);
    expect(items[0]?.unitPriceLabel).toContain("12.100");
    expect(items[0]?.linePriceLabel).toContain("24.200");
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
        unitBasePriceAmount: null,
        unitPriceWithTaxAmount: null,
        linePriceAmount: null,
        linePriceLabel: null,
        unitPriceLabel: null,
        isValidated: false,
        isFallback: true,
      },
    ]);
  });
});

describe("resolveCheckoutPricingSummary", () => {
  it("usa el summary de cart/validate como fuente efectiva del total de productos", () => {
    expect(resolveCheckoutPricingSummary(CART_VALIDATION, 48000)).toEqual({
      itemCount: 1,
      merchandiseNetSubtotal: 20000,
      merchandiseTaxAmount: 4200,
      merchandiseTotal: 24200,
      isValidated: true,
    });
  });

  it("cae al subtotal local sólo cuando todavía no existe validación del backend", () => {
    expect(resolveCheckoutPricingSummary(null, 48000)).toEqual({
      itemCount: null,
      merchandiseNetSubtotal: null,
      merchandiseTaxAmount: null,
      merchandiseTotal: 48000,
      isValidated: false,
    });
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

  it("descarta datos fiscales de prueba o stub para no completar clientes falsos", () => {
    expect(
      extractFiscalAutofillData({
        success: true,
        data: {
          customer: {
            name: "EMPRESA DE PRUEBA S.A. (STUB)",
            taxId: "30712345678",
            taxIdType: "80",
            taxpayerType: "Juridica",
          },
          metadata: {
            source: "afip-stub",
          },
        },
      }),
    ).toBeNull();

    expect(
      extractFiscalAutofillData({
        customer: {
          name: "Empresa de Prueba SRL",
          taxId: "30712345678",
          taxIdType: "80",
        },
      }),
    ).toBeNull();
  });
});
