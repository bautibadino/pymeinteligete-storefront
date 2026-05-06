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

