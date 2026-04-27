import { describe, expect, it } from "vitest";

import { resolveProductPurchaseState } from "@/lib/storefront/product-purchase-state";

describe("resolveProductPurchaseState", () => {
  it("no habilita checkout si falta disponibilidad explicita del backend", () => {
    expect(resolveProductPurchaseState({ productId: "prod-1" })).toEqual({
      canPurchase: false,
      stockLabel: "Disponibilidad a confirmar",
    });
  });

  it("habilita checkout solo con producto y disponibilidad positiva explicita", () => {
    expect(
      resolveProductPurchaseState({
        productId: "prod-1",
        stock: { available: true, label: "Stock disponible" },
      }),
    ).toEqual({
      canPurchase: true,
      stockLabel: "Stock disponible",
    });
  });

  it("mantiene bloqueado el checkout cuando el backend informa sin stock", () => {
    expect(
      resolveProductPurchaseState({
        productId: "prod-1",
        stock: { available: false, label: "Sin stock" },
      }),
    ).toEqual({
      canPurchase: false,
      stockLabel: "Sin stock",
    });
  });
});
