import { describe, expect, it, vi } from "vitest";

/**
 * Los componentes React viven en archivos .tsx con JSX. El entorno de test
 * corre en Node sin plugin de JSX, por lo que mockeamos los módulos de los
 * componentes para poder testear el registry sin parsear JSX.
 */
vi.mock("@/components/templates/product-grid/product-grid-grid-3", () => ({
  ProductGridGrid3: function ProductGridGrid3() {
    return null;
  },
}));
vi.mock("@/components/templates/product-grid/product-grid-grid-4", () => ({
  ProductGridGrid4: function ProductGridGrid4() {
    return null;
  },
}));
vi.mock("@/components/templates/product-grid/product-grid-carousel-arrows", () => ({
  ProductGridCarouselArrows: function ProductGridCarouselArrows() {
    return null;
  },
}));
vi.mock("@/components/templates/product-grid/product-grid-masonry", () => ({
  ProductGridMasonry: function ProductGridMasonry() {
    return null;
  },
}));

import {
  DEFAULT_PRODUCT_GRID_TEMPLATE_ID,
  PRODUCT_GRID_TEMPLATE_DESCRIPTORS,
  PRODUCT_GRID_TEMPLATE_IDS,
  isProductGridTemplateId,
  resolveProductGridTemplateId,
} from "@/lib/templates/product-grid-catalog";

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

describe("Product grid template catalog", () => {
  it("expone las 4 variantes declaradas en el catálogo", () => {
    expect(PRODUCT_GRID_TEMPLATE_IDS).toEqual([
      "grid-3",
      "grid-4",
      "carousel-arrows",
      "masonry",
    ]);
  });

  it("describe cada template con label, descripción, bestFor, thumbnailUrl y contentSchema", () => {
    for (const id of PRODUCT_GRID_TEMPLATE_IDS) {
      const descriptor = PRODUCT_GRID_TEMPLATE_DESCRIPTORS[id];
      expect(descriptor, `descriptor[${id}] debe existir`).toBeDefined();
      expect(descriptor.label.length).toBeGreaterThan(0);
      expect(descriptor.description.length).toBeGreaterThan(0);
      expect(descriptor.bestFor.length).toBeGreaterThan(0);
      expect(descriptor.thumbnailUrl).toMatch(/^\/template-thumbnails\/product-grid-/);
      expect(descriptor.contentSchema).toBeDefined();
    }
  });

  it("el thumbnailUrl de cada variante apunta a su svg correspondiente", () => {
    expect(PRODUCT_GRID_TEMPLATE_DESCRIPTORS["grid-3"].thumbnailUrl).toBe(
      "/template-thumbnails/product-grid-grid-3.svg"
    );
    expect(PRODUCT_GRID_TEMPLATE_DESCRIPTORS["grid-4"].thumbnailUrl).toBe(
      "/template-thumbnails/product-grid-grid-4.svg"
    );
    expect(PRODUCT_GRID_TEMPLATE_DESCRIPTORS["carousel-arrows"].thumbnailUrl).toBe(
      "/template-thumbnails/product-grid-carousel-arrows.svg"
    );
    expect(PRODUCT_GRID_TEMPLATE_DESCRIPTORS["masonry"].thumbnailUrl).toBe(
      "/template-thumbnails/product-grid-masonry.svg"
    );
  });
});

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

describe("isProductGridTemplateId", () => {
  it("devuelve true para cada id válido", () => {
    for (const id of PRODUCT_GRID_TEMPLATE_IDS) {
      expect(isProductGridTemplateId(id)).toBe(true);
    }
  });

  it("devuelve false para inputs inválidos", () => {
    expect(isProductGridTemplateId("no-existe")).toBe(false);
    expect(isProductGridTemplateId("")).toBe(false);
    expect(isProductGridTemplateId(undefined)).toBe(false);
    expect(isProductGridTemplateId(null)).toBe(false);
    expect(isProductGridTemplateId(42)).toBe(false);
    expect(isProductGridTemplateId({})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Resolver — degrada al default
// ---------------------------------------------------------------------------

describe("resolveProductGridTemplateId", () => {
  it("resuelve ids válidos como identidad", () => {
    for (const id of PRODUCT_GRID_TEMPLATE_IDS) {
      expect(resolveProductGridTemplateId(id)).toBe(id);
    }
  });

  it("degrada al default cuando el input no matchea", () => {
    expect(resolveProductGridTemplateId("no-existe")).toBe(DEFAULT_PRODUCT_GRID_TEMPLATE_ID);
    expect(resolveProductGridTemplateId(undefined)).toBe(DEFAULT_PRODUCT_GRID_TEMPLATE_ID);
    expect(resolveProductGridTemplateId(null)).toBe(DEFAULT_PRODUCT_GRID_TEMPLATE_ID);
    expect(resolveProductGridTemplateId(42)).toBe(DEFAULT_PRODUCT_GRID_TEMPLATE_ID);
    expect(resolveProductGridTemplateId("")).toBe(DEFAULT_PRODUCT_GRID_TEMPLATE_ID);
  });

  it("el default es 'grid-3'", () => {
    expect(DEFAULT_PRODUCT_GRID_TEMPLATE_ID).toBe("grid-3");
  });
});

// ---------------------------------------------------------------------------
// Content schema
// ---------------------------------------------------------------------------

describe("ProductGridContentSchema", () => {
  it("valida contenido mínimo con source featured", () => {
    const schema = PRODUCT_GRID_TEMPLATE_DESCRIPTORS["grid-3"].contentSchema;
    const result = schema.safeParse({
      source: { type: "featured" },
      cardVariant: "classic",
    });
    expect(result.success).toBe(true);
  });

  it("valida contenido completo", () => {
    const schema = PRODUCT_GRID_TEMPLATE_DESCRIPTORS["grid-3"].contentSchema;
    const result = schema.safeParse({
      title: "Destacados",
      subtitle: "Lo mejor de la semana",
      source: { type: "collection", collectionId: "summer-2026" },
      limit: 8,
      cardVariant: "premium-commerce",
      cardDisplayOptions: {
        showBrand: true,
        showBadges: true,
        showInstallments: false,
        showCashDiscount: true,
        showAddToCart: true,
      },
      showViewAllLink: true,
      viewAllHref: "/catalog",
      viewAllLabel: "Ver todo",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza source sin tipo", () => {
    const schema = PRODUCT_GRID_TEMPLATE_DESCRIPTORS["grid-3"].contentSchema;
    const result = schema.safeParse({
      source: { collectionId: "missing-type" },
      cardVariant: "classic",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cardVariant inválido", () => {
    const schema = PRODUCT_GRID_TEMPLATE_DESCRIPTORS["grid-3"].contentSchema;
    const result = schema.safeParse({
      source: { type: "featured" },
      cardVariant: "no-existe",
    });
    expect(result.success).toBe(false);
  });
});
