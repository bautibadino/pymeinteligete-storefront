import { describe, expect, it } from "vitest";

import { buildStorefrontHeaders } from "@/lib/api/headers";
import {
  buildStorefrontQuerySignature,
  buildStorefrontSearchParams,
} from "@/lib/api/query";

describe("buildStorefrontHeaders", () => {
  it("inyecta headers obligatorios de storefront", () => {
    const headers = buildStorefrontHeaders({
      context: {
        host: "acme.com",
        requestId: "req_123",
        storefrontVersion: "storefront@0.1.0",
        tenantSlug: "acme",
      },
      idempotencyKey: "idem_123",
    });

    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("x-storefront-host")).toBe("acme.com");
    expect(headers.get("x-storefront-version")).toBe("storefront@0.1.0");
    expect(headers.get("x-request-id")).toBe("req_123");
    expect(headers.get("x-tenant-slug")).toBe("acme");
    expect(headers.get("Idempotency-Key")).toBe("idem_123");
  });
});

describe("buildStorefrontSearchParams", () => {
  it("serializa query params con orden estable y omite nullish", () => {
    const params = buildStorefrontSearchParams({
      search: "cubiertas",
      page: 2,
      ignored: null,
      category: ["auto", "camioneta"],
      available: true,
    });

    expect(params.toString()).toBe(
      "available=true&category=auto&category=camioneta&page=2&search=cubiertas",
    );
  });

  it("devuelve firma base cuando no hay query", () => {
    expect(buildStorefrontQuerySignature()).toBe("base");
  });
});

