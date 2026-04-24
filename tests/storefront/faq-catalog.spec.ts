import { describe, expect, it } from "vitest";

import {
  DEFAULT_FAQ_TEMPLATE_ID,
  FAQ_TEMPLATE_DESCRIPTORS,
  FAQ_TEMPLATE_IDS,
  FaqContentSchema,
  isFaqTemplateId,
  resolveFaqTemplateId,
} from "@/lib/templates/faq-catalog";

// ─── Catálogo ────────────────────────────────────────────────────────────────

describe("FAQ template catalog — IDs y default", () => {
  it("expone exactamente las 4 variantes declaradas", () => {
    expect(FAQ_TEMPLATE_IDS).toEqual(["accordion", "two-column", "search", "categories"]);
  });

  it("el default es 'accordion'", () => {
    expect(DEFAULT_FAQ_TEMPLATE_ID).toBe("accordion");
  });

  it("el default está incluido en los IDs", () => {
    expect(FAQ_TEMPLATE_IDS).toContain(DEFAULT_FAQ_TEMPLATE_ID);
  });
});

describe("FAQ template catalog — descriptores", () => {
  it("cada variante tiene descriptor completo", () => {
    for (const id of FAQ_TEMPLATE_IDS) {
      const d = FAQ_TEMPLATE_DESCRIPTORS[id];
      expect(d, `descriptor de ${id}`).toBeDefined();
      expect(d.id).toBe(id);
      expect(d.label.length).toBeGreaterThan(0);
      expect(d.description.length).toBeGreaterThan(0);
      expect(d.bestFor.length).toBeGreaterThan(0);
    }
  });

  it("cada descriptor tiene thumbnailUrl correctamente formado", () => {
    for (const id of FAQ_TEMPLATE_IDS) {
      const { thumbnailUrl } = FAQ_TEMPLATE_DESCRIPTORS[id];
      expect(thumbnailUrl).toMatch(/^\/template-thumbnails\/faq-.+\.svg$/);
    }
  });

  it("thumbnailUrl incluye el id del template", () => {
    for (const id of FAQ_TEMPLATE_IDS) {
      const { thumbnailUrl } = FAQ_TEMPLATE_DESCRIPTORS[id];
      expect(thumbnailUrl).toContain(id);
    }
  });

  it("cada descriptor expone contentSchema (Zod)", () => {
    for (const id of FAQ_TEMPLATE_IDS) {
      const { contentSchema } = FAQ_TEMPLATE_DESCRIPTORS[id];
      expect(contentSchema).toBeDefined();
      expect(typeof contentSchema.parse).toBe("function");
    }
  });
});

// ─── Guardas ─────────────────────────────────────────────────────────────────

describe("isFaqTemplateId", () => {
  it("reconoce ids válidos", () => {
    expect(isFaqTemplateId("accordion")).toBe(true);
    expect(isFaqTemplateId("two-column")).toBe(true);
    expect(isFaqTemplateId("search")).toBe(true);
    expect(isFaqTemplateId("categories")).toBe(true);
  });

  it("rechaza strings inválidos", () => {
    expect(isFaqTemplateId("no-existe")).toBe(false);
    expect(isFaqTemplateId("")).toBe(false);
    expect(isFaqTemplateId("ACCORDION")).toBe(false);
  });

  it("rechaza valores no-string", () => {
    expect(isFaqTemplateId(undefined)).toBe(false);
    expect(isFaqTemplateId(null)).toBe(false);
    expect(isFaqTemplateId(42)).toBe(false);
    expect(isFaqTemplateId([])).toBe(false);
    expect(isFaqTemplateId({})).toBe(false);
  });
});

// ─── Resolver ────────────────────────────────────────────────────────────────

describe("resolveFaqTemplateId", () => {
  it("devuelve el mismo id cuando es válido (identidad)", () => {
    expect(resolveFaqTemplateId("accordion")).toBe("accordion");
    expect(resolveFaqTemplateId("two-column")).toBe("two-column");
    expect(resolveFaqTemplateId("search")).toBe("search");
    expect(resolveFaqTemplateId("categories")).toBe("categories");
  });

  it("degrada al default ante inputs inválidos", () => {
    expect(resolveFaqTemplateId("no-existe")).toBe(DEFAULT_FAQ_TEMPLATE_ID);
    expect(resolveFaqTemplateId(undefined)).toBe(DEFAULT_FAQ_TEMPLATE_ID);
    expect(resolveFaqTemplateId(null)).toBe(DEFAULT_FAQ_TEMPLATE_ID);
    expect(resolveFaqTemplateId(42)).toBe(DEFAULT_FAQ_TEMPLATE_ID);
    expect(resolveFaqTemplateId("")).toBe(DEFAULT_FAQ_TEMPLATE_ID);
  });
});

// ─── Schema Zod ──────────────────────────────────────────────────────────────

describe("FaqContentSchema", () => {
  it("acepta contenido mínimo válido (solo items requeridos)", () => {
    const result = FaqContentSchema.safeParse({
      items: [{ question: "¿Enviás a todo el país?", answer: "Sí, hacemos envíos a todo el país." }],
    });
    expect(result.success).toBe(true);
  });

  it("acepta contenido completo con todos los campos opcionales", () => {
    const result = FaqContentSchema.safeParse({
      title: "Preguntas frecuentes",
      subtitle: "Todo lo que necesitás saber",
      items: [
        { question: "¿Cuánto tarda el envío?", answer: "Entre 3 y 5 días hábiles.", category: "Envíos" },
        { question: "¿Aceptan tarjetas?", answer: "Sí, todas las tarjetas.", category: "Pagos" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("acepta items sin campo category (opcional)", () => {
    const result = FaqContentSchema.safeParse({
      items: [{ question: "¿Tienen garantía?", answer: "12 meses de garantía oficial." }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const firstItem = result.data.items[0];
      expect(firstItem).toBeDefined();
      expect(firstItem?.category).toBeUndefined();
    }
  });

  it("rechaza items vacíos", () => {
    const result = FaqContentSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("rechaza question vacía", () => {
    const result = FaqContentSchema.safeParse({
      items: [{ question: "", answer: "Respuesta válida." }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza answer vacía", () => {
    const result = FaqContentSchema.safeParse({
      items: [{ question: "¿Pregunta válida?", answer: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza si falta items", () => {
    const result = FaqContentSchema.safeParse({ title: "FAQ" });
    expect(result.success).toBe(false);
  });

  it("rechaza si items no es array", () => {
    const result = FaqContentSchema.safeParse({ items: "no-un-array" });
    expect(result.success).toBe(false);
  });

  it("title y subtitle son opcionales", () => {
    const result = FaqContentSchema.safeParse({
      items: [{ question: "¿Pregunta?", answer: "Respuesta." }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBeUndefined();
      expect(result.data.subtitle).toBeUndefined();
    }
  });
});
