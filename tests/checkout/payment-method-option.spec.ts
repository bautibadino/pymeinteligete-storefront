import { describe, expect, it } from "vitest";

import { resolvePaymentMethodOptionValue } from "@/lib/checkout/payment-method-option";

describe("resolvePaymentMethodOptionValue", () => {
  it("prioriza id sobre code", () => {
    expect(resolvePaymentMethodOptionValue({ id: "id_1", code: "code_1" })).toBe("id_1");
  });

  it("usa code cuando no hay id", () => {
    expect(resolvePaymentMethodOptionValue({ id: null, code: "code_1" })).toBe("code_1");
    expect(resolvePaymentMethodOptionValue({ code: "code_1" })).toBe("code_1");
  });

  it("devuelve cadena vacía cuando no hay ni id ni code", () => {
    expect(resolvePaymentMethodOptionValue({})).toBe("");
    expect(resolvePaymentMethodOptionValue({ id: null, code: null })).toBe("");
  });
});
