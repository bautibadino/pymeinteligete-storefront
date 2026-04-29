import { describe, expect, it, vi } from "vitest";

import {
  initialManualPaymentActionState,
  submitManualPaymentAction,
} from "@/app/(storefront)/checkout/actions";
import { buildManualPaymentSuccessDetails } from "@/lib/checkout/manual-payment";
import type { StorefrontManualPaymentResult } from "@/lib/storefront-api";

const { postManualPaymentMock } = vi.hoisted(() => ({
  postManualPaymentMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/runtime/storefront-request-context", () => ({
  getStorefrontRuntimeSnapshot: vi.fn(async () => ({
    context: {
      host: "tienda.test",
    },
  })),
}));

vi.mock("@/lib/storefront-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storefront-api")>(
    "@/lib/storefront-api",
  );

  return {
    ...actual,
    postManualPayment: postManualPaymentMock,
  };
});

function createFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

function manualPaymentResult(
  overrides: Partial<StorefrontManualPaymentResult> = {},
): StorefrontManualPaymentResult {
  return {
    paymentAttemptId: "attempt_1",
    orderId: "ord_1",
    orderToken: "tok_1",
    amount: 15200,
    methodDisplayName: "Transferencia bancaria",
    instructions:
      "Transferí el importe exacto y enviá el comprobante indicando tu número de orden.",
    bankAccounts: [
      {
        bank: "Banco Nación",
        cbu: "0720000720000001234567",
        alias: "tienda.demo",
      },
    ],
    contactInfo: {
      email: "pagos@tienda.test",
      whatsapp: "+54 9 351 555 0000",
    },
    ...overrides,
  };
}

describe("submitManualPaymentAction", () => {
  it("devuelve el detalle real del backend cuando inicia un pago manual", async () => {
    postManualPaymentMock.mockResolvedValueOnce(manualPaymentResult());

    const result = await submitManualPaymentAction(
      initialManualPaymentActionState,
      createFormData({
        orderToken: "tok_1",
        methodId: "manual-transfer",
      }),
    );

    expect(postManualPaymentMock).toHaveBeenCalledWith(
      { host: "tienda.test" },
      "tok_1",
      { methodId: "manual-transfer" },
    );
    expect(result).toEqual({
      status: "success",
      message: "Seguí estas instrucciones para completar el pago manual de la orden.",
      paymentAttemptId: "attempt_1",
      orderId: "ord_1",
      orderToken: "tok_1",
      amount: 15200,
      methodDisplayName: "Transferencia bancaria",
      instructions:
        "Transferí el importe exacto y enviá el comprobante indicando tu número de orden.",
      bankAccounts: [
        {
          bank: "Banco Nación",
          cbu: "0720000720000001234567",
          alias: "tienda.demo",
        },
      ],
      contactInfo: {
        email: "pagos@tienda.test",
        whatsapp: "+54 9 351 555 0000",
      },
    });
  });
});

describe("buildManualPaymentSuccessDetails", () => {
  it("expone instrucciones, cuentas y contacto reales del pago manual para renderizarlos en success", () => {
    const details = buildManualPaymentSuccessDetails({
      ...manualPaymentResult(),
    });

    expect(details.methodDisplayName).toBe("Transferencia bancaria");
    expect(details.instructions).toBe(
      "Transferí el importe exacto y enviá el comprobante indicando tu número de orden.",
    );
    expect(details.bankAccounts).toEqual([
      {
        bank: "Banco Nación",
        cbu: "0720000720000001234567",
        alias: "tienda.demo",
      },
    ]);
    expect(details.contactItems).toEqual([
      { label: "Email", value: "pagos@tienda.test" },
      { label: "WhatsApp", value: "+54 9 351 555 0000" },
    ]);
  });
});
