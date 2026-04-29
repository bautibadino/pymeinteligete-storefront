import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { StorefrontShell } from "@/components/storefront/storefront-shell";
import type { Presentation } from "@/lib/types/presentation";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

vi.mock("next/link", () => ({
  default: function Link({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return createElement("a", { href, ...props }, children);
  },
}));

vi.mock("@/components/presentation/PresentationRenderer", () => ({
  PresentationGlobalAnnouncementBar: function PresentationGlobalAnnouncementBar() {
    return createElement("div", { "data-template": "mock-announcement-bar" }, "bar");
  },
  PresentationGlobalHeader: function PresentationGlobalHeader() {
    return createElement("header", { "data-template": "mock-header" }, "header");
  },
  PresentationGlobalFooter: function PresentationGlobalFooter() {
    return createElement("footer", { "data-template": "mock-footer" }, "footer");
  },
}));

function renderHtml(element: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(element).replaceAll("&amp;", "&");
}

function buildPresentation(): Presentation {
  return {
    version: 1,
    updatedAt: "2026-04-29T12:00:00.000Z",
    theme: { preset: "minimalClean" },
    globals: {
      announcementBar: {
        id: "announcement",
        type: "announcementBar",
        variant: "static",
        enabled: true,
        order: 0,
        content: {},
      },
      header: {
        id: "header",
        type: "header",
        variant: "left-logo-search",
        enabled: true,
        order: 1,
        content: {},
      },
      footer: {
        id: "footer",
        type: "footer",
        variant: "minimal",
        enabled: true,
        order: 2,
        content: {},
      },
    },
    pages: {
      home: { sections: [] },
      catalog: { sections: [] },
      product: { sections: [] },
    },
  };
}

function buildBootstrap(overrides: Partial<StorefrontBootstrap> = {}): StorefrontBootstrap {
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
    presentation: buildPresentation(),
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
    ...overrides,
  };
}

describe("StorefrontShell presentation mode", () => {
  it("no agrega un renderer shell extra alrededor de una página presentation", () => {
    const html = renderHtml(
      createElement(StorefrontShell, {
        bootstrap: buildBootstrap(),
        host: "acme.test",
        issues: [],
        children: createElement(
          "div",
          { className: "presentation-renderer", "data-presentation-renderer": "true", "data-page": "home" },
          "contenido",
        ),
      }),
    );

    expect(html).toContain('class="presentation-shell"');
    expect(html).toContain('class="presentation-shell-content"');
    expect(html).not.toContain("presentation-frame");
    expect(html).not.toContain("presentation-page-content");
    expect(html).toContain('data-template="mock-header"');
    expect(html.match(/data-presentation-renderer="true"/g)).toHaveLength(1);
  });

  it("mantiene el contenedor de shell para contenido público que no es renderer", () => {
    const html = renderHtml(
      createElement(StorefrontShell, {
        bootstrap: buildBootstrap(),
        host: "acme.test",
        issues: [],
        children: createElement("section", { id: "checkout-surface" }, "checkout"),
      }),
    );

    expect(html).toContain('class="presentation-shell-content"');
    expect(html).toContain('id="checkout-surface"');
    expect(html).not.toContain('data-presentation-renderer="true"');
  });
});
