import { afterEach, describe, expect, it, vi } from "vitest";

import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import {
  StorefrontShippingQuoteError,
  postStorefrontShippingQuote,
} from "@/lib/shipping/shipping-quote-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("postStorefrontShippingQuote", () => {
  it("consume el contrato canónico local y desempaqueta el envelope del backend", async () => {
    const data = {
      contractVersion: "storefront.shipping.quote.v1",
      provider: "andreani",
      available: true,
      currency: "ARS",
      destinationPostalCode: "5800",
      originPostalCode: "5000",
      quotedAt: "2026-05-06T12:00:00.000Z",
      expiresAt: "2026-05-06T12:30:00.000Z",
      options: [
        {
          optionId: "andreani:contract:standard",
          provider: "andreani",
          carrierName: "Andreani",
          serviceName: "Estándar",
          currency: "ARS",
          priceWithTax: 15971.25,
          priceWithoutTax: 13200,
          billableWeightKg: 5,
          checkoutSnapshot: {
            contractVersion: "storefront.shipping.quote.v1",
            provider: "andreani",
            optionId: "andreani:contract:standard",
            carrierName: "Andreani",
            serviceName: "Estándar",
            priceWithTax: 15971.25,
            priceWithoutTax: 13200,
            currency: "ARS",
            destinationPostalCode: "5800",
            originPostalCode: "5000",
            packages: [{ declaredValue: 120000, volumeCm3: 9000, weightKg: 5 }],
            quotedAt: "2026-05-06T12:00:00.000Z",
            expiresAt: "2026-05-06T12:30:00.000Z",
          },
        },
      ],
    } as const;
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      postStorefrontShippingQuote({
        destinationPostalCode: "5800",
        packages: [{ declaredValue: 120000, volumeCm3: 9000, weightKg: 5 }],
      }),
    ).resolves.toEqual(data);

    expect(fetchMock).toHaveBeenCalledWith(
      STOREFRONT_API_PATHS.shippingQuote,
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          destinationPostalCode: "5800",
          packages: [{ declaredValue: 120000, volumeCm3: 9000, weightKg: 5 }],
        }),
      }),
    );
  });

  it("lanza error de contrato cuando el endpoint responde sin envelope exitoso", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, error: "Andreani no configurado" }), {
          status: 409,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      postStorefrontShippingQuote({
        destinationPostalCode: "5800",
        packages: [{ declaredValue: 120000, volumeCm3: 9000, weightKg: 5 }],
      }),
    ).rejects.toBeInstanceOf(StorefrontShippingQuoteError);
  });
});
