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
    expect(resolvePaymentStatusLabel(order({ payment: { status: "in_process" } }))).toBe("En revisión");
  });

  it("devuelve Rechazado para rejected", () => {
    expect(resolvePaymentStatusLabel(order({ payment: { status: "rejected" } }))).toBe("Rechazado");
  });

  it("devuelve el valor crudo si no coincide con conocidos", () => {
    expect(resolvePaymentStatusLabel(order({ payment: { status: "custom" } }))).toBe("custom");
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
