import { describe, expect, it } from "vitest";

import {
  getStorefrontInstallmentsCount,
  getStorefrontInstallmentsLabel,
} from "@/lib/commerce/installments";
import type { StorefrontBootstrap } from "@/lib/types/storefront";

function buildBootstrap(
  overrides: Partial<StorefrontBootstrap["commerce"]["payment"]> = {},
): Pick<StorefrontBootstrap, "commerce"> {
  return {
    commerce: {
      payment: {
        visibleMethods: ["mercadopago"],
        installments: { enabled: true, count: 6 },
        ...overrides,
      },
    },
  };
}

describe("storefront installments helpers", () => {
  it("deriva la cantidad de cuotas sólo cuando MercadoPago está visible y la configuración está activa", () => {
    expect(getStorefrontInstallmentsCount(buildBootstrap())).toBe(6);
    expect(
      getStorefrontInstallmentsCount(
        buildBootstrap({
          visibleMethods: ["cash"],
        }),
      ),
    ).toBeUndefined();
    expect(
      getStorefrontInstallmentsCount(
        buildBootstrap({
          installments: { enabled: false, count: 6 },
        }),
      ),
    ).toBeUndefined();
  });

  it("genera un label discreto para la barra del carrusel", () => {
    expect(getStorefrontInstallmentsLabel(buildBootstrap())).toBe("Hasta 6 cuotas sin interés");
    expect(
      getStorefrontInstallmentsLabel(
        buildBootstrap({
          installments: { enabled: true, count: 12, label: "Hasta 12 cuotas sin interés" },
        }),
      ),
    ).toBe("Hasta 12 cuotas sin interés");
  });
});
