import { describe, expect, it } from "vitest";

import {
  getEnabledSortedSections,
  shouldUsePresentation,
} from "@/lib/presentation/render-utils";
import { adaptSectionToModule } from "@/components/presentation/section-adapter";
import type { Presentation, SectionInstance, SectionType } from "@/lib/types/presentation";
import type { StorefrontBootstrap, StorefrontCatalogProduct } from "@/lib/storefront-api";

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
    const products: StorefrontCatalogProduct[] = [
      {
        productId: "prod-real-1",
        slug: "producto-real",
        name: "Producto Real",
        brand: "Marca",
        imageUrl: "https://cdn.example.com/producto-real.webp",
        price: { amount: 15000, currency: "ARS", compareAt: 18000 },
        availability: { available: true, label: "Disponible" },
      },
    ];

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
      price: { amount: 461374 },
      installments: { count: 6, interestFree: true },
      cashDiscount: { percent: 20, formatted: "20% OFF contado" },
      stock: { available: true, label: "Stock disponible" },
    });
    expect(module.products[0]?.badges?.map((badge) => badge.label)).toContain("Despacho inmediato");
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
});
