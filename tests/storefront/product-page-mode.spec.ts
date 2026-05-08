import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Presentation, SectionInstance } from "@/lib/types/presentation";
import type { StorefrontBootstrap, StorefrontProductDetail } from "@/lib/storefront-api";

const loadProductExperienceMock = vi.hoisted(() => vi.fn());

vi.mock("@/app/(storefront)/_lib/storefront-shell-data", () => ({
  canBrowseCatalog: () => true,
  loadProductExperience: loadProductExperienceMock,
}));

vi.mock("@/components/presentation/PresentationRenderer", () => ({
  PresentationRenderer: function MockPresentationRenderer({
    page,
    includeGlobals,
    context,
  }: {
    page: string;
    includeGlobals?: boolean;
    context?: { product?: { name?: string } };
  }) {
    return createElement(
      "div",
      {
        "data-renderer": page,
        "data-include-globals": String(includeGlobals),
        "data-product-name": context?.product?.name ?? "",
      },
      "presentation product",
    );
  },
}));

vi.mock("@/components/presentation/PreviewBridge", () => ({
  PreviewBridge: function MockPreviewBridge() {
    return createElement("div", { "data-preview-bridge": "true" });
  },
}));

vi.mock("@/components/storefront/commerce-panels", () => ({
  ProductDetailPanel: function MockProductDetailPanel({ product }: { product: StorefrontProductDetail | null }) {
    return createElement(
      "div",
      {
        "data-legacy-product": "true",
        "data-product-name": product?.name ?? "",
      },
      "legacy product",
    );
  },
}));

vi.mock("@/components/storefront/surface-state", () => ({
  SurfaceStateCard: function MockSurfaceStateCard() {
    return createElement("div", { "data-surface-state": "true" });
  },
}));

vi.mock("@/lib/seo", () => ({
  buildTenantMetadata: vi.fn(),
  getTenantSeoRequestContext: vi.fn(),
  resolveTenantSeoSnapshotByRequest: vi.fn(),
}));

import ProductPage from "@/app/(storefront)/producto/[slug]/page";

function buildProductDetail(): StorefrontProductDetail {
  return {
    productId: "prod-1",
    slug: "cubierta-premium",
    name: "Cubierta Premium",
    brand: "Hankook",
    category: "neumaticos",
    price: { amount: 125000, currency: "ARS" },
    availability: { available: true, label: "Disponible" },
  };
}

function buildProductSection(overrides: Partial<SectionInstance<"productDetail">> = {}): SectionInstance<"productDetail"> {
  return {
    id: "product-detail",
    type: "productDetail",
    variant: "gallery-specs",
    enabled: true,
    order: 0,
    content: { showBreadcrumbs: true, showRelated: true },
    ...overrides,
  };
}

function buildPresentation(productSections: SectionInstance[] = [buildProductSection()]): Presentation {
  return {
    version: 1,
    updatedAt: "2026-05-08T12:00:00.000Z",
    theme: { preset: "minimalClean" },
    globals: {
      announcementBar: {
        id: "announcement",
        type: "announcementBar",
        variant: "static",
        enabled: false,
        order: 0,
        content: {},
      },
      header: {
        id: "header",
        type: "header",
        variant: "minimal",
        enabled: false,
        order: 1,
        content: {},
      },
      footer: {
        id: "footer",
        type: "footer",
        variant: "minimal",
        enabled: false,
        order: 2,
        content: {},
      },
    },
    pages: {
      home: { sections: [] },
      catalog: { sections: [] },
      product: { sections: productSections },
    },
  };
}

function buildBymBootstrap(presentation: Presentation): StorefrontBootstrap {
  return {
    requestContext: { requestId: "req_1", storefrontVersion: "test", apiVersion: "v1" },
    tenant: {
      tenantSlug: "bym",
      empresaId: "emp_1",
      status: "active",
      resolvedHost: "bym.test",
      resolvedBy: "custom_domain",
    },
    branding: { storeName: "BYM SRL", colors: { primary: "#111111" } },
    storefrontExperience: { key: "bym-custom-v1", enabled: true },
    presentation,
    theme: { preset: "default", layout: "commerce" },
    seo: {},
    navigation: { headerLinks: [], footerColumns: [] },
    home: { modules: [] },
    commerce: { payment: { visibleMethods: [] }, shipping: {} },
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

function mockProductExperience(presentation: Presentation) {
  const product = buildProductDetail();

  loadProductExperienceMock.mockResolvedValue({
    runtime: {
      hasApiBaseUrl: true,
      context: {
        host: "bym.test",
        resolvedHost: "bym.test",
        requestId: "req_product",
        storefrontVersion: "test",
      },
    },
    bootstrap: buildBymBootstrap(presentation),
    categories: [],
    issues: [],
    product,
    relatedProducts: [],
    paymentMethods: null,
  });
}

describe("ProductPage BYM mode", () => {
  beforeEach(() => {
    loadProductExperienceMock.mockReset();
  });

  it("usa la ficha de producto default de presentation aunque BYM tenga experiencia custom", async () => {
    mockProductExperience(buildPresentation());

    const element = await ProductPage({ params: Promise.resolve({ slug: "cubierta-premium" }) });
    const html = renderToStaticMarkup(element as ReactElement);

    expect(html).toContain('data-renderer="product"');
    expect(html).toContain('data-product-name="Cubierta Premium"');
    expect(html).not.toContain('data-legacy-product="true"');
  });

  it("mantiene fallback legacy si el bootstrap no trae secciones de producto", async () => {
    mockProductExperience(buildPresentation([]));

    const element = await ProductPage({ params: Promise.resolve({ slug: "cubierta-premium" }) });
    const html = renderToStaticMarkup(element as ReactElement);

    expect(html).toContain('data-legacy-product="true"');
    expect(html).not.toContain('data-renderer="product"');
  });
});
