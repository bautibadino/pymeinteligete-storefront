import { describe, expect, it } from "vitest";

import {
  isShippingCheckoutSnapshotExpired,
  normalizeStoredShippingCheckoutSnapshot,
} from "@/lib/shipping/checkout-shipping";
import type { StorefrontShippingCheckoutSnapshot } from "@/lib/types/storefront";

const VALID_SNAPSHOT: StorefrontShippingCheckoutSnapshot = {
  contractVersion: "storefront.shipping.quote.v1",
  provider: "andreani",
  optionId: "andreani:400039177:0",
  carrierName: "Andreani",
  serviceName: "Andreani contrato 177",
  currency: "ARS",
  priceWithTax: 14068,
  priceWithoutTax: 11626.45,
  destinationPostalCode: "2000",
  originPostalCode: "2645",
  packages: [{ declaredValue: 100000, volumeCm3: 5000, weightKg: 1 }],
  quotedAt: "2026-05-06T22:00:00.000Z",
  expiresAt: "2026-05-06T22:15:00.000Z",
};

describe("shipping checkout snapshot", () => {
  it("normaliza un snapshot válido para mostrarlo y enviarlo desde checkout", () => {
    expect(normalizeStoredShippingCheckoutSnapshot(VALID_SNAPSHOT)).toEqual(VALID_SNAPSHOT);
  });

  it("descarta snapshots incompletos o con contrato desconocido", () => {
    expect(
      normalizeStoredShippingCheckoutSnapshot({
        ...VALID_SNAPSHOT,
        contractVersion: "legacy.shipping.quote",
      }),
    ).toBeNull();

    expect(
      normalizeStoredShippingCheckoutSnapshot({
        ...VALID_SNAPSHOT,
        priceWithTax: "14068",
      }),
    ).toBeNull();
  });

  it("normaliza snapshots extendidos con beneficio y retiro en sucursal de Andreani", () => {
    const snapshot = {
      ...VALID_SNAPSHOT,
      deliveryType: "carrier_branch",
      originalShippingCost: 15971.25,
      finalShippingCost: 0,
      discountAmount: 15971.25,
      isFreeShipping: true,
      displayMessage: "Retirá gratis en sucursal Andreani",
      benefit: {
        kind: "free",
        amount: 15971.25,
        originalPriceWithTax: 15971.25,
        finalPriceWithTax: 0,
        label: "Envío gratis a sucursal",
        reason: "Regla activa",
      },
      selectedCarrierBranch: {
        branchId: "AND-ROS-001",
        name: "Andreani Rosario Centro",
        address: "Córdoba 123",
        city: "Rosario",
        province: "Santa Fe",
        postalCode: "2000",
      },
    } satisfies StorefrontShippingCheckoutSnapshot;

    expect(normalizeStoredShippingCheckoutSnapshot(snapshot)).toEqual(snapshot);
  });

  it("normaliza snapshots con mínimo faltante para envío gratis", () => {
    const snapshot = {
      ...VALID_SNAPSHOT,
      deliveryType: "carrier_branch",
      originalShippingCost: 13238.84,
      finalShippingCost: 13238.84,
      discountAmount: 0,
      isFreeShipping: false,
      benefitHint: {
        kind: "free_shipping_min_subtotal",
        ruleId: "rule-free-branch",
        ruleName: "Envío gratis a sucursal",
        deliveryType: "carrier_branch",
        minSubtotal: 150000,
        remainingSubtotal: 35728,
        label: "Te faltan $ 35.728 para envío gratis a sucursal",
      },
    } satisfies StorefrontShippingCheckoutSnapshot;

    expect(normalizeStoredShippingCheckoutSnapshot(snapshot)).toEqual(snapshot);
  });

  it("mantiene compatibilidad con snapshots legacy que sólo traen priceWithTax", () => {
    const normalized = normalizeStoredShippingCheckoutSnapshot(VALID_SNAPSHOT);

    expect(normalized?.priceWithTax).toBe(14068);
    expect(normalized?.finalShippingCost).toBeUndefined();
  });

  it("detecta cotizaciones vencidas", () => {
    expect(
      isShippingCheckoutSnapshotExpired(
        VALID_SNAPSHOT,
        new Date("2026-05-06T22:14:59.000Z"),
      ),
    ).toBe(false);

    expect(
      isShippingCheckoutSnapshotExpired(
        VALID_SNAPSHOT,
        new Date("2026-05-06T22:15:00.000Z"),
      ),
    ).toBe(true);
  });
});
