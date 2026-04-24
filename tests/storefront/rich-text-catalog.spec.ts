import { describe, expect, it } from "vitest";

import {
  DEFAULT_RICH_TEXT_TEMPLATE_ID,
  getDefaultRichTextContent,
  isRichTextTemplateId,
  resolveRichTextTemplateId,
  RICH_TEXT_TEMPLATE_DESCRIPTORS,
  RICH_TEXT_TEMPLATE_IDS,
  RichTextContentSchema,
} from "@/lib/templates/rich-text-catalog";
import type { RichTextTemplateId } from "@/lib/templates/rich-text-catalog";

// ---------------------------------------------------------------------------
// IDs y variantes
// ---------------------------------------------------------------------------

describe("RICH_TEXT_TEMPLATE_IDS", () => {
  it("expone exactamente las 4 variantes declaradas en el catálogo", () => {
    expect(RICH_TEXT_TEMPLATE_IDS).toEqual([
      "full-width-prose",
      "two-column",
      "image-left-text-right",
      "image-right-text-left",
    ]);
  });

  it("el default es full-width-prose", () => {
    expect(DEFAULT_RICH_TEXT_TEMPLATE_ID).toBe("full-width-prose");
  });
});

// ---------------------------------------------------------------------------
// Descriptores
// ---------------------------------------------------------------------------

describe("RICH_TEXT_TEMPLATE_DESCRIPTORS", () => {
  it("describe cada variante con id, label, description, bestFor y thumbnailUrl", () => {
    for (const id of RICH_TEXT_TEMPLATE_IDS) {
      const d = RICH_TEXT_TEMPLATE_DESCRIPTORS[id];
      expect(d, `descriptor de ${id} no existe`).toBeDefined();
      expect(d.id).toBe(id);
      expect(d.label.length, `${id}: label vacío`).toBeGreaterThan(0);
      expect(d.description.length, `${id}: description vacía`).toBeGreaterThan(0);
      expect(d.bestFor.length, `${id}: bestFor vacío`).toBeGreaterThan(0);
      expect(d.thumbnailUrl, `${id}: thumbnailUrl vacío`).toMatch(/\.svg$/);
    }
  });

  it("los thumbnailUrls apuntan al directorio correcto", () => {
    for (const id of RICH_TEXT_TEMPLATE_IDS) {
      const { thumbnailUrl } = RICH_TEXT_TEMPLATE_DESCRIPTORS[id];
      expect(thumbnailUrl).toMatch(/^\/template-thumbnails\/rich-text-/);
    }
  });
});

// ---------------------------------------------------------------------------
// isRichTextTemplateId
// ---------------------------------------------------------------------------

describe("isRichTextTemplateId", () => {
  it("retorna true para todas las variantes válidas", () => {
    for (const id of RICH_TEXT_TEMPLATE_IDS) {
      expect(isRichTextTemplateId(id), `${id} debería ser válido`).toBe(true);
    }
  });

  it("retorna false para valores no válidos", () => {
    expect(isRichTextTemplateId("no-existe")).toBe(false);
    expect(isRichTextTemplateId("editorial")).toBe(false); // variante legacy, no builder
    expect(isRichTextTemplateId("")).toBe(false);
    expect(isRichTextTemplateId(undefined)).toBe(false);
    expect(isRichTextTemplateId(null)).toBe(false);
    expect(isRichTextTemplateId(42)).toBe(false);
    expect(isRichTextTemplateId({})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resolveRichTextTemplateId
// ---------------------------------------------------------------------------

describe("resolveRichTextTemplateId", () => {
  it("resuelve variantes válidas como identidad", () => {
    for (const id of RICH_TEXT_TEMPLATE_IDS) {
      expect(resolveRichTextTemplateId(id)).toBe(id);
    }
  });

  it("degrada al default cuando el input es inválido", () => {
    expect(resolveRichTextTemplateId("no-existe")).toBe(DEFAULT_RICH_TEXT_TEMPLATE_ID);
    expect(resolveRichTextTemplateId(undefined)).toBe(DEFAULT_RICH_TEXT_TEMPLATE_ID);
    expect(resolveRichTextTemplateId(null)).toBe(DEFAULT_RICH_TEXT_TEMPLATE_ID);
    expect(resolveRichTextTemplateId(42)).toBe(DEFAULT_RICH_TEXT_TEMPLATE_ID);
    expect(resolveRichTextTemplateId("")).toBe(DEFAULT_RICH_TEXT_TEMPLATE_ID);
  });

  it("nunca devuelve undefined", () => {
    const resultado = resolveRichTextTemplateId("invalido");
    expect(resultado).toBeDefined();
    expect(RICH_TEXT_TEMPLATE_IDS).toContain(resultado);
  });
});

// ---------------------------------------------------------------------------
// RichTextContentSchema (Zod)
// ---------------------------------------------------------------------------

describe("RichTextContentSchema", () => {
  it("valida un content mínimo con solo body", () => {
    const result = RichTextContentSchema.safeParse({ body: "<p>Hola</p>" });
    expect(result.success).toBe(true);
  });

  it("valida un content completo", () => {
    const result = RichTextContentSchema.safeParse({
      eyebrow: "Sobre nosotros",
      title: "Nuestra historia",
      body: "<p>Texto de ejemplo</p>",
      imageUrl: "https://cdn.example.com/imagen.jpg",
      imageAlt: "Imagen de ejemplo",
      cta: { label: "Ver más", href: "/historia", variant: "primary" },
    });
    expect(result.success).toBe(true);
  });

  it("rechaza si body está ausente", () => {
    const result = RichTextContentSchema.safeParse({ title: "Sin body" });
    expect(result.success).toBe(false);
  });

  it("acepta cta sin variant (opcional)", () => {
    const result = RichTextContentSchema.safeParse({
      body: "Texto",
      cta: { label: "Ir", href: "/destino" },
    });
    expect(result.success).toBe(true);
  });

  it("rechaza cta con label vacío", () => {
    const result = RichTextContentSchema.safeParse({
      body: "Texto",
      cta: { label: "", href: "/destino" },
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cta con variant desconocida", () => {
    const result = RichTextContentSchema.safeParse({
      body: "Texto",
      cta: { label: "Click", href: "/x", variant: "danger" },
    });
    expect(result.success).toBe(false);
  });

  it("acepta campos opcionales ausentes sin errores", () => {
    const result = RichTextContentSchema.safeParse({ body: "Solo el body" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eyebrow).toBeUndefined();
      expect(result.data.title).toBeUndefined();
      expect(result.data.imageUrl).toBeUndefined();
      expect(result.data.cta).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// getDefaultRichTextContent
// ---------------------------------------------------------------------------

describe("getDefaultRichTextContent", () => {
  it("devuelve contenido con body para todas las variantes", () => {
    for (const id of RICH_TEXT_TEMPLATE_IDS) {
      const content = getDefaultRichTextContent(id);
      expect(content.body, `${id}: body vacío`).toBeTruthy();
    }
  });

  it("incluye imageUrl para variantes con imagen", () => {
    const leftRight = getDefaultRichTextContent("image-left-text-right");
    const rightLeft = getDefaultRichTextContent("image-right-text-left");
    expect("imageUrl" in leftRight).toBe(true);
    expect("imageUrl" in rightLeft).toBe(true);
  });

  it("el contenido default pasa el schema Zod", () => {
    for (const id of RICH_TEXT_TEMPLATE_IDS) {
      const content = getDefaultRichTextContent(id);
      const result = RichTextContentSchema.safeParse(content);
      expect(result.success, `${id}: default content no pasa el schema`).toBe(true);
    }
  });

  it("devuelve objetos independientes en cada llamada", () => {
    const a = getDefaultRichTextContent("full-width-prose");
    const b = getDefaultRichTextContent("full-width-prose");
    expect(a).not.toBe(b);
  });

  it("acepta todos los RichTextTemplateId del catalog", () => {
    const ids: RichTextTemplateId[] = [
      "full-width-prose",
      "two-column",
      "image-left-text-right",
      "image-right-text-left",
    ];
    for (const id of ids) {
      expect(() => getDefaultRichTextContent(id)).not.toThrow();
    }
  });
});
