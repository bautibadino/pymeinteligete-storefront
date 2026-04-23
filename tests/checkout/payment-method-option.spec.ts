import { describe, expect, it } from "vitest";

import { resolvePaymentMethodOptionValue } from "@/lib/checkout/payment-method-option";

describe("resolvePaymentMethodOptionValue", () => {
  it("usa methodId cuando existe", () => {
    expect(resolvePaymentMethodOptionValue({ methodId: "mp_1" })).toBe("mp_1");
  });

  it("devuelve cadena vacía cuando no hay methodId", () => {
    expect(resolvePaymentMethodOptionValue({})).toBe("");
    expect(resolvePaymentMethodOptionValue({ methodId: null })).toBe("");
  });
});
