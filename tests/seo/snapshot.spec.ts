import { beforeEach, describe, expect, it, vi } from "vitest";

import { resolveTenantSeoSnapshotByRequest } from "@/lib/seo/snapshot";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

vi.mock("@/lib/seo/bootstrap", () => ({
  getBootstrapForSeo: vi.fn(),
}));

vi.mock("@/lib/env/server-env", () => ({
  getServerEnvSnapshot: vi.fn(() => ({ nodeEnv: "production" })),
}));

import { getBootstrapForSeo } from "@/lib/seo/bootstrap";

const getBootstrapForSeoMock = vi.mocked(getBootstrapForSeo);

function buildBootstrap(): StorefrontBootstrap {
  return {
    requestContext: { requestId: "req_1", storefrontVersion: "test", apiVersion: "v1" },
    tenant: {
      tenantSlug: "acme",
      empresaId: "emp_1",
      status: "active",
      resolvedHost: "acme.example.com",
      resolvedBy: "custom_domain",
    },
    branding: {
      storeName: "Acme Store",
      faviconUrl: "https://cdn.example.com/favicon.png",
      favicon: {
        url: "https://cdn.example.com/favicon.png",
        mimeType: "image/png",
        assetId: "favicon-interno",
      },
      colors: { primary: "#111827" },
    },
    theme: { preset: "default", layout: "commerce" },
    seo: {
      defaultTitle: "Acme Store",
      defaultDescription: "Cubiertas y accesorios",
      ogImage: "https://cdn.example.com/og.png",
      ogImageMetadata: {
        url: "https://cdn.example.com/og.png",
        width: 1200,
        height: 630,
        assetId: "og-interno",
      },
    },
    navigation: { headerLinks: [], footerColumns: [] },
    home: { modules: [] },
    commerce: { payment: { visibleMethods: [] } },
    features: {
      reviewsEnabled: false,
      compareEnabled: false,
      wishlistEnabled: false,
      contactBarEnabled: false,
      searchEnabled: false,
    },
    pages: [],
  } as StorefrontBootstrap;
}

describe("resolveTenantSeoSnapshotByRequest", () => {
  beforeEach(() => {
    getBootstrapForSeoMock.mockReset();
  });

  it("resuelve metadata base desde los campos reales del bootstrap v1", async () => {
    getBootstrapForSeoMock.mockResolvedValueOnce({
      bootstrap: buildBootstrap(),
      issues: [],
    });

    const snapshot = await resolveTenantSeoSnapshotByRequest({
      protocol: "https",
      requestHost: "acme.example.com",
      resolvedHost: "acme.example.com",
      requestOrigin: new URL("https://acme.example.com"),
    });

    expect(snapshot.title).toBe("Acme Store");
    expect(snapshot.description).toBe("Cubiertas y accesorios");
    expect(snapshot.ogImageUrl).toBe("https://cdn.example.com/og.png");
    expect(snapshot.faviconUrl).toBe("https://cdn.example.com/favicon.png");
    expect(snapshot.canonicalBaseUrl.toString()).toBe("https://acme.example.com/");
  });

  it("prioriza las URLs públicas existentes aunque lleguen metadatos aditivos de media", async () => {
    getBootstrapForSeoMock.mockResolvedValueOnce({
      bootstrap: buildBootstrap(),
      issues: [],
    });

    const snapshot = await resolveTenantSeoSnapshotByRequest({
      protocol: "https",
      requestHost: "acme.example.com",
      resolvedHost: "acme.example.com",
      requestOrigin: new URL("https://acme.example.com"),
    });

    expect(snapshot.ogImageUrl).toBe("https://cdn.example.com/og.png");
    expect(snapshot.faviconUrl).toBe("https://cdn.example.com/favicon.png");
  });
});
