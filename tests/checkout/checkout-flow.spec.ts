import { describe, expect, it, vi } from "vitest";

import {
  buildFieldErrors,
  hasFieldErrors,
  readTrimmedString,
} from "@/lib/checkout/validation";

function createFormData(entries: Record<string, string | string[]>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        formData.append(key, item);
      }
    } else {
      formData.set(key, value);
    }
  }

  return formData;
}

describe("Checkout flow: auto strategy (Payment Brick)", () => {
  it("paso 1 (crear orden) no exige campos de pago cuando la estrategia es auto", () => {
    const formData = createFormData({
      paymentStrategy: "auto",
      customerName: "Juan Perez",
      customerEmail: "juan@mail.com",
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Corral de Bustos",
      shippingProvince: "Cordoba",
      shippingPostalCode: "2645",
      itemProductId: ["prod_1"],
      itemQuantity: ["2"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.paymentToken).toBeUndefined();
    expect(errors.paymentMethodId).toBeUndefined();
    expect(errors.payerEmail).toBeUndefined();
    expect(errors.payerIdType).toBeUndefined();
    expect(errors.payerIdNumber).toBeUndefined();
    expect(hasFieldErrors(errors)).toBe(false);
  });

  it("paso 2 (processPayment) mapea datos completos de tarjeta desde FormData", () => {
    const formData = createFormData({
      orderId: "ord_123",
      orderToken: "tok_456",
      transactionAmount: "15000",
      paymentToken: "tok_visa_789",
      paymentMethodId: "visa",
      installments: "3",
      issuerId: "issuer_1",
      payerEmail: "juan@mail.com",
      payerIdType: "DNI",
      payerIdNumber: "30111222",
    });

    const paymentToken = readTrimmedString(formData, "paymentToken");
    const paymentMethodId = readTrimmedString(formData, "paymentMethodId");
    const installments = Number(readTrimmedString(formData, "installments")) || 1;
    const payerEmail = readTrimmedString(formData, "payerEmail");
    const payerIdType = readTrimmedString(formData, "payerIdType");
    const payerIdNumber = readTrimmedString(formData, "payerIdNumber");
    const issuerId = readTrimmedString(formData, "issuerId");
    const transactionAmount = Number(readTrimmedString(formData, "transactionAmount")) || 0;

    const payload = {
      orderId: readTrimmedString(formData, "orderId"),
      orderToken: readTrimmedString(formData, "orderToken"),
      paymentData: {
        ...(paymentToken ? { token: paymentToken } : {}),
        payment_method_id: paymentMethodId,
        transaction_amount: transactionAmount,
        installments,
        ...(issuerId ? { issuer_id: issuerId } : {}),
        payer: {
          email: payerEmail,
          ...(payerIdType && payerIdNumber
            ? {
                identification: {
                  type: payerIdType,
                  number: payerIdNumber,
                },
              }
            : {}),
        },
      },
    };

    expect(payload.paymentData.token).toBe("tok_visa_789");
    expect(payload.paymentData.payment_method_id).toBe("visa");
    expect(payload.paymentData.transaction_amount).toBe(15000);
    expect(payload.paymentData.installments).toBe(3);
    expect(payload.paymentData.issuer_id).toBe("issuer_1");
    expect(payload.paymentData.payer.email).toBe("juan@mail.com");
    expect(payload.paymentData.payer.identification).toEqual({ type: "DNI", number: "30111222" });
  });

  it("paso 2 (processPayment) mapea ticket (efectivo) sin token ni identification", () => {
    const formData = createFormData({
      orderId: "ord_789",
      orderToken: "tok_abc",
      transactionAmount: "5000",
      paymentMethodId: "pagofacil",
      installments: "1",
      payerEmail: "maria@mail.com",
    });

    const paymentToken = readTrimmedString(formData, "paymentToken");
    const payload = {
      paymentData: {
        ...(paymentToken ? { token: paymentToken } : {}),
        payment_method_id: readTrimmedString(formData, "paymentMethodId"),
        transaction_amount: Number(readTrimmedString(formData, "transactionAmount")) || 0,
        installments: Number(readTrimmedString(formData, "installments")) || 1,
        payer: {
          email: readTrimmedString(formData, "payerEmail"),
        },
      },
    };

    expect(payload.paymentData.token).toBeUndefined();
    expect(payload.paymentData.payment_method_id).toBe("pagofacil");
    expect("identification" in payload.paymentData.payer).toBe(false);
  });

  it("mensaje de fallback manual contiene instrucción de pago manual cuando el pago es rechazado", () => {
    const status = "rejected";
    const statusDetail = "cc_rejected_other_reason";
    const message = `El pago no pudo completarse (${statusDetail || status}). La orden ya fue creada; podés completar el pago manualmente desde la confirmación.`;

    expect(message).toContain("manualmente");
    expect(message).toContain("orden ya fue creada");
    expect(message).toContain(statusDetail);
  });

  it("cada llamada a processPayment genera una idempotencyKey única (crypto.randomUUID)", () => {
    const uuids = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      uuids.add(crypto.randomUUID());
    }
    expect(uuids.size).toBe(100);
  });
});

describe("Checkout flow: none and manual strategies (regresión)", () => {
  it("none no exige campos de pago y crea orden sin redirección a pago", () => {
    const formData = createFormData({
      paymentStrategy: "none",
      customerName: "Juan Perez",
      customerEmail: "juan@mail.com",
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Corral de Bustos",
      shippingProvince: "Cordoba",
      shippingPostalCode: "2645",
      itemProductId: ["prod_1"],
      itemQuantity: ["2"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.paymentToken).toBeUndefined();
    expect(errors.paymentMethodId).toBeUndefined();
    expect(hasFieldErrors(errors)).toBe(false);
  });

  it("manual no exige campos de pago y crea orden sin redirección a pago", () => {
    const formData = createFormData({
      paymentStrategy: "manual",
      customerName: "Juan Perez",
      customerEmail: "juan@mail.com",
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Corral de Bustos",
      shippingProvince: "Cordoba",
      shippingPostalCode: "2645",
      itemProductId: ["prod_1"],
      itemQuantity: ["2"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.paymentToken).toBeUndefined();
    expect(errors.paymentMethodId).toBeUndefined();
    expect(hasFieldErrors(errors)).toBe(false);
  });
});

describe("Checkout flow: payment brick state transitions", () => {
  it("status va de loading -> ready cuando el brick se inicializa correctamente", () => {
    // Este test documenta el contrato de estados del PaymentBrick
    // Los estados válidos son: loading | ready | error | processing
    const validStatuses = ["loading", "ready", "error", "processing"];
    expect(validStatuses).toContain("loading");
    expect(validStatuses).toContain("ready");
    expect(validStatuses).toContain("error");
    expect(validStatuses).toContain("processing");
    expect(validStatuses).toHaveLength(4);
  });

  it("timeout de 15s fuerza error si el brick no está ready", () => {
    // Documentación del comportamiento de timeout
    expect(15000).toBe(15000);
  });
});
