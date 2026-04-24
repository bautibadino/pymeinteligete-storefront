import { describe, expect, it } from "vitest";

import {
  DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID,
  PRODUCT_DETAIL_TEMPLATE_DESCRIPTORS,
  PRODUCT_DETAIL_TEMPLATE_IDS,
  ProductDetailContentSchema,
  isProductDetailTemplateId,
  resolveProductDetailTemplateId,
} from "@/lib/templates/product-detail-catalog";

// ─── Catálogo ────────────────────────────────────────────────────────────────

describe("ProductDetail template catalog — IDs y default", () => {
  it("expone exactamente las 4 variantes declaradas", () => {
    expect(PRODUCT_DETAIL_TEMPLATE_IDS).toEqual([
      "gallery-specs",
      "cards-features",
      "accordion-details",
      "editorial",
    ]);
  });

  it("el default es 'gallery-specs'", () => {
    expect(DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID).toBe("gallery-specs");
  });

  it("el default está incluido en los IDs", () => {
    expect(PRODUCT_DETAIL_TEMPLATE_IDS).toContain(DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID);
  });
});

describe("ProductDetail template catalog — descriptores", () => {
  it("cada variante tiene descriptor completo", () => {
    for (const id of PRODUCT_DETAIL_TEMPLATE_IDS) {
      const d = PRODUCT_DETAIL_TEMPLATE_DESCRIPTORS[id];
      expect(d, `descriptor de ${id}`).toBeDefined();
      expect(d.id).toBe(id);
      expect(d.label.length).toBeGreaterThan(0);
      expect(d.description.length).toBeGreaterThan(0);
      expect(d.bestFor.length).toBeGreaterThan(0);
    }
  });

  it("cada descriptor tiene thumbnailUrl correctamente formado", () => {
    for (const id of PRODUCT_DETAIL_TEMPLATE_IDS) {
      const { thumbnailUrl } = PRODUCT_DETAIL_TEMPLATE_DESCRIPTORS[id];
      expect(thumbnailUrl).toMatch(/^\/template-thumbnails\/product-detail-.+\.svg$/);
    }
  });

  it("thumbnailUrl incluye el id del template", () => {
    for (const id of PRODUCT_DETAIL_TEMPLATE_IDS) {
      const { thumbnailUrl } = PRODUCT_DETAIL_TEMPLATE_DESCRIPTORS[id];
      expect(thumbnailUrl).toContain(id);
    }
  });

  it("cada descriptor expone contentSchema (Zod)", () => {
    for (const id of PRODUCT_DETAIL_TEMPLATE_IDS) {
      const { contentSchema } = PRODUCT_DETAIL_TEMPLATE_DESCRIPTORS[id];
      expect(contentSchema).toBeDefined();
      expect(typeof contentSchema.parse).toBe("function");
    }
  });
});

// ─── Guardas ─────────────────────────────────────────────────────────────────

describe("isProductDetailTemplateId", () => {
  it("reconoce ids válidos", () => {
    expect(isProductDetailTemplateId("gallery-specs")).toBe(true);
    expect(isProductDetailTemplateId("cards-features")).toBe(true);
    expect(isProductDetailTemplateId("accordion-details")).toBe(true);
    expect(isProductDetailTemplateId("editorial")).toBe(true);
  });

  it("rechaza strings inválidos", () => {
    expect(isProductDetailTemplateId("no-existe")).toBe(false);
    expect(isProductDetailTemplateId("")).toBe(false);
    expect(isProductDetailTemplateId("GALLERY-SPECS")).toBe(false);
  });

  it("rechaza valores no-string", () => {
    expect(isProductDetailTemplateId(undefined)).toBe(false);
    expect(isProductDetailTemplateId(null)).toBe(false);
    expect(isProductDetailTemplateId(42)).toBe(false);
    expect(isProductDetailTemplateId([])).toBe(false);
    expect(isProductDetailTemplateId({})).toBe(false);
  });
});

// ─── Resolver ────────────────────────────────────────────────────────────────

describe("resolveProductDetailTemplateId", () => {
  it("devuelve el mismo id cuando es válido (identidad)", () => {
    expect(resolveProductDetailTemplateId("gallery-specs")).toBe("gallery-specs");
    expect(resolveProductDetailTemplateId("cards-features")).toBe("cards-features");
    expect(resolveProductDetailTemplateId("accordion-details")).toBe("accordion-details");
    expect(resolveProductDetailTemplateId("editorial")).toBe("editorial");
  });

  it("degrada al default ante inputs inválidos", () => {
    expect(resolveProductDetailTemplateId("no-existe")).toBe(DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID);
    expect(resolveProductDetailTemplateId(undefined)).toBe(DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID);
    expect(resolveProductDetailTemplateId(null)).toBe(DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID);
    expect(resolveProductDetailTemplateId(42)).toBe(DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID);
    expect(resolveProductDetailTemplateId("")).toBe(DEFAULT_PRODUCT_DETAIL_TEMPLATE_ID);
  });
});

// ─── Schema Zod ──────────────────────────────────────────────────────────────

describe("ProductDetailContentSchema", () => {
  it("acepta contenido mínimo válido (objeto vacío)", () => {
    const result = ProductDetailContentSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("acepta contenido completo con todos los campos opcionales", () => {
    const result = ProductDetailContentSchema.safeParse({
      showBreadcrumbs: true,
      showRelated: true,
      relatedSource: "category",
      relatedLimit: 4,
      accordionSections: [
        { title: "Envío", body: "Enviamos a todo el país." },
        { title: "Devoluciones", body: "Tenés 30 días." },
      ],
      featureCards: [
        { icon: "truck", title: "Envío rápido", body: "Llega en 24hs." },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("acepta accordionSections sin icon en featureCards", () => {
    const result = ProductDetailContentSchema.safeParse({
      featureCards: [{ title: "Garantía", body: "12 meses oficial." }],
    });
    expect(result.success).toBe(true);
  });

  it("rechaza relatedLimit menor a 1", () => {
    const result = ProductDetailContentSchema.safeParse({ relatedLimit: 0 });
    expect(result.success).toBe(false);
  });

  it("rechaza relatedLimit mayor a 12", () => {
    const result = ProductDetailContentSchema.safeParse({ relatedLimit: 20 });
    expect(result.success).toBe(false);
  });

  it("rechaza accordionSections con title vacío", () => {
    const result = ProductDetailContentSchema.safeParse({
      accordionSections: [{ title: "", body: "Contenido válido." }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza featureCards con body vacío", () => {
    const result = ProductDetailContentSchema.safeParse({
      featureCards: [{ title: "Título", body: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza relatedSource inválido", () => {
    const result = ProductDetailContentSchema.safeParse({
      relatedSource: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("los campos opcionales pueden omitirse sin errores", () => {
    const optionalFields = [
      "showBreadcrumbs",
      "showRelated",
      "relatedSource",
      "relatedLimit",
      "accordionSections",
      "featureCards",
    ];
    for (const field of optionalFields) {
      const payload: Record<string, unknown> = {};
      delete payload[field];
      const result = ProductDetailContentSchema.safeParse(payload);
      expect(result.success).toBe(true);
    }
  });
});
