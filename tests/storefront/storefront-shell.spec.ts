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

vi.mock("@/components/storefront/cart/header-cart-button", () => ({
  HeaderCartButton: function HeaderCartButton() {
    return createElement("button", { type: "button", "data-template": "mock-cart-button" }, "cart");
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

  it("agrupa announcement y header en un chrome sticky en presentation mode", () => {
    const html = renderHtml(
      createElement(StorefrontShell, {
        bootstrap: buildBootstrap(),
        host: "acme.test",
        issues: [],
        children: createElement("section", null, "contenido"),
      }),
    );

    expect(html).toContain('data-presentation-chrome="sticky-stack"');
    expect(html.indexOf('data-template="mock-announcement-bar"')).toBeLessThan(
      html.indexOf('data-template="mock-header"'),
    );
  });

  it("usa la shell BYM cuando el bootstrap trae una experiencia codeada", () => {
    const html = renderHtml(
      createElement(StorefrontShell, {
        bootstrap: buildBootstrap({
          storefrontExperience: {
            key: "bym-custom-v1",
            enabled: true,
          },
        }),
        host: "bym.test",
        issues: [],
        children: createElement("section", { id: "bym-page" }, "custom"),
      }),
    );

    expect(html).toContain('data-storefront-mode="bym-custom-v1"');
    expect(html).toContain('class="bym-custom-shell-content"');
    expect(html).toContain('id="bym-page"');
    expect(html).not.toContain('class="presentation-shell"');
    expect(html).not.toContain('data-presentation-chrome="sticky-stack"');
  });

  it("pasa categorías disponibles al menú mobile BYM", () => {
    const html = renderHtml(
      createElement(StorefrontShell, {
        bootstrap: buildBootstrap({
          storefrontExperience: {
            key: "bym-custom-v1",
            enabled: true,
          },
        }),
        categories: [
          { categoryId: "cat-neu", slug: "neumaticos", name: "Neumáticos" },
        ],
        host: "bym.test",
        issues: [],
        children: createElement("section", null, "custom"),
      }),
    );

    expect(html).toContain("Neumáticos");
    expect(html).toContain("/catalogo?category=neumaticos");
  });

  it("muestra todos los mensajes del announcement bar en la shell BYM", () => {
    const presentation = buildPresentation();
    presentation.globals.announcementBar = {
      ...presentation.globals.announcementBar,
      variant: "rotating",
      enabled: true,
      content: {
        messages: [
          { text: "6 cuotas sin interés" },
          { text: "Envío gratis en seleccionados" },
          { text: "Armado y balanceado bonificado" },
        ],
      },
    };

    const html = renderHtml(
      createElement(StorefrontShell, {
        bootstrap: buildBootstrap({
          presentation,
          storefrontExperience: {
            key: "bym-custom-v1",
            enabled: true,
          },
        }),
        host: "bym.test",
        issues: [],
        children: createElement("section", null, "custom"),
      }),
    );

    expect(html).toContain("6 cuotas sin interés");
    expect(html).toContain("Envío gratis en seleccionados");
    expect(html).toContain("Armado y balanceado bonificado");
  });

  it("no mezcla items default cuando existen mensajes explícitos en announcement bar", () => {
    const presentation = buildPresentation();
    presentation.globals.announcementBar = {
      ...presentation.globals.announcementBar,
      variant: "rotating",
      enabled: true,
      content: {
        messages: [{ text: "Texto cargado por el usuario" }],
        items: [
          { label: "Envíos" },
          { label: "Garantía" },
        ],
      },
    };

    const html = renderHtml(
      createElement(StorefrontShell, {
        bootstrap: buildBootstrap({
          presentation,
          storefrontExperience: {
            key: "bym-custom-v1",
            enabled: true,
          },
        }),
        host: "bym.test",
        issues: [],
        children: createElement("section", null, "custom"),
      }),
    );

    expect(html).toContain("Texto cargado por el usuario");
    expect(html).not.toContain("Envíos");
    expect(html).not.toContain("Garantía");
  });
});
