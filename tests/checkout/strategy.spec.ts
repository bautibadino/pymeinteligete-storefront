import { describe, expect, it } from "vitest";

import { resolveCheckoutStrategy } from "@/lib/checkout/strategy";

describe("resolveCheckoutStrategy", () => {
  it("bloquea auto con mensaje de contrato faltante", () => {
    const result = resolveCheckoutStrategy("auto");

    expect(result.allowed).toBe(false);
    expect(result).toHaveProperty("message");
    expect((result as { message: string }).message).toContain("pago automático");
  });

  it("permite none", () => {
    const result = resolveCheckoutStrategy("none");

    expect(result.allowed).toBe(true);
  });

  it("permite manual", () => {
    const result = resolveCheckoutStrategy("manual");

    expect(result.allowed).toBe(true);
  });

  it("permite valores desconocidos por defecto (fallback seguro)", () => {
    const result = resolveCheckoutStrategy("unknown");

    expect(result.allowed).toBe(true);
  });
});
