import { afterEach, describe, expect, it, vi } from "vitest";

import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import {
  StorefrontShippingQuoteError,
  getStorefrontShippingBranches,
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

  it("preserva opciones extendidas con modalidad, costos finales y beneficio explícito", async () => {
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
          optionId: "andreani:branch:standard",
          provider: "andreani",
          carrierName: "Andreani",
          serviceName: "Sucursal Andreani",
          deliveryType: "carrier_branch",
          currency: "ARS",
          priceWithTax: 15971.25,
          priceWithoutTax: 13200,
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
          },
          benefitHint: {
            kind: "free_shipping_min_subtotal",
            ruleId: "rule-free-branch",
            ruleName: "Envío gratis a sucursal",
            deliveryType: "carrier_branch",
            minSubtotal: 150000,
            remainingSubtotal: 30000,
            label: "Te faltan $ 30.000 para envío gratis a sucursal",
          },
          selectedCarrierBranch: {
            branchId: "AND-RIO-001",
            name: "Andreani Río Cuarto",
            address: "Sobremonte 456",
            city: "Río Cuarto",
            province: "Córdoba",
            postalCode: "5800",
          },
          checkoutSnapshot: {
            contractVersion: "storefront.shipping.quote.v1",
            provider: "andreani",
            optionId: "andreani:branch:standard",
            carrierName: "Andreani",
            serviceName: "Sucursal Andreani",
            deliveryType: "carrier_branch",
            priceWithTax: 15971.25,
            priceWithoutTax: 13200,
            originalShippingCost: 15971.25,
            finalShippingCost: 0,
            discountAmount: 15971.25,
            isFreeShipping: true,
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
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      postStorefrontShippingQuote({
        destinationPostalCode: "5800",
        packages: [{ declaredValue: 120000, volumeCm3: 9000, weightKg: 5 }],
      }),
    ).resolves.toEqual(data);
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

describe("getStorefrontShippingBranches", () => {
  it("consulta sucursales Andreani por código postal y desempaqueta el envelope", async () => {
    const data = {
      provider: "andreani",
      postalCode: "5800",
      branches: [
        {
          branchId: "AND-5800-1",
          name: "Andreani Río Cuarto Centro",
          address: "Sobremonte 456",
          city: "Río Cuarto",
          province: "Córdoba",
          postalCode: "5800",
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
      getStorefrontShippingBranches({
        provider: "andreani",
        postalCode: "5800",
        contract: "400000000",
      }),
    ).resolves.toEqual(data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${STOREFRONT_API_PATHS.shippingBranches}?provider=andreani&postalCode=5800&contract=400000000`,
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
  });
});
