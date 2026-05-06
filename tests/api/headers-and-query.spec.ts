import { describe, expect, it } from "vitest";

import { buildStorefrontHeaders } from "@/lib/api/headers";
import {
  buildStorefrontQuerySignature,
  buildStorefrontSearchParams,
} from "@/lib/api/query";
import {
  STOREFRONT_LEGACY_PREVIEW_HEADER,
  STOREFRONT_PREVIEW_COOKIE,
  STOREFRONT_PREVIEW_HEADER,
  STOREFRONT_PREVIEW_TENANT_COOKIE,
  STOREFRONT_PREVIEW_TENANT_QUERY_PARAM,
  buildStorefrontPreviewCookieHeader,
  buildStorefrontPreviewTenantCookieHeader,
  normalizeStorefrontPreviewToken,
  normalizeStorefrontTenantSlug,
  readStorefrontPreviewTokenFromCookieHeader,
  readStorefrontTenantSlugFromCookieHeader,
} from "@/lib/preview/storefront-preview";

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

describe("storefront preview token", () => {
  it("normaliza token y descarta valores peligrosos", () => {
    expect(normalizeStorefrontPreviewToken("  token_123  ")).toBe("token_123");
    expect(normalizeStorefrontPreviewToken("bad\nvalue")).toBeNull();
    expect(normalizeStorefrontPreviewToken("")).toBeNull();
  });

  it("lee __preview_token desde cookie header", () => {
    const cookieHeader = `other=1; ${STOREFRONT_PREVIEW_COOKIE}=draft%2Ftoken%3D; session=abc`;

    expect(readStorefrontPreviewTokenFromCookieHeader(cookieHeader)).toBe("draft/token=");
    expect(buildStorefrontPreviewCookieHeader("draft/token=")).toBe(
      "__preview_token=draft%2Ftoken%3D",
    );
  });

  it("lee tenantSlug persistido de preview desde cookie header", () => {
    const cookieHeader = `other=1; ${STOREFRONT_PREVIEW_TENANT_COOKIE}=bym-demo; session=abc`;

    expect(readStorefrontTenantSlugFromCookieHeader(cookieHeader)).toBe("bym-demo");
    expect(buildStorefrontPreviewTenantCookieHeader("bym-demo")).toBe(
      "__preview_tenant_slug=bym-demo",
    );
  });

  it("usa x-preview-token como header primario y conserva el legacy", () => {
    expect(STOREFRONT_PREVIEW_HEADER).toBe("x-preview-token");
    expect(STOREFRONT_LEGACY_PREVIEW_HEADER).toBe("x-storefront-preview-token");
  });

  it("normaliza tenantSlug de preview y preserva el query param esperado", () => {
    expect(STOREFRONT_PREVIEW_TENANT_QUERY_PARAM).toBe("tenantSlug");
    expect(normalizeStorefrontTenantSlug("  BYM-demo  ")).toBe("bym-demo");
    expect(normalizeStorefrontTenantSlug("bad/value")).toBeNull();
    expect(normalizeStorefrontTenantSlug("")).toBeNull();
  });
});
