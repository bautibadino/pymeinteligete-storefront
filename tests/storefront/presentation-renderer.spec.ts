import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getEnabledSortedSections,
  shouldUsePresentation,
} from "@/lib/presentation/render-utils";
import { adaptSectionToModule } from "@/components/presentation/section-adapter";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import {
  buildProductPresentationContext,
  hydrateProductPresentationWithRuntimeSignals,
} from "@/app/(storefront)/producto/_lib/presentation-context";
import type { Presentation, SectionInstance, SectionType } from "@/lib/types/presentation";
import type {
  StorefrontBootstrap,
  StorefrontCatalogProduct,
  StorefrontProductDetail,
} from "@/lib/storefront-api";

function buildSection<T extends SectionType = "hero">(
  overrides: Partial<SectionInstance<T>> = {},
): SectionInstance<T> {
  return {
    id: "sec-1",
    type: "hero" as T,
    variant: "split",
    enabled: true,
    order: 0,
    content: {},
    ...overrides,
  };
}

function buildPresentation(overrides: Partial<Presentation> = {}): Presentation {
  return {
    version: 1,
    updatedAt: "2026-04-23T12:00:00.000Z",
    theme: { preset: "minimalClean" },
    globals: {
      announcementBar: buildSection({ type: "announcementBar", variant: "static", enabled: false }),
      header: buildSection({ type: "header", variant: "minimal", enabled: true }),
      footer: buildSection({ type: "footer", variant: "minimal", enabled: true }),
    },
    pages: {
      home: { sections: [] },
      catalog: { sections: [] },
      product: { sections: [] },
    },
    ...overrides,
  };
}

function buildProductDetail(overrides: Partial<StorefrontProductDetail> = {}): StorefrontProductDetail {
  return {
    productId: "prod-detail-1",
    slug: "cubierta-premium",
    name: "Cubierta Premium",
    description: "Cubierta radial de alto rendimiento.",
    brand: "Hankook",
    category: "neumaticos",
    images: ["https://cdn.example.com/cubierta-premium.webp"],
    price: {
      amount: 461374,
      currency: "ARS",
      compareAt: 500000,
    },
    availability: {
      available: true,
      label: "Stock disponible",
    },
    ...overrides,
  };
}
beforeEach(() => {
  vi.restoreAllMocks();
});

describe("presentation renderer logic", () => {
  it("renderiza secciones ordenadas por el campo order", () => {
    const sections: SectionInstance[] = [
      buildSection({ id: "sec-c", order: 2, enabled: true }),
      buildSection({ id: "sec-a", order: 0, enabled: true }),
      buildSection({ id: "sec-b", order: 1, enabled: true }),
    ];

    const result = getEnabledSortedSections(sections);
    expect(result.map((s) => s.id)).toEqual(["sec-a", "sec-b", "sec-c"]);
  });

  it("respeta enabled: omite secciones deshabilitadas", () => {
    const sections: SectionInstance[] = [
      buildSection({ id: "sec-visible", order: 0, enabled: true }),
      buildSection({ id: "sec-hidden", order: 1, enabled: false }),
      buildSection({ id: "sec-also-visible", order: 2, enabled: true }),
    ];

    const result = getEnabledSortedSections(sections);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id)).toEqual(["sec-visible", "sec-also-visible"]);
  });

  it("fallback a legacy cuando no hay presentation o las secciones están vacías", () => {
    expect(shouldUsePresentation(undefined, "home")).toBe(false);
    expect(shouldUsePresentation(buildPresentation(), "home")).toBe(false);
    expect(shouldUsePresentation(buildPresentation(), "catalog")).toBe(false);
    expect(shouldUsePresentation(buildPresentation(), "product")).toBe(false);
  });

  it("usa presentation cuando la página tiene al menos una sección", () => {
    const presentation = buildPresentation({
      pages: {
        home: { sections: [buildSection()] },
        catalog: { sections: [] },
        product: { sections: [] },
      },
    });

    expect(shouldUsePresentation(presentation, "home")).toBe(true);
    expect(shouldUsePresentation(presentation, "catalog")).toBe(false);
    expect(shouldUsePresentation(presentation, "product")).toBe(false);
  });

  it("mantiene el announcement bar antes del header en presentation mode", () => {
    const presentation = buildPresentation({
      globals: {
        announcementBar: buildSection({
          type: "announcementBar",
          variant: "static",
          enabled: true,
          content: { message: "Promo principal" },
        }),
        header: buildSection({ type: "header", variant: "minimal", enabled: true }),
        footer: buildSection({ type: "footer", variant: "minimal", enabled: true }),
      },
      pages: {
        home: {
          sections: [buildSection({ id: "hero-1", type: "hero", variant: "split", order: 0 })],
        },
        catalog: { sections: [] },
        product: { sections: [] },
      },
    });

    const html = renderToStaticMarkup(
      createElement(PresentationRenderer, { presentation, page: "home" }),
    );

    expect(html.indexOf('data-template="announcement-bar-static"')).toBeGreaterThan(-1);
    expect(html.indexOf('data-template="header-minimal"')).toBeGreaterThan(-1);
    expect(html.indexOf('data-template="announcement-bar-static"')).toBeLessThan(
      html.indexOf('data-template="header-minimal"'),
    );
  });

  it("renderiza el template rotating cuando la global usa esa variante", () => {
    const presentation = buildPresentation({
      globals: {
        announcementBar: buildSection({
          type: "announcementBar",
          variant: "rotating",
          enabled: true,
          content: { messages: ["Promo 1", "Promo 2"] },
        }),
        header: buildSection({ type: "header", variant: "minimal", enabled: true }),
        footer: buildSection({ type: "footer", variant: "minimal", enabled: true }),
      },
    });

    const html = renderToStaticMarkup(
      createElement(PresentationRenderer, { presentation, page: "home" }),
    );

    expect(html).toContain('data-template="announcement-bar-rotating"');
  });

  it("renderiza el hero button-overlay con un único CTA superpuesto", () => {
    const presentation = buildPresentation({
      pages: {
        home: {
          sections: [
            buildSection({
              id: "hero-overlay-1",
              type: "hero",
              variant: "button-overlay",
              content: {
                imageUrl: "https://cdn.example.com/hero-campaign.webp",
                imageAlt: "Portada de campaña",
                buttonPosition: "right",
                primaryCta: { label: "Ver más", href: "/catalogo", variant: "primary" },
              },
            }),
          ],
        },
        catalog: { sections: [] },
        product: { sections: [] },
      },
    });

    const html = renderToStaticMarkup(
      createElement(PresentationRenderer, { presentation, page: "home" }),
    );

    expect(html).toContain('data-template="hero-button-overlay"');
    expect(html).toContain("Ver más");
    expect(html).toContain("/catalogo");
  });

  it("expone globals como secciones seleccionables para la preview del editor", () => {
    const presentation = buildPresentation({
      globals: {
        announcementBar: buildSection({
          id: "ann-global-1",
          type: "announcementBar",
          variant: "scroll",
          enabled: true,
          content: { messages: ["Uno", "Dos"] },
        }),
        header: buildSection({ id: "hdr-global-1", type: "header", variant: "minimal", enabled: true }),
        footer: buildSection({ id: "ftr-global-1", type: "footer", variant: "minimal", enabled: true }),
      },
      pages: {
        home: {
          sections: [buildSection({ id: "hero-1", type: "hero", variant: "split", order: 0 })],
        },
        catalog: { sections: [] },
        product: { sections: [] },
      },
    });

    const html = renderToStaticMarkup(
      createElement(PresentationRenderer, { presentation, page: "home" }),
    );

    expect(html).toContain('data-section-id="ann-global-1"');
    expect(html).toContain('data-section-scope="global"');
    expect(html).toContain('data-section-id="hdr-global-1"');
    expect(html).toContain('data-section-id="ftr-global-1"');
  });

  it("mantiene el renderer acotado en grid y resalta la selección sin outline externo", () => {
    const globalsCss = readFileSync(`${process.cwd()}/app/globals.css`, "utf8");

    expect(globalsCss).toContain(".presentation-renderer {");
    expect(globalsCss).toContain(".presentation-renderer-content {");
    expect(globalsCss).toContain(".presentation-shell-content > [data-presentation-renderer=\"true\"] {");
    expect(globalsCss).toContain("min-width: 0;");
    expect(globalsCss).toContain("box-shadow: inset 0 0 0 2px var(--module-accent);");
    expect(globalsCss).not.toContain("outline-offset: 6px;");
  });

  it("normaliza announcementBar a static cuando llega una variante desconocida", () => {
    const module = adaptSectionToModule(
      buildSection({
        type: "announcementBar",
        variant: "legacy-unknown",
        content: {
          message: "Fallback seguro",
          appearance: {
            backgroundColor: "#111827",
            textColor: "#f8fafc",
          },
        },
      }),
    ) as {
      variant: string;
      message: string;
      appearance?: { backgroundColor?: string; textColor?: string };
    };

    expect(module.variant).toBe("static");
    expect(module.message).toBe("Fallback seguro");
    expect(module.appearance).toEqual({
      backgroundColor: "#111827",
      textColor: "#f8fafc",
      surface: undefined,
      accentColor: undefined,
      borderColor: undefined,
      gradientFrom: undefined,
      gradientVia: undefined,
      gradientTo: undefined,
    });
  });

  it("adapta catalogLayout normalizando filtros, sort y cardVariant", () => {
    const module = adaptSectionToModule(
      buildSection({
        type: "catalogLayout",
        variant: "filters-sidebar",
        content: {
          cardVariant: "no-existe",
          filters: { brand: true, rating: "si" },
          sort: { options: ["popular"], default: "priceAsc" },
          perPage: 24,
        },
      }),
    ) as {
      content: {
        cardVariant: string;
        filters?: Record<string, boolean | undefined>;
        sort?: { options: string[]; default: string };
        perPage?: number;
      };
    };

    expect(module.content.cardVariant).toBe("classic");
    expect(module.content.filters).toEqual({ brand: true });
    expect(module.content.sort).toEqual({ options: ["popular"], default: "popular" });
    expect(module.content.perPage).toBe(24);
  });

  it("adapta socialProof con empresaId y tenantSlug del bootstrap", () => {
    const bootstrap = {
      tenant: {
        empresaId: "empresa-social-proof",
        tenantSlug: "bym-social-proof",
      },
    } as StorefrontBootstrap;

    const module = adaptSectionToModule(
      buildSection({
        id: "social-proof-1",
        type: "socialProof",
        variant: "mini",
        content: { title: "Confianza real", subtitle: "Google Reviews" },
      }),
      { bootstrap },
    ) as {
      content: { title?: string; subtitle?: string };
      empresaId?: string;
      tenantSlug?: string;
    };

    expect(module.content).toEqual({
      title: "Confianza real",
      subtitle: "Google Reviews",
    });
    expect(module.empresaId).toBe(bootstrap.tenant.empresaId);
    expect(module.tenantSlug).toBe(bootstrap.tenant.tenantSlug);
  });

  it("normaliza socialProof usando aliases de encabezado cuando el contenido llega legacy", () => {
    const module = adaptSectionToModule(
      buildSection({
        id: "social-proof-legacy",
        type: "socialProof",
        variant: "carousel",
        content: {
          heading: "Clientes reales",
          description: "Opiniones verificadas desde Google.",
        },
      }),
    ) as {
      content: { title?: string; subtitle?: string };
    };

    expect(module.content).toEqual({
      title: "Clientes reales",
      subtitle: "Opiniones verificadas desde Google.",
    });
  });

  it("adapta productGrid con defaults seguros para source y cardVariant", () => {
    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-3",
        content: {
          source: { type: "category" },
          cardVariant: "no-existe",
        },
      }),
    ) as {
      content: {
        source: { type: string };
        cardVariant: string;
      };
    };

    expect(module.content.source).toEqual({ type: "featured" });
    expect(module.content.cardVariant).toBe("classic");
  });

  it("inyecta productos reales del contexto en productGrid sin recurrir a mocks", () => {
    const products = [
      {
        productId: "prod-real-1",
        slug: "producto-real",
        name: "Producto Real",
        brand: "Marca",
        imageUrl: "https://cdn.example.com/producto-real.webp",
        price: { amount: 15000, currency: "ARS", compareAt: 18000 },
        availability: { available: true, label: "Disponible" },
        isFeatured: true,
      },
    ] as unknown as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-4",
        content: {
          source: { type: "featured" },
          cardVariant: "premium-commerce",
          limit: 4,
        },
      }),
      { products },
    ) as {
      products: Array<{
        id: string;
        name: string;
        href: string;
        price: { formatted: string };
      }>;
    };

    expect(module.products).toHaveLength(1);
    expect(module.products[0]).toMatchObject({
      id: "prod-real-1",
      name: "Producto Real",
      href: "/producto/producto-real",
    });
    expect(module.products[0]?.price.formatted).toContain("$");
  });

  it("renderiza spotlight-carousel con spotlight-commerce usando datos comerciales reales", () => {
    const presentation = buildPresentation({
      pages: {
        home: {
          sections: [
            buildSection({
              id: "home-spotlight",
              type: "productGrid",
              variant: "spotlight-carousel",
              order: 0,
              content: {
                title: "Lo mejor del mes",
                subtitle: "Selección comercial destacada",
                source: { type: "featured" },
                cardVariant: "spotlight-commerce",
                cardDisplayOptions: {
                  showBrand: true,
                  showBadges: true,
                  showInstallments: true,
                  showCashDiscount: true,
                  showStockBadge: true,
                  showAddToCart: true,
                },
              },
            }),
          ],
        },
        catalog: { sections: [] },
        product: { sections: [] },
      },
    });
    const products = [
      {
        _id: "mongo-prod-spotlight-1",
        ecommerceSlug: "producto-spotlight",
        name: "Producto Spotlight",
        brand: "BYM",
        priceWithTax: 125000,
        discountedPrice: 99999,
        bestDiscount: { percentage: 20, label: "20% OFF contado" },
        stock: 4,
        installments: { enabled: true, count: 6, amount: 16666, interestFree: true },
        images: [{ url: "https://cdn.example.com/spotlight.webp", alt: "Spotlight" }],
        isFeatured: true,
        isOnSale: true,
      },
      {
        _id: "mongo-prod-spotlight-2",
        ecommerceSlug: "producto-spotlight-2",
        name: "Producto Spotlight 2",
        brand: "BYM",
        priceWithTax: 99000,
        stock: 2,
        images: [{ url: "https://cdn.example.com/spotlight-2.webp", alt: "Spotlight 2" }],
        isFeatured: true,
      },
    ] as unknown as StorefrontCatalogProduct[];

    const html = renderToStaticMarkup(
      createElement(PresentationRenderer, {
        presentation,
        page: "home",
        context: { products },
      }),
    );

    expect(html).toContain('data-template="product-grid-spotlight-carousel"');
    expect(html).toContain('data-template="product-card-spotlight-commerce"');
    expect(html).toContain("20% OFF contado");
    expect(html).toContain("6x");
    expect(html).toContain("Producto Spotlight");
  });

  it("normaliza producto enriquecido real sin perder campos comerciales existentes", () => {
    const products = [
      {
        _id: "mongo-prod-1",
        ecommerceSlug: "cubierta-premium",
        sku: "SKU-1",
        name: "Cubierta Premium",
        brand: "Hankook",
        priceWithTax: 461374,
        discountedPrice: 369099,
        bestDiscount: { percentage: 20, label: "20% OFF contado" },
        stock: 7,
        dispatchType: "IMMEDIATE",
        freeShipping: true,
        category: { name: "Neumáticos", slug: "neumaticos" },
        installments: { enabled: true, count: 6, amount: 76896, interestFree: true },
        images: [{ url: "https://cdn.example.com/cubierta.webp", alt: "Cubierta" }],
        isFeatured: true,
        isOnSale: true,
      },
    ] as unknown as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-4",
        content: {
          source: { type: "featured" },
          cardVariant: "premium-commerce",
        },
      }),
      { products },
    ) as {
      products: Array<{
        id: string;
        slug: string;
        href: string;
        imageUrl?: string;
        basePrice?: { amount: number };
        price: { amount: number };
        installments?: { count: number; formatted: string; interestFree: boolean };
        cashDiscount?: { percent: number; formatted: string };
        badges?: Array<{ label: string }>;
        stock?: { available: boolean; label?: string };
      }>;
    };

    expect(module.products).toHaveLength(1);
    expect(module.products[0]).toMatchObject({
      id: "mongo-prod-1",
      slug: "cubierta-premium",
      href: "/producto/cubierta-premium",
      imageUrl: "https://cdn.example.com/cubierta.webp",
      basePrice: { amount: 461374 },
      price: { amount: 369099 },
      compareAtPrice: { amount: 461374 },
      installments: { count: 6, interestFree: true },
      cashDiscount: { percent: 20, formatted: "20% OFF contado" },
      stock: { available: true, label: "Stock disponible" },
    });
    expect(module.products[0]?.badges?.map((badge) => badge.label)).toContain("Envío gratis");
    expect(module.products[0]?.badges?.map((badge) => badge.label)).toContain("Despacho inmediato");
  });

  it("prioriza ecommerceSlug y priceWithTax cuando conviven con campos legacy", () => {
    const products = [
      {
        productId: "prod-conflictivo",
        slug: "slug-legacy-no-publico",
        ecommerceSlug: "slug-publico-ecommerce",
        name: "Producto con slug público",
        price: { amount: 100, currency: "ARS" },
        priceWithTax: 150,
        isFeatured: true,
      },
    ] as unknown as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-4",
        content: {
          source: { type: "featured" },
          cardVariant: "premium-commerce",
        },
      }),
      { products },
    ) as {
      products: Array<{
        slug: string;
        href: string;
        price: { amount: number };
      }>;
    };

    expect(module.products[0]).toMatchObject({
      slug: "slug-publico-ecommerce",
      href: "/producto/slug-publico-ecommerce",
      price: { amount: 150 },
    });
  });

  it("catalogLayout muestra productos reales aunque no estén marcados como featured", () => {
    const products = [
      {
        _id: "mongo-prod-catalog",
        ecommerceSlug: "catalogo-real",
        name: "Producto de catálogo real",
        brandId: {
          name: "BYM",
          slug: "bym",
          logo: { url: "https://cdn.example.com/brands/bym.webp" },
        },
        priceWithTax: 123456,
        stock: 3,
        images: [{ url: "https://cdn.example.com/catalogo-real.webp" }],
      },
    ] as unknown as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "catalogLayout",
        variant: "filters-sidebar",
        content: {
          cardVariant: "premium-commerce",
          perPage: 12,
        },
      }),
      { products },
    ) as {
      products: Array<{
        id: string;
        brandLogoUrl?: string;
        href: string;
        imageUrl?: string;
        price: { amount: number; formatted: string };
        stock?: { available: boolean; label?: string };
      }>;
    };

    expect(module.products).toHaveLength(1);
    expect(module.products[0]).toMatchObject({
      id: "mongo-prod-catalog",
      brandLogoUrl: "https://cdn.example.com/brands/bym.webp",
      href: "/producto/catalogo-real",
      imageUrl: "https://cdn.example.com/catalogo-real.webp",
      price: { amount: 123456 },
      stock: { available: true, label: "Stock disponible" },
    });
  });

  it("usa cuotas del bootstrap cuando el producto público no trae installments enriquecidos", () => {
    const products = [
      {
        productId: "prod-bootstrap-1",
        ecommerceSlug: "cubierta-bootstrap",
        name: "Cubierta Bootstrap",
        priceWithTax: 240000,
        category: { name: "Neumáticos", slug: "neumaticos" },
      },
    ] as unknown as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "catalogLayout",
        variant: "filters-sidebar",
        content: {
          cardVariant: "premium-commerce",
          perPage: 12,
        },
      }),
      {
        products,
        bootstrap: {
          commerce: {
            payment: {
              visibleMethods: ["mercadopago"],
              installments: { enabled: true, count: 6, label: "Hasta 6 cuotas sin interés" },
            },
          },
        } as StorefrontBootstrap,
      },
    ) as {
      products: Array<{
        installments?: { count: number; amount: number; interestFree: boolean };
      }>;
    };

    expect(module.products[0]?.installments).toMatchObject({
      count: 6,
      amount: 40000,
      interestFree: true,
    });
  });

  it("muestra envío gratis cuando el producto supera el umbral global del shop", () => {
    const products = [
      {
        productId: "prod-envio-threshold",
        ecommerceSlug: "cubierta-envio-threshold",
        name: "Cubierta Envío Threshold",
        priceWithTax: 240000,
      },
    ] as unknown as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "catalogLayout",
        variant: "filters-sidebar",
        content: {
          cardVariant: "premium-commerce",
          perPage: 12,
        },
      }),
      {
        products,
        bootstrap: {
          commerce: {
            payment: {
              visibleMethods: [],
            },
            shipping: {
              freeShippingThreshold: 200000,
            },
          },
        } as unknown as StorefrontBootstrap,
      },
    ) as {
      products: Array<{
        badges?: Array<{ label: string }>;
      }>;
    };

    expect(module.products[0]?.badges?.map((badge) => badge.label)).toContain("Envío gratis");
  });

  it("filtra productos sin slug estable para evitar /producto/undefined", () => {
    const products = [
      {
        productId: "prod-sin-slug",
        name: "Producto sin slug",
        price: { amount: 1000, currency: "ARS" },
      },
    ] as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-4",
        content: { source: { type: "featured" }, cardVariant: "classic" },
      }),
      { products },
    ) as { products: unknown[] };

    expect(module.products).toEqual([]);
  });

  it("ignora logoUrl/logoHref legacy y usa branding del bootstrap para header", () => {
    const bootstrap = {
      tenant: { tenantSlug: "tenant-demo", status: "active" },
      branding: {
        storeName: "Tienda Demo",
        logoUrl: "https://cdn.example.com/logo-bootstrap.svg",
      },
      navigation: { headerLinks: [{ label: "Catálogo", href: "/catalogo" }], footerColumns: [] },
    } as unknown as StorefrontBootstrap;

    const module = adaptSectionToModule(
      buildSection({
        type: "header",
        variant: "left-logo-search",
        content: {
          logoUrl: "https://legacy.example.com/logo-viejo.svg",
          logoHref: "https://legacy.example.com",
          logoAlt: "Alt editable",
        },
      }),
      { bootstrap },
    ) as { logoUrl?: string; logoHref?: string; logoAlt?: string };

    expect(module.logoUrl).toBe("https://cdn.example.com/logo-bootstrap.svg");
    expect(module.logoHref).toBe("/");
    expect(module.logoAlt).toBe("Alt editable");
  });

  it("expone metadata saneada de logo sin dejar de usar logoUrl público en header", () => {
    const bootstrap = {
      tenant: { tenantSlug: "tenant-demo", status: "active" },
      branding: {
        storeName: "Tienda Demo",
        logoUrl: "https://cdn.example.com/logo-bootstrap.svg",
        logo: {
          url: "https://cdn.example.com/logo-bootstrap.svg",
          alt: "Logo demo",
          width: 320,
          height: 120,
          mimeType: "image/svg+xml",
          assetId: "interno-que-no-debe-salir",
        },
      },
      navigation: { headerLinks: [], footerColumns: [] },
    } as unknown as StorefrontBootstrap;

    const module = adaptSectionToModule(
      buildSection({
        type: "header",
        variant: "left-logo-search",
        content: {},
      }),
      { bootstrap },
    ) as {
      logoUrl?: string;
      logoMetadata?: {
        url?: string;
        alt?: string;
        width?: number;
        height?: number;
        mimeType?: string;
      };
    };

    expect(module.logoUrl).toBe("https://cdn.example.com/logo-bootstrap.svg");
    expect(module.logoMetadata).toEqual({
      url: "https://cdn.example.com/logo-bootstrap.svg",
      alt: "Logo demo",
      width: 320,
      height: 120,
      mimeType: "image/svg+xml",
    });
  });

  it("apaga showAccount en storefront aunque llegue activado desde contenido legacy", () => {
    const module = adaptSectionToModule(
      buildSection({
        type: "header",
        variant: "left-logo-search",
        content: {
          showAccount: true,
        },
      }),
      {},
    ) as { showAccount?: boolean };

    expect(module.showAccount).toBe(false);
  });

  it("ignora logoUrl legacy y usa branding del bootstrap para footer", () => {
    const bootstrap = {
      tenant: { tenantSlug: "tenant-demo", status: "active" },
      branding: {
        storeName: "Tienda Demo",
        logoUrl: "https://cdn.example.com/logo-bootstrap.svg",
      },
      navigation: { headerLinks: [], footerColumns: [] },
    } as unknown as StorefrontBootstrap;

    const module = adaptSectionToModule(
      buildSection({
        type: "footer",
        variant: "minimal",
        content: {
          logoUrl: "https://legacy.example.com/logo-viejo.svg",
        },
      }),
      { bootstrap },
    ) as { content: { logoUrl?: string } };

    expect(module.content.logoUrl).toBe("https://cdn.example.com/logo-bootstrap.svg");
  });

  it("mantiene imageUrl público del hero y expone metadata aditiva saneada aparte", () => {
    const module = adaptSectionToModule(
      buildSection({
        type: "hero",
        variant: "commerce",
        content: {
          imageUrl: "https://cdn.example.com/hero-publica.webp",
          imageAlt: "Hero pública",
          image: {
            url: "https://cdn.example.com/hero-publica.webp",
            alt: "Metadata pública",
            width: 1600,
            height: 900,
            mimeType: "image/webp",
            assetId: "asset-interno",
          },
          title: "Portada comercial",
        },
      }),
    ) as {
      imageUrl?: string;
      image?: { src: string; alt: string };
      imageMetadata?: {
        url?: string;
        alt?: string;
        width?: number;
        height?: number;
        mimeType?: string;
      };
    };

    expect(module.imageUrl).toBe("https://cdn.example.com/hero-publica.webp");
    expect(module.image).toEqual({
      src: "https://cdn.example.com/hero-publica.webp",
      alt: "Hero pública",
    });
    expect(module.imageMetadata).toEqual({
      url: "https://cdn.example.com/hero-publica.webp",
      alt: "Metadata pública",
      width: 1600,
      height: 900,
      mimeType: "image/webp",
    });
  });

  it("degrada productGrid a lista vacía profesional cuando no hay productos del backend", () => {
    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-4",
        content: {
          source: { type: "featured" },
          cardVariant: "classic",
        },
      }),
      { products: [] },
    ) as { products: unknown[] };

    expect(module.products).toEqual([]);
  });

  it("featured sin flag explícito devuelve vacío", () => {
    const products: StorefrontCatalogProduct[] = [
      {
        productId: "prod-sin-flag",
        slug: "producto-sin-flag",
        name: "Producto sin flag",
        price: { amount: 1000, currency: "ARS" },
      },
    ];

    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-4",
        content: { source: { type: "featured" }, cardVariant: "classic" },
      }),
      { products },
    ) as { products: unknown[] };

    expect(module.products).toEqual([]);
  });

  it("featured con flag explícito devuelve el producto", () => {
    const products = [
      {
        productId: "prod-destacado",
        slug: "producto-destacado",
        name: "Producto Destacado",
        price: { amount: 1000, currency: "ARS" },
        featured: true,
      },
    ] as unknown as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-4",
        content: { source: { type: "featured" }, cardVariant: "classic" },
      }),
      { products },
    ) as { products: Array<{ id: string; slug: string }> };

    expect(module.products).toHaveLength(1);
    expect(module.products[0]).toMatchObject({ id: "prod-destacado", slug: "producto-destacado" });
  });

  it("newest sin fecha explícita devuelve vacío", () => {
    const products: StorefrontCatalogProduct[] = [
      {
        productId: "prod-sin-fecha",
        slug: "producto-sin-fecha",
        name: "Producto sin fecha",
        price: { amount: 1000, currency: "ARS" },
      },
    ];

    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-4",
        content: { source: { type: "newest" }, cardVariant: "classic" },
      }),
      { products },
    ) as { products: unknown[] };

    expect(module.products).toEqual([]);
  });

  it("category matchea por category.slug cuando la categoría trae name y slug", () => {
    const products = [
      {
        productId: "prod-neumatico",
        slug: "cubierta-premium",
        name: "Cubierta Premium",
        category: { name: "Cubiertas", slug: "neumaticos" },
        price: { amount: 1000, currency: "ARS" },
      },
    ] as unknown as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "productGrid",
        variant: "grid-4",
        content: {
          source: { type: "category", categorySlug: "neumaticos" },
          cardVariant: "classic",
        },
      }),
      { products },
    ) as { products: Array<{ id: string; slug: string }> };

    expect(module.products).toHaveLength(1);
    expect(module.products[0]).toMatchObject({ id: "prod-neumatico", slug: "cubierta-premium" });
  });

  it("categoryTile prioriza la ruta pública por slug cuando existe", () => {
    const module = adaptSectionToModule(
      buildSection({
        type: "categoryTile",
        variant: "grid-cards",
        content: {},
      }),
      {
        categories: [
          {
            categoryId: "cat-123",
            slug: "neumaticos",
            name: "Neumáticos",
          },
        ],
      },
    ) as { tiles: Array<{ href: string; label: string }> };

    expect(module.tiles).toEqual([
      {
        href: "/catalogo/neumaticos",
        label: "Neumáticos",
      },
    ]);
  });

  it("adapta productDetail con producto actual y relacionados del contexto runtime", () => {
    const product = buildProductDetail();
    const relatedProducts = [
      {
        productId: "prod-rel-1",
        slug: "cubierta-related",
        name: "Cubierta Related",
        category: { slug: "neumaticos", name: "Neumáticos" },
        price: { amount: 390000, currency: "ARS" },
        availability: { available: true, label: "Disponible" },
        imageUrl: "https://cdn.example.com/cubierta-related.webp",
        featured: true,
      },
    ] as unknown as StorefrontCatalogProduct[];

    const module = adaptSectionToModule(
      buildSection({
        type: "productDetail",
        variant: "gallery-specs",
        content: {
          showRelated: true,
          relatedSource: "category",
          relatedLimit: 4,
        },
      }),
      { product, products: relatedProducts },
    ) as {
      product?: {
        id: string;
        slug: string;
        name: string;
        href: string;
        price: { amount: number; formatted: string };
        images: Array<{ url: string }>;
      };
      relatedProducts?: Array<{ id: string; slug: string }>;
    };

    expect(module.product).toMatchObject({
      id: "prod-detail-1",
      slug: "cubierta-premium",
      name: "Cubierta Premium",
      href: "/producto/cubierta-premium",
      price: { amount: 461374 },
      images: [{ url: "https://cdn.example.com/cubierta-premium.webp" }],
    });
    expect(module.product?.price.formatted).toContain("$");
    expect(module.relatedProducts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "prod-rel-1",
          slug: "cubierta-related",
        }),
      ]),
    );
  });

  it("normaliza el detalle enriquecido real sin perder imágenes, señales comerciales ni specs", () => {
    const module = adaptSectionToModule(
      buildSection({
        type: "productDetail",
        variant: "gallery-specs",
        content: {
          showRelated: true,
          relatedSource: "category",
          relatedLimit: 4,
        },
      }),
      {
        product: buildProductDetail({
          slug: "slug-legacy-interno",
          ecommerceSlug: "cubierta-premium-publica",
          images: [
            { url: "https://cdn.example.com/cubierta-premium-1.webp", alt: "Vista principal" },
            { src: "https://cdn.example.com/cubierta-premium-2.webp", alt: "Vista lateral" },
          ],
          discountedPrice: 369099,
          bestDiscount: { percentage: 20, label: "20% OFF contado" },
          installments: { enabled: true, count: 6, amount: 76896, interestFree: true },
          freeShipping: true,
          dispatchType: "IMMEDIATE",
          dynamicAttributes: {
            season: "Verano",
            loadIndex: "91",
            weight: "5.04 kg",
            dimensions: "53.3 x 14.5 x 53.3 cm",
          },
          categoryId: {
            name: "Neumáticos",
            attributeDefinitions: [
              { fieldName: "season", displayLabel: "Temporada" },
              { fieldName: "loadIndex", displayLabel: "Índice de carga" },
              { fieldName: "weight", displayLabel: "Peso" },
              { fieldName: "dimensions", displayLabel: "Dimensiones" },
            ],
          },
          brandId: {
            name: "Hankook",
            logo: { url: "https://cdn.example.com/brands/hankook.svg" },
          },
        }),
      },
    ) as {
      product?: {
        slug: string;
        images: Array<{ url: string; alt?: string }>;
        basePrice?: { amount: number };
        price: { amount: number };
        compareAtPrice?: { amount: number };
        installments?: { count: number; interestFree: boolean };
        cashDiscount?: { percent: number; formatted: string };
        brandLogoUrl?: string;
        freeShipping?: boolean;
        dispatch?: { type: string; label: string };
        badges?: Array<{ label: string }>;
        specifications?: Array<{ label: string; value: string }>;
      };
    };

    expect(module.product).toMatchObject({
      slug: "cubierta-premium-publica",
      images: [
        { url: "https://cdn.example.com/cubierta-premium-1.webp", alt: "Vista principal" },
        { url: "https://cdn.example.com/cubierta-premium-2.webp", alt: "Vista lateral" },
      ],
      basePrice: { amount: 461374 },
      price: { amount: 369099 },
      compareAtPrice: { amount: 461374 },
      installments: { count: 6, interestFree: true },
      cashDiscount: { percent: 20, formatted: "20% OFF contado" },
      brandLogoUrl: "https://cdn.example.com/brands/hankook.svg",
      freeShipping: true,
      dispatch: { type: "IMMEDIATE", label: "Despacho inmediato" },
    });
    expect(module.product?.badges?.map((badge) => badge.label)).toEqual(
      expect.arrayContaining(["Envío gratis", "Despacho inmediato"]),
    );
    expect(module.product?.specifications).toEqual(
      expect.arrayContaining([
        { label: "Temporada", value: "Verano" },
        { label: "Índice de carga", value: "91" },
      ]),
    );
    expect(module.product?.specifications).not.toEqual(
      expect.arrayContaining([
        { label: "Peso", value: "5.04 kg" },
        { label: "Dimensiones", value: "53.3 x 14.5 x 53.3 cm" },
      ]),
    );
  });

  it("arma contexto real de producto para PresentationRenderer", () => {
    const product = buildProductDetail();
    const relatedProducts = [
      {
        productId: "prod-rel-1",
        slug: "cubierta-related",
        name: "Cubierta Related",
        category: { slug: "neumaticos", name: "Neumáticos" },
        price: { amount: 390000, currency: "ARS" },
        availability: { available: true, label: "Disponible" },
        imageUrl: "https://cdn.example.com/cubierta-related.webp",
        featured: true,
      },
    ] as unknown as StorefrontCatalogProduct[];
    const context = buildProductPresentationContext({
      bootstrap: { tenant: { status: "active" } } as StorefrontBootstrap,
      product,
      relatedProducts,
      runtime: {
        context: {
          host: "acme.example.com",
        },
      },
    });

    expect(context).toMatchObject({
      host: "acme.example.com",
      product,
      products: relatedProducts,
    });
  });

  it("usa equivalentes del detalle como fallback de relacionados en presentation mode", () => {
    const product = buildProductDetail({
      equivalents: [
        {
          _id: "prod-eq-1",
          slug: "cubierta-equivalente",
          name: "Cubierta Equivalente",
          image: "https://cdn.example.com/cubierta-equivalente.webp",
          brand: "Pirelli",
          priceWithTax: 398000,
        },
      ],
    });

    const context = buildProductPresentationContext({
      bootstrap: { tenant: { status: "active" } } as StorefrontBootstrap,
      product,
      runtime: {
        context: {
          host: "acme.example.com",
        },
      },
    });

    const module = adaptSectionToModule(
      buildSection({
        type: "productDetail",
        variant: "gallery-specs",
        content: {
          showRelated: true,
          relatedSource: "category",
          relatedLimit: 4,
        },
      }),
      context,
    ) as {
      relatedProducts?: Array<{ id: string; slug: string; imageUrl?: string }>;
    };

    expect(context.products).toEqual([
      expect.objectContaining({
        productId: "prod-eq-1",
        slug: "cubierta-equivalente",
      }),
    ]);
    expect(module.relatedProducts).toEqual([
      expect.objectContaining({
        id: "prod-eq-1",
        slug: "cubierta-equivalente",
        imageUrl: "https://cdn.example.com/cubierta-equivalente.webp",
      }),
    ]);
  });

  it("hidrata presentation del PDP con paymentMethods, reviews y tenant para social proof", () => {
    const presentation = buildPresentation({
      pages: {
        home: { sections: [] },
        catalog: { sections: [] },
        product: {
          sections: [
            buildSection({
              id: "product-detail-1",
              type: "productDetail",
              variant: "gallery-specs",
              content: {
                showRelated: true,
              },
            }),
          ],
        },
      },
    });

    const hydrated = hydrateProductPresentationWithRuntimeSignals(presentation, {
      bootstrap: {
        tenant: { empresaId: "empresa-123", status: "active", tenantSlug: "bym-srl" },
        commerce: {
          payment: { visibleMethods: [] },
          shipping: { message: "Envíos a todo el país" },
        },
        features: {
          reviewsEnabled: true,
          compareEnabled: false,
          wishlistEnabled: false,
          contactBarEnabled: false,
          searchEnabled: true,
        },
      } as unknown as StorefrontBootstrap,
      product: buildProductDetail(),
      paymentMethods: {
        paymentMethods: [
          {
            methodId: "pm-mp",
            methodType: "gateway",
            displayName: "Mercado Pago",
            description: "Cuotas",
            icon: null,
            color: null,
            discount: null,
          },
        ],
      },
      runtime: {
        context: {
          host: "acme.example.com",
        },
      },
    });

    expect(hydrated?.pages.product.sections[0]).toMatchObject({
      content: {
        showRelated: true,
        reviewsEnabled: true,
        reviewsEmpresaId: "empresa-123",
        reviewsTenantSlug: "bym-srl",
        paymentMethods: [
          expect.objectContaining({
            methodId: "pm-mp",
            displayName: "Mercado Pago",
          }),
        ],
      },
    });
  });
});
