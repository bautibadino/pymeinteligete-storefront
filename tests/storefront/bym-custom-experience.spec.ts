import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { BymHomePage } from "@/components/storefront/bym-home-page";
import { isBymCustomExperience } from "@/lib/experiences/storefront-experience";
import type { StorefrontBootstrap, StorefrontCatalogProduct } from "@/lib/storefront-api";

vi.mock("@/components/social-proof/social-proof-carousel", async () => {
  const React = await import("react");

  return {
    SocialProofCarousel: function SocialProofCarousel(props: {
      empresaId?: string;
      tenantSlug?: string;
      title?: string;
      autoplay?: boolean;
      interval?: number;
      className?: string;
    }) {
      return React.createElement(
        "section",
        {
          "data-testid": "bym-google-reviews",
          "data-empresa-id": props.empresaId,
          "data-tenant-slug": props.tenantSlug,
          "data-autoplay": props.autoplay ? "true" : "false",
          "data-interval": props.interval,
          className: props.className,
        },
        props.title,
      );
    },
  };
});

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

function buildBootstrap(overrides: Partial<StorefrontBootstrap> = {}): StorefrontBootstrap {
  return {
    requestContext: { requestId: "req_1", storefrontVersion: "test", apiVersion: "v1" },
    tenant: {
      tenantSlug: "bym",
      empresaId: "emp_1",
      status: "active",
      resolvedHost: "bym.test",
      resolvedBy: "custom_domain",
    },
    branding: {
      storeName: "BYM SRL",
      colors: { primary: "#111111" },
    },
    storefrontExperience: {
      key: "bym-custom-v1",
      enabled: true,
    },
    presentation: {
      version: 1,
      updatedAt: "2026-05-08T12:00:00.000Z",
      theme: { preset: "minimalClean" },
      globals: {
        announcementBar: { id: "ab", type: "announcementBar", variant: "static", enabled: false, order: 0, content: {} },
        header: { id: "hdr", type: "header", variant: "minimal", enabled: false, order: 0, content: {} },
        footer: { id: "ftr", type: "footer", variant: "minimal", enabled: false, order: 0, content: {} },
      },
      pages: {
        home: {
          layout: {
            variant: "bym-immersive-home-v1",
            content: {
              desktopImage: { url: "https://cdn.example.com/desktop.webp", alt: "Camión en ruta" },
              mobileImage: { url: "https://cdn.example.com/mobile.webp", alt: "Neumático" },
              h1: "Neumáticos para seguir trabajando",
              introText: "Compra técnica con asesoramiento real.",
              primaryCta: { label: "Ver catálogo", href: "/catalogo" },
              benefitsEyebrow: "Promos BYM",
              benefitsTitle: "Beneficios para comprar cubiertas",
              benefits: [{ title: "Entrega coordinada", description: "Despacho y retiro." }],
            },
          },
          sections: [],
        },
        catalog: { sections: [] },
        product: { sections: [] },
      },
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
    ...overrides,
  };
}

describe("BYM custom experience", () => {
  it("detecta la experiencia codeada solo cuando está habilitada", () => {
    expect(isBymCustomExperience(buildBootstrap())).toBe(true);
    expect(isBymCustomExperience(buildBootstrap({ storefrontExperience: { key: "bym-custom-v1", enabled: false } }))).toBe(false);
    expect(isBymCustomExperience(buildBootstrap({ storefrontExperience: { key: "otra", enabled: true } }))).toBe(false);
  });

  it("renderiza home BYM con imagen CMS, H1, CTAs y productos destacados", () => {
    const products: StorefrontCatalogProduct[] = [
      {
        productId: "p1",
        slug: "cubierta-1",
        name: "Cubierta radial",
        imageUrl: "https://cdn.example.com/product.webp",
        price: { amount: 120000, currency: "ARS" },
      },
    ];

    const html = renderToStaticMarkup(
      createElement(BymHomePage, {
        bootstrap: buildBootstrap(),
        categories: [{ categoryId: "c1", slug: "neumaticos", name: "Neumáticos" }],
        products,
      }),
    );

    expect(html).toContain('data-bym-fullbleed="true"');
    expect(html).toContain("Neumáticos para seguir trabajando");
    expect(html).toContain("desktop.webp");
    expect(html).toContain("mobile.webp");
    expect(html).toContain("Ver catálogo");
    expect(html).toContain("Promos BYM");
    expect(html).toContain("Beneficios para comprar cubiertas");
    expect(html).toContain("Entrega coordinada");
    expect(html).toContain("Cubierta radial");
    expect(html).toContain("/producto/cubierta-1");
    expect(html).toContain("height:100dvh;min-height:100dvh");
    expect(html).toContain('data-testid="bym-google-reviews"');
    expect(html).toContain("Clientes que ya compraron en BYM");
    expect(html).toContain('data-autoplay="true"');
  });

  it("usa beneficios comerciales por defecto cuando no hay cards configuradas", () => {
    const bootstrap = buildBootstrap();
    if (bootstrap.presentation) {
      bootstrap.presentation.pages.home.layout = {
        variant: "bym-immersive-home-v1",
        content: {},
      };
    }

    const html = renderToStaticMarkup(
      createElement(BymHomePage, {
        bootstrap,
        categories: [],
        products: [],
      }),
    );

    expect(html).toContain("Cuotas sin interés");
    expect(html).toContain("Envíos gratis");
    expect(html).toContain("Descuentos activos");
    expect(html).toContain("Armado y balanceado");
    expect(html).toContain("bonificado");
  });
});
