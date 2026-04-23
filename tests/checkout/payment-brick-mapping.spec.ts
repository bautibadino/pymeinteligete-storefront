import { describe, expect, it, vi } from "vitest";

import { readTrimmedString } from "@/lib/checkout/validation";

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

describe("Payment Brick → processPayment payload mapping", () => {
  it("mapea datos completos de tarjeta desde FormData", () => {
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

    expect(payload.orderId).toBe("ord_123");
    expect(payload.orderToken).toBe("tok_456");
    expect(payload.paymentData.token).toBe("tok_visa_789");
    expect(payload.paymentData.payment_method_id).toBe("visa");
    expect(payload.paymentData.transaction_amount).toBe(15000);
    expect(payload.paymentData.installments).toBe(3);
    expect(payload.paymentData.issuer_id).toBe("issuer_1");
    expect(payload.paymentData.payer.email).toBe("juan@mail.com");
    expect(payload.paymentData.payer.identification).toEqual({ type: "DNI", number: "30111222" });
  });

  it("mapea datos de pago en efectivo (ticket) sin token", () => {
    const formData = createFormData({
      orderId: "ord_789",
      orderToken: "tok_abc",
      transactionAmount: "5000",
      paymentMethodId: "pagofacil",
      installments: "1",
      payerEmail: "maria@mail.com",
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

    expect(payload.paymentData.token).toBeUndefined();
    expect(payload.paymentData.payment_method_id).toBe("pagofacil");
    expect(payload.paymentData.payer.email).toBe("maria@mail.com");
    expect(payload.paymentData.payer.identification).toBeUndefined();
  });

  it("incluye identification solo cuando ambos campos están presentes", () => {
    const formData = createFormData({
      orderId: "ord_999",
      orderToken: "tok_xyz",
      transactionAmount: "10000",
      paymentMethodId: "master",
      payerEmail: "pedro@mail.com",
      payerIdType: "DNI",
      // payerIdNumber faltante
    });

    const payerIdType = readTrimmedString(formData, "payerIdType");
    const payerIdNumber = readTrimmedString(formData, "payerIdNumber");

    const identification =
      payerIdType && payerIdNumber
        ? { type: payerIdType, number: payerIdNumber }
        : undefined;

    expect(identification).toBeUndefined();
  });
});
