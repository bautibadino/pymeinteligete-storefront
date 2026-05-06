import { beforeEach, describe, expect, it, vi } from "vitest";

import { requestStorefrontApi } from "@/lib/api/client";

describe("requestStorefrontApi error envelopes", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("usa el mensaje y código del envelope estructurado que devuelve storefront v1 del ERP", async () => {
    vi.stubEnv("PYME_API_BASE_URL", "https://erp.pyme.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "CHECKOUT_FAILED",
              message: "Stock insuficiente",
              requestId: "req_checkout_failed",
            },
            stockWarnings: ["Producto sin stock"],
          }),
          {
            status: 400,
            headers: { "x-request-id": "req_checkout_failed" },
          },
        ),
      ),
    );

    await expect(
      requestStorefrontApi({
        path: "/api/storefront/v1/checkout",
        method: "POST",
        context: {
          host: "bym.test",
          requestId: "req_checkout_failed",
          storefrontVersion: "storefront@test",
          tenantSlug: "bym",
        },
        body: { idempotencyKey: "idem_1" },
      }),
    ).rejects.toMatchObject({
      name: "StorefrontApiError",
      message: "Stock insuficiente",
      code: "CHECKOUT_FAILED",
      status: 400,
      requestId: "req_checkout_failed",
    });
  });
});
