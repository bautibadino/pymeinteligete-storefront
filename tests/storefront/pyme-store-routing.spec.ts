import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StorefrontLayout from "@/app/(storefront)/layout";
import HomePage from "@/app/(storefront)/page";
import { isPymeStoreMarketingHost } from "@/lib/marketing/pyme-store-host";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

const { headersMock, loadBootstrapExperienceMock, loadHomeExperienceMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
  loadBootstrapExperienceMock: vi.fn(),
  loadHomeExperienceMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/app/(storefront)/_lib/storefront-shell-data", () => ({
  loadBootstrapExperience: loadBootstrapExperienceMock,
  loadHomeExperience: loadHomeExperienceMock,
}));

vi.mock("@/components/marketing/pyme-store-landing", () => ({
  PymeStoreLanding: function PymeStoreLanding() {
    return createElement("main", { "data-pyme-store-landing": "true" }, "Landing PyME Store");
  },
}));

vi.mock("@/components/theme/TenantThemeProvider", () => ({
  TenantThemeProvider: function TenantThemeProvider({ children }: { children: React.ReactNode }) {
    return createElement("div", { "data-theme-provider": "true" }, children);
  },
}));

vi.mock("@/components/analytics/storefront-analytics-provider", () => ({
  StorefrontAnalyticsProvider: function StorefrontAnalyticsProvider({
    children,
    host,
  }: {
    children: React.ReactNode;
    host: string;
  }) {
    return createElement("div", { "data-analytics-provider": host }, children);
  },
}));

vi.mock("@/components/storefront/cart/storefront-cart-provider", () => ({
  StorefrontCartProvider: function StorefrontCartProvider({ children }: { children: React.ReactNode }) {
    return createElement("div", { "data-cart-provider": "true" }, children);
  },
}));

vi.mock("@/components/storefront/storefront-shell", () => ({
  StorefrontShell: function StorefrontShell({ children }: { children: React.ReactNode }) {
    return createElement("main", { "data-shell": "true" }, children);
  },
}));

vi.mock("@/components/modules/ModuleRenderer", () => ({
  ModuleRenderer: function ModuleRenderer() {
    return createElement("section", { "data-module-renderer": "true" });
  },
}));

vi.mock("@/components/presentation/PresentationRenderer", () => ({
  PresentationRenderer: function PresentationRenderer() {
    return createElement("section", { "data-presentation-renderer": "true" });
  },
}));

vi.mock("@/components/presentation/PreviewBridge", () => ({
  PreviewBridge: function PreviewBridge() {
    return createElement("span", { "data-preview-bridge": "true" });
  },
}));

vi.mock("@/components/storefront/bym-home-page", () => ({
  BymHomePage: function BymHomePage() {
    return createElement("section", { "data-bym-home": "true" });
  },
}));

vi.mock("@/components/storefront/surface-state", () => ({
  SurfaceStateCard: function SurfaceStateCard() {
    return createElement("section", { "data-surface-state": "true" });
  },
}));

vi.mock("@/lib/seo", () => ({
  buildTenantMetadata: vi.fn(() => ({ title: "Tenant" })),
  resolveTenantSeoSnapshot: vi.fn(async () => ({})),
}));

vi.mock("@/lib/theme", () => ({
  resolveEffectiveTenantTheme: vi.fn(() => ({ name: "test-theme" })),
}));

function renderHtml(element: React.ReactElement): string {
  return renderToStaticMarkup(element);
}

function setHost(host: string): void {
  headersMock.mockResolvedValue(new Headers({ host }));
}

function buildBootstrap(): StorefrontBootstrap {
  return {
    requestContext: { requestId: "req_1", storefrontVersion: "test", apiVersion: "v1" },
    tenant: {
      tenantSlug: "bym",
      empresaId: "emp_bym",
      status: "active",
      resolvedHost: "www.bymlubricentro.com",
      resolvedBy: "custom_domain",
    },
    branding: { storeName: "BYM", colors: { primary: "#111827" } },
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

describe("routing comercial pymeinteligente.store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reconoce sólo el apex y www del dominio comercial sin depender de IDs", () => {
    expect(isPymeStoreMarketingHost("pymeinteligente.store")).toBe(true);
    expect(isPymeStoreMarketingHost("www.pymeinteligente.store")).toBe(true);
    expect(isPymeStoreMarketingHost("https://www.PYMEINTELIGENTE.store:443")).toBe(true);
    expect(isPymeStoreMarketingHost("bym.pymeinteligente.store")).toBe(false);
    expect(isPymeStoreMarketingHost("www.bymlubricentro.com")).toBe(false);
  });

  it("bypassea bootstrap y shell en el layout para el host comercial", async () => {
    setHost("www.pymeinteligente.store");

    const layout = await StorefrontLayout({
      children: createElement("section", { id: "marketing-home" }, "marketing"),
    });
    const html = renderHtml(layout);

    expect(loadBootstrapExperienceMock).not.toHaveBeenCalled();
    expect(html).toContain('id="marketing-home"');
    expect(html).not.toContain('data-shell="true"');
    expect(html).not.toContain('data-analytics-provider');
    expect(html).not.toContain('data-cart-provider');
  });

  it("renderiza la landing comercial en la home sin pedir experiencia storefront", async () => {
    setHost("pymeinteligente.store");

    const page = await HomePage({ searchParams: Promise.resolve({}) });
    const html = renderHtml(page);

    expect(loadHomeExperienceMock).not.toHaveBeenCalled();
    expect(html).toContain('data-pyme-store-landing="true"');
  });

  it("mantiene el flujo storefront actual para BYM", async () => {
    setHost("www.bymlubricentro.com");
    const bootstrap = buildBootstrap();
    loadBootstrapExperienceMock.mockResolvedValueOnce({
      runtime: { context: { host: "www.bymlubricentro.com" } },
      bootstrap,
      categories: [],
      issues: [],
    });
    loadHomeExperienceMock.mockResolvedValueOnce({
      runtime: { context: { host: "www.bymlubricentro.com" } },
      bootstrap,
      categories: [],
      catalog: { products: [] },
      paymentMethods: null,
      issues: [],
    });

    const [layout, page] = await Promise.all([
      StorefrontLayout({ children: createElement("section", { id: "bym-child" }, "bym") }),
      HomePage({ searchParams: Promise.resolve({}) }),
    ]);
    const html = renderHtml(createElement("div", null, layout, page));

    expect(loadBootstrapExperienceMock).toHaveBeenCalledTimes(1);
    expect(loadHomeExperienceMock).toHaveBeenCalledTimes(1);
    expect(html).toContain('data-shell="true"');
    expect(html).toContain('data-surface-state="true"');
  });
});
