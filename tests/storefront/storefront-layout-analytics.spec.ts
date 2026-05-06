import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import StorefrontLayout from "@/app/(storefront)/layout";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

const { loadBootstrapExperienceMock } = vi.hoisted(() => ({
  loadBootstrapExperienceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/app/(storefront)/_lib/storefront-shell-data", () => ({
  loadBootstrapExperience: loadBootstrapExperienceMock,
}));

vi.mock("@/components/theme/TenantThemeProvider", () => ({
  TenantThemeProvider: function TenantThemeProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return createElement("div", { "data-theme-provider": "true" }, children);
  },
}));

vi.mock("@/components/storefront/cart/storefront-cart-provider", () => ({
  StorefrontCartProvider: function StorefrontCartProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return createElement("div", { "data-cart-provider": "true" }, children);
  },
}));

vi.mock("@/components/storefront/storefront-shell", () => ({
  StorefrontShell: function StorefrontShell({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return createElement("main", { "data-shell": "true" }, children);
  },
}));

vi.mock("@/components/analytics/storefront-analytics-provider", () => ({
  StorefrontAnalyticsProvider: function StorefrontAnalyticsProvider({
    children,
    bootstrap,
    host,
  }: {
    children: React.ReactNode;
    bootstrap: StorefrontBootstrap | null;
    host: string;
  }) {
    return createElement(
      "div",
      {
        "data-analytics-provider": host,
        "data-tenant-status": bootstrap?.tenant.status ?? "missing",
      },
      children,
    );
  },
}));

vi.mock("@/lib/theme", () => ({
  resolveEffectiveTenantTheme: vi.fn(() => ({
    name: "test-theme",
  })),
}));

function renderHtml(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

function buildBootstrap(): StorefrontBootstrap {
  return {
    requestContext: { requestId: "req_1", storefrontVersion: "test", apiVersion: "v1" },
    tenant: {
      tenantSlug: "acme",
      empresaId: "emp_1",
      status: "active",
      resolvedHost: "acme.test",
      resolvedBy: "custom_domain",
    },
    branding: {
      storeName: "Acme",
      colors: { primary: "#111827" },
    },
    theme: { preset: "default", layout: "commerce" },
    seo: {},
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
  };
}

describe("StorefrontLayout analytics", () => {
  it("monta el provider client-side con bootstrap y host del tenant", async () => {
    loadBootstrapExperienceMock.mockResolvedValueOnce({
      runtime: {
        context: {
          host: "acme.test",
        },
      },
      bootstrap: buildBootstrap(),
      issues: [],
    });

    const layout = await StorefrontLayout({
      children: createElement("section", { id: "checkout-surface" }, "checkout"),
    });
    const html = renderHtml(layout);

    expect(html).toContain('data-analytics-provider="acme.test"');
    expect(html).toContain('data-tenant-status="active"');
    expect(html).toContain('id="checkout-surface"');
  });
});
