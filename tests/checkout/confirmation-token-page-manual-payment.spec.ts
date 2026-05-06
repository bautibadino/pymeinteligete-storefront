import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const confirmationSummaryMock = vi.hoisted(() => vi.fn());
const postManualPaymentMock = vi.hoisted(() => vi.fn());
const getOrderByTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/app/(storefront)/_lib/storefront-shell-data", () => ({
  canFetchPaymentMethods: vi.fn(() => true),
  loadBootstrapExperience: vi.fn(async () => ({
    runtime: {
      context: {
        host: "bym.pymeinteligente.com.ar",
      },
    },
    bootstrap: {
      tenant: {
        status: "active",
      },
    },
    issues: [],
  })),
  resolveTenantDisplayName: vi.fn(() => "BYM SRL"),
}));

vi.mock("@/components/storefront/checkout/confirmation-summary", () => ({
  ConfirmationSummary: (props: unknown) => {
    confirmationSummaryMock(props);
    return createElement("section", { "data-confirmation-summary": "true" }, "summary");
  },
}));

vi.mock("@/lib/storefront-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storefront-api")>(
    "@/lib/storefront-api",
  );

  return {
    ...actual,
    getOrderByToken: getOrderByTokenMock,
    getPaymentMethods: vi.fn(async () => ({
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
    })),
    postManualPayment: postManualPaymentMock,
  };
});

function makeOrder(total: number) {
  return {
    orderId: "order_1",
    orderNumber: "908807CC",
    status: "pending",
    isPaid: false,
    total,
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
        unitPrice: total,
        total,
      },
    ],
    payment: null,
  };
}

function renderHtml(element: Awaited<ReturnType<typeof import("@/app/(storefront)/checkout/confirmacion/[token]/page").default>>): string {
  return renderToStaticMarkup(element);
}

describe("CheckoutConfirmationTokenPage manual payment", () => {
  beforeEach(() => {
    confirmationSummaryMock.mockClear();
    postManualPaymentMock.mockReset();
    getOrderByTokenMock.mockReset();
  });

  it("inicia automaticamente el pago manual elegido, refetchea la orden y entrega instrucciones a la UI", async () => {
    getOrderByTokenMock
      .mockResolvedValueOnce(makeOrder(139227))
      .mockResolvedValueOnce(makeOrder(111382));
    postManualPaymentMock.mockResolvedValueOnce({
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
    });

    const module = await import("@/app/(storefront)/checkout/confirmacion/[token]/page");
    renderHtml(
      await module.default({
        params: Promise.resolve({ token: "signed-token" }),
        searchParams: Promise.resolve({ method: "transferencia" }),
      }),
    );

    expect(postManualPaymentMock).toHaveBeenCalledWith(
      { host: "bym.pymeinteligente.com.ar" },
      "signed-token",
      { methodId: "transferencia" },
    );
    expect(getOrderByTokenMock).toHaveBeenCalledTimes(2);
    expect(confirmationSummaryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        originalOrderTotal: 139227,
        order: expect.objectContaining({
          total: 111382,
        }),
        manualPayment: expect.objectContaining({
          amount: 111382,
          methodDisplayName: "Contado",
        }),
      }),
    );
  });
});
