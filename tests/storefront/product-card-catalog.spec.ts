import { describe, expect, it, vi } from "vitest";

/**
 * Los componentes React viven en archivos .tsx con JSX. El entorno de test
 * corre en Node sin plugin de JSX, por lo que mockeamos los módulos de los
 * componentes para poder testear el registry sin parsear JSX.
 */
vi.mock("@/components/templates/product-card/product-card-classic", () => ({
  ProductCardClassic: function ProductCardClassic() {
    return null;
  },
}));
vi.mock("@/components/templates/product-card/product-card-compact", () => ({
  ProductCardCompact: function ProductCardCompact() {
    return null;
  },
}));
vi.mock("@/components/templates/product-card/product-card-editorial", () => ({
  ProductCardEditorial: function ProductCardEditorial() {
    return null;
  },
}));
vi.mock("@/components/templates/product-card/product-card-premium-commerce", () => ({
  ProductCardPremiumCommerce: function ProductCardPremiumCommerce() {
    return null;
  },
}));

import {
  DEFAULT_PRODUCT_CARD_TEMPLATE_ID,
  PRODUCT_CARD_TEMPLATE_DESCRIPTORS,
  PRODUCT_CARD_TEMPLATE_IDS,
  isProductCardTemplateId,
  resolveProductCardTemplateId,
} from "@/lib/templates/product-card-catalog";
import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

describe("Product card template catalog", () => {
  it("expone las 4 variantes declaradas en el catálogo", () => {
    expect(PRODUCT_CARD_TEMPLATE_IDS).toEqual([
      "classic",
      "compact",
      "editorial",
      "premium-commerce",
    ]);
  });

  it("describe cada template con label, descripción, bestFor y thumbnailUrl", () => {
    for (const id of PRODUCT_CARD_TEMPLATE_IDS) {
      const descriptor = PRODUCT_CARD_TEMPLATE_DESCRIPTORS[id];
      expect(descriptor, `descriptor[${id}] debe existir`).toBeDefined();
      expect(descriptor.label.length).toBeGreaterThan(0);
      expect(descriptor.description.length).toBeGreaterThan(0);
      expect(descriptor.bestFor.length).toBeGreaterThan(0);
      expect(descriptor.thumbnailUrl).toMatch(/^\/template-thumbnails\/product-card-/);
    }
  });

  it("el thumbnailUrl de cada variante apunta a su svg correspondiente", () => {
    expect(PRODUCT_CARD_TEMPLATE_DESCRIPTORS["classic"].thumbnailUrl).toBe(
      "/template-thumbnails/product-card-classic.svg"
    );
    expect(PRODUCT_CARD_TEMPLATE_DESCRIPTORS["compact"].thumbnailUrl).toBe(
      "/template-thumbnails/product-card-compact.svg"
    );
    expect(PRODUCT_CARD_TEMPLATE_DESCRIPTORS["editorial"].thumbnailUrl).toBe(
      "/template-thumbnails/product-card-editorial.svg"
    );
    expect(PRODUCT_CARD_TEMPLATE_DESCRIPTORS["premium-commerce"].thumbnailUrl).toBe(
      "/template-thumbnails/product-card-premium-commerce.svg"
    );
  });
});

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

describe("isProductCardTemplateId", () => {
  it("devuelve true para cada id válido", () => {
    for (const id of PRODUCT_CARD_TEMPLATE_IDS) {
      expect(isProductCardTemplateId(id)).toBe(true);
    }
  });

  it("devuelve false para inputs inválidos", () => {
    expect(isProductCardTemplateId("no-existe")).toBe(false);
    expect(isProductCardTemplateId("")).toBe(false);
    expect(isProductCardTemplateId(undefined)).toBe(false);
    expect(isProductCardTemplateId(null)).toBe(false);
    expect(isProductCardTemplateId(42)).toBe(false);
    expect(isProductCardTemplateId({})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Resolver — degrada al default
// ---------------------------------------------------------------------------

describe("resolveProductCardTemplateId", () => {
  it("resuelve ids válidos como identidad", () => {
    for (const id of PRODUCT_CARD_TEMPLATE_IDS) {
      expect(resolveProductCardTemplateId(id)).toBe(id);
    }
  });

  it("degrada al default cuando el input no matchea", () => {
    expect(resolveProductCardTemplateId("no-existe")).toBe(DEFAULT_PRODUCT_CARD_TEMPLATE_ID);
    expect(resolveProductCardTemplateId(undefined)).toBe(DEFAULT_PRODUCT_CARD_TEMPLATE_ID);
    expect(resolveProductCardTemplateId(null)).toBe(DEFAULT_PRODUCT_CARD_TEMPLATE_ID);
    expect(resolveProductCardTemplateId(42)).toBe(DEFAULT_PRODUCT_CARD_TEMPLATE_ID);
    expect(resolveProductCardTemplateId("")).toBe(DEFAULT_PRODUCT_CARD_TEMPLATE_ID);
  });

  it("el default es 'classic'", () => {
    expect(DEFAULT_PRODUCT_CARD_TEMPLATE_ID).toBe("classic");
  });
});

// ---------------------------------------------------------------------------
// Registry — resolveProductCardTemplate
// ---------------------------------------------------------------------------

describe("resolveProductCardTemplate", () => {
  it("devuelve un componente (función) para cada id válido", () => {
    for (const id of PRODUCT_CARD_TEMPLATE_IDS) {
      const Component = resolveProductCardTemplate(id);
      expect(typeof Component).toBe("function");
    }
  });

  it("devuelve el componente classic (default) cuando el input no matchea", () => {
    const fallback = resolveProductCardTemplate("no-existe");
    const classic = resolveProductCardTemplate("classic");
    expect(fallback).toBe(classic);
  });

  it("devuelve componentes distintos para cada variante", () => {
    const classic = resolveProductCardTemplate("classic");
    const compact = resolveProductCardTemplate("compact");
    const editorial = resolveProductCardTemplate("editorial");
    const premium = resolveProductCardTemplate("premium-commerce");

    expect(classic).not.toBe(compact);
    expect(classic).not.toBe(editorial);
    expect(classic).not.toBe(premium);
    expect(compact).not.toBe(editorial);
    expect(compact).not.toBe(premium);
    expect(editorial).not.toBe(premium);
  });
});
