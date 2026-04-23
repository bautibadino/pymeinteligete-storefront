import { describe, expect, it } from "vitest";

import {
  resolvePaymentDetail,
  resolvePaymentStatusLabel,
} from "@/lib/checkout/confirmation";
import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

function order(overrides: Partial<StorefrontOrderByTokenResult> = {}): StorefrontOrderByTokenResult {
  return {
    orderId: "ord_1",
    orderNumber: "0001",
    status: "pending",
    isPaid: false,
    total: 1000,
    createdAt: "2026-04-23T12:00:00.000Z",
    customer: { name: "Juan", email: "juan@mail.com" },
    shippingAddress: { street: "Belgrano", number: "123", city: "Córdoba", province: "Córdoba", postalCode: "5000" },
    items: [],
    payment: null,
    ...overrides,
  };
}

describe("resolvePaymentStatusLabel", () => {
  it("devuelve Acreditado cuando isPaid es true", () => {
    expect(resolvePaymentStatusLabel(order({ isPaid: true }))).toBe("Acreditado");
  });

  it("devuelve Pendiente cuando no hay payment.status", () => {
    expect(resolvePaymentStatusLabel(order())).toBe("Pendiente");
  });

  it("devuelve En revisión para in_process", () => {
    expect(resolvePaymentStatusLabel(order({ status: "in_process" }))).toBe("En revisión");
  });

  it("devuelve Rechazado para rejected", () => {
    expect(resolvePaymentStatusLabel(order({ status: "rejected" }))).toBe("Rechazado");
  });

  it("devuelve el valor crudo si no coincide con conocidos", () => {
    expect(resolvePaymentStatusLabel(order({ status: "custom" }))).toBe("custom");
  });
});

describe("resolvePaymentDetail", () => {
  it("muestra proveedor y referencia cuando existen", () => {
    const result = resolvePaymentDetail(
      order({ payment: { provider: "MP", reference: "ref_123" } }),
    );

    expect(result).toBe("Proveedor: MP · Referencia: ref_123");
  });

  it("devuelve fallback cuando no hay detalle", () => {
    expect(resolvePaymentDetail(order())).toBe("Sin detalle de pago aún.");
  });
});
