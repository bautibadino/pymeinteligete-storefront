import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/storefront/checkout/checkout-post-purchase-effects", () => ({
  CheckoutPostPurchaseEffects: () => null,
}));

vi.mock("@/components/storefront/cart/storefront-cart-provider", () => ({
  useStorefrontCart: () => ({
    clearCart: vi.fn(),
    items: [],
  }),
}));

import { ConfirmationSummary } from "@/components/storefront/checkout/confirmation-summary";
import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

const order: StorefrontOrderByTokenResult = {
  orderId: "order_1",
  orderNumber: "908807CC",
  status: "pending",
  isPaid: false,
  total: 111382,
  createdAt: "2026-05-06T20:37:32.000Z",
  customer: {
    name: "Juan",
    email: "juan@example.com",
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
      description: "Cubierta HANKOOK",
      quantity: 1,
      unitPrice: 92051,
      total: 111382,
    },
  ],
  payment: null,
};

describe("ConfirmationSummary compact manual payment", () => {
  it("muestra la cuenta, descuento, importe y contacto sin pedir elegir metodo otra vez", () => {
    const html = renderToStaticMarkup(
      createElement(ConfirmationSummary, {
        order,
        originalOrderTotal: 139227,
        orderToken: "signed-token",
        paymentMethods: [
          {
            methodId: "transferencia",
            methodType: "manual",
            displayName: "Contado",
            description: "Transferí y enviá el comprobante",
            icon: null,
            color: null,
            discount: { type: "percentage", value: 20 },
          },
        ],
        manualPayment: {
          paymentAttemptId: "attempt_1",
          orderId: "order_1",
          orderToken: "signed-token",
          amount: 111382,
          methodDisplayName: "Contado",
          instructions: "Transferí el importe exacto y avisá el pago.",
          bankAccounts: [
            {
              bank: "Banco Test",
              cbu: "1234567890123456789012",
              alias: "BYM.PAGOS",
            },
          ],
          contactInfo: {
            email: "pagos@bym.test",
          },
        },
      }),
    );

    expect(html).toContain("Transferí para confirmar tu pedido");
    expect(html).toContain("Banco Test");
    expect(html).toContain("BYM.PAGOS");
    expect(html).toContain("pagos@bym.test");
    expect(html).toContain("$ 111.382");
    expect(html).toContain("Ahorraste");
    expect(html).toContain("$ 27.845");
    expect(html).not.toContain("Completar el pago con un método disponible");
    expect(html).not.toContain("backend");
    expect(html).not.toContain("Iniciar pago manual");
  });

  it("muestra las cuotas cuando la orden informa installments del pago online", () => {
    const html = renderToStaticMarkup(
      createElement(ConfirmationSummary, {
        order: {
          ...order,
          isPaid: true,
          payment: {
            provider: "mercadopago",
            reference: "mp_1",
            method: "visa",
            amount: 111382,
            installments: 6,
          },
        },
        orderToken: "signed-token",
        paymentMethods: [],
      }),
    );

    expect(html).toContain("6 cuotas");
    expect(html).toContain("$ 18.564");
  });

  it("muestra el precio por unidad desde el total final de la linea, no desde el neto interno", () => {
    const html = renderToStaticMarkup(
      createElement(ConfirmationSummary, {
        order: {
          ...order,
          items: [
            {
              productId: "prod_1",
              description: "Cubierta HANKOOK",
              quantity: 1,
              unitPrice: 115064,
              total: 111382,
            },
          ],
        },
        orderToken: "signed-token",
        paymentMethods: [],
      }),
    );

    expect(html).toContain("1 unidad");
    expect(html).toContain("$ 111.382 c/u");
    expect(html).not.toContain("$ 115.064 c/u");
  });
});
