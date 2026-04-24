import { describe, expect, it } from "vitest";

import {
  DEFAULT_TESTIMONIALS_TEMPLATE_ID,
  TESTIMONIALS_TEMPLATE_DESCRIPTORS,
  TESTIMONIALS_TEMPLATE_IDS,
  TestimonialsContentSchema,
  buildThumbnailSvg,
  isTestimonialsTemplateId,
  resolveTestimonialsTemplateId,
} from "@/lib/templates/testimonials-catalog";

// ─── Catálogo de IDs ──────────────────────────────────────────────────────

describe("TESTIMONIALS_TEMPLATE_IDS", () => {
  it("expone exactamente las 4 variantes definidas", () => {
    expect(TESTIMONIALS_TEMPLATE_IDS).toEqual(["carousel", "grid", "masonry", "single-quote"]);
  });

  it("incluye el default entre los IDs válidos", () => {
    expect(TESTIMONIALS_TEMPLATE_IDS).toContain(DEFAULT_TESTIMONIALS_TEMPLATE_ID);
  });
});

// ─── Descriptores ─────────────────────────────────────────────────────────

describe("TESTIMONIALS_TEMPLATE_DESCRIPTORS", () => {
  it("describe cada variante con label, description, bestFor y thumbnailUrl", () => {
    for (const id of TESTIMONIALS_TEMPLATE_IDS) {
      const d = TESTIMONIALS_TEMPLATE_DESCRIPTORS[id];
      expect(d, `descriptor para '${id}' debe existir`).toBeDefined();
      expect(d.label.length, `label de '${id}' no puede estar vacío`).toBeGreaterThan(0);
      expect(d.description.length, `description de '${id}' no puede estar vacía`).toBeGreaterThan(0);
      expect(d.bestFor.length, `bestFor de '${id}' debe tener al menos un caso`).toBeGreaterThan(0);
      expect(d.thumbnailUrl, `thumbnailUrl de '${id}' debe definirse`).toMatch(
        /\/template-thumbnails\/testimonials-.+\.svg$/,
      );
    }
  });

  it("expone un contentSchema válido por variante (objeto Zod)", () => {
    for (const id of TESTIMONIALS_TEMPLATE_IDS) {
      const { contentSchema } = TESTIMONIALS_TEMPLATE_DESCRIPTORS[id];
      expect(typeof contentSchema.parse).toBe("function");
      expect(typeof contentSchema.safeParse).toBe("function");
    }
  });
});

// ─── isTestimonialsTemplateId ─────────────────────────────────────────────

describe("isTestimonialsTemplateId", () => {
  it("retorna true para los 4 IDs válidos", () => {
    expect(isTestimonialsTemplateId("carousel")).toBe(true);
    expect(isTestimonialsTemplateId("grid")).toBe(true);
    expect(isTestimonialsTemplateId("masonry")).toBe(true);
    expect(isTestimonialsTemplateId("single-quote")).toBe(true);
  });

  it("retorna false para valores inválidos", () => {
    expect(isTestimonialsTemplateId("no-existe")).toBe(false);
    expect(isTestimonialsTemplateId("")).toBe(false);
    expect(isTestimonialsTemplateId(undefined)).toBe(false);
    expect(isTestimonialsTemplateId(null)).toBe(false);
    expect(isTestimonialsTemplateId(42)).toBe(false);
    expect(isTestimonialsTemplateId({})).toBe(false);
    expect(isTestimonialsTemplateId([])).toBe(false);
  });
});

// ─── resolveTestimonialsTemplateId ────────────────────────────────────────

describe("resolveTestimonialsTemplateId", () => {
  it("resuelve cada ID válido como identidad", () => {
    for (const id of TESTIMONIALS_TEMPLATE_IDS) {
      expect(resolveTestimonialsTemplateId(id)).toBe(id);
    }
  });

  it("degrada al default cuando el input no matchea", () => {
    expect(resolveTestimonialsTemplateId("no-existe")).toBe(DEFAULT_TESTIMONIALS_TEMPLATE_ID);
    expect(resolveTestimonialsTemplateId(undefined)).toBe(DEFAULT_TESTIMONIALS_TEMPLATE_ID);
    expect(resolveTestimonialsTemplateId(null)).toBe(DEFAULT_TESTIMONIALS_TEMPLATE_ID);
    expect(resolveTestimonialsTemplateId(42)).toBe(DEFAULT_TESTIMONIALS_TEMPLATE_ID);
    expect(resolveTestimonialsTemplateId("")).toBe(DEFAULT_TESTIMONIALS_TEMPLATE_ID);
  });

  it("nunca retorna undefined — siempre un ID válido", () => {
    const inputs = [undefined, null, "", "x", 0, false, {}];
    for (const input of inputs) {
      const result = resolveTestimonialsTemplateId(input);
      expect(TESTIMONIALS_TEMPLATE_IDS).toContain(result);
    }
  });
});

// ─── TestimonialsContentSchema (Zod) ──────────────────────────────────────

describe("TestimonialsContentSchema", () => {
  const validItem = { quote: "Excelente servicio", author: "Juan Pérez" };

  it("acepta contenido mínimo válido (solo items con quote y author)", () => {
    const result = TestimonialsContentSchema.safeParse({ items: [validItem] });
    expect(result.success).toBe(true);
  });

  it("acepta contenido completo con todos los campos opcionales", () => {
    const result = TestimonialsContentSchema.safeParse({
      title: "Lo que dicen nuestros clientes",
      subtitle: "Más de 500 clientes satisfechos",
      items: [
        {
          quote: "Atención increíble",
          author: "María García",
          role: "Directora de Operaciones",
          avatarUrl: "https://example.com/avatar.jpg",
          rating: 5,
        },
        {
          quote: "Relación precio-calidad insuperable",
          author: "Carlos Rodríguez",
          rating: 4,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rechaza items con quote vacío", () => {
    const result = TestimonialsContentSchema.safeParse({
      items: [{ quote: "", author: "Ana" }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza items con author vacío", () => {
    const result = TestimonialsContentSchema.safeParse({
      items: [{ quote: "Gran servicio", author: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza items array vacío", () => {
    const result = TestimonialsContentSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("rechaza rating fuera del rango 1–5", () => {
    const tooLow = TestimonialsContentSchema.safeParse({
      items: [{ ...validItem, rating: 0 }],
    });
    expect(tooLow.success).toBe(false);

    const tooHigh = TestimonialsContentSchema.safeParse({
      items: [{ ...validItem, rating: 6 }],
    });
    expect(tooHigh.success).toBe(false);
  });

  it("acepta rating en los extremos válidos (1 y 5)", () => {
    const low = TestimonialsContentSchema.safeParse({
      items: [{ ...validItem, rating: 1 }],
    });
    expect(low.success).toBe(true);

    const high = TestimonialsContentSchema.safeParse({
      items: [{ ...validItem, rating: 5 }],
    });
    expect(high.success).toBe(true);
  });

  it("acepta items sin campos opcionales (role, avatarUrl, rating)", () => {
    const result = TestimonialsContentSchema.safeParse({
      items: [{ quote: "Muy bueno", author: "Lucía" }],
    });
    expect(result.success).toBe(true);
  });

  it("rechaza avatarUrl que no sea una URL válida", () => {
    const result = TestimonialsContentSchema.safeParse({
      items: [{ ...validItem, avatarUrl: "no-es-una-url" }],
    });
    expect(result.success).toBe(false);
  });

  it("permite omitir title y subtitle", () => {
    const result = TestimonialsContentSchema.safeParse({ items: [validItem] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBeUndefined();
      expect(result.data.subtitle).toBeUndefined();
    }
  });
});

// ─── buildThumbnailSvg ────────────────────────────────────────────────────

describe("buildThumbnailSvg", () => {
  it("retorna un string con la etiqueta SVG raíz", () => {
    const svg = buildThumbnailSvg({ label: "Carrusel" });
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("incluye el label en el output", () => {
    const svg = buildThumbnailSvg({ label: "Grilla" });
    expect(svg).toContain("Grilla");
  });

  it("usa las dimensiones por defecto (200x120)", () => {
    const svg = buildThumbnailSvg({ label: "Test" });
    expect(svg).toContain('width="200"');
    expect(svg).toContain('height="120"');
  });
});
