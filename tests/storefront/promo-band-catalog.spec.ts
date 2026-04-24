import { describe, expect, it } from "vitest";

import {
  DEFAULT_PROMO_BAND_TEMPLATE_ID,
  PROMO_BAND_TEMPLATE_DESCRIPTORS,
  PROMO_BAND_TEMPLATE_IDS,
  isPromoBandTemplateId,
  resolvePromoBandTemplateId,
} from "@/lib/templates/promo-band-catalog";
import { PromoBandContentSchema, PROMO_BAND_VARIANTS } from "@/lib/modules/promo-band";

describe("PromoBand template catalog", () => {
  it("expone las 4 variantes declaradas en el módulo", () => {
    expect(PROMO_BAND_TEMPLATE_IDS).toEqual([
      "split-cta",
      "solid-bg",
      "countdown",
      "image-overlay",
    ]);
  });

  it("el default es split-cta", () => {
    expect(DEFAULT_PROMO_BAND_TEMPLATE_ID).toBe("split-cta");
  });

  it("PROMO_BAND_TEMPLATE_IDS coincide con PROMO_BAND_VARIANTS del módulo", () => {
    expect([...PROMO_BAND_TEMPLATE_IDS]).toEqual([...PROMO_BAND_VARIANTS]);
  });

  it("describe cada variante con label, descripción y bestFor no vacíos", () => {
    for (const id of PROMO_BAND_TEMPLATE_IDS) {
      const descriptor = PROMO_BAND_TEMPLATE_DESCRIPTORS[id];
      expect(descriptor).toBeDefined();
      expect(descriptor.id).toBe(id);
      expect(descriptor.label.length).toBeGreaterThan(0);
      expect(descriptor.description.length).toBeGreaterThan(0);
      expect(descriptor.bestFor.length).toBeGreaterThan(0);
    }
  });

  it("cada descriptor tiene thumbnailUrl apuntando al SVG correspondiente", () => {
    for (const id of PROMO_BAND_TEMPLATE_IDS) {
      const { thumbnailUrl } = PROMO_BAND_TEMPLATE_DESCRIPTORS[id];
      expect(thumbnailUrl).toBe(`/template-thumbnails/promo-band-${id}.svg`);
    }
  });
});

describe("isPromoBandTemplateId", () => {
  it("devuelve true para variantes válidas", () => {
    expect(isPromoBandTemplateId("split-cta")).toBe(true);
    expect(isPromoBandTemplateId("solid-bg")).toBe(true);
    expect(isPromoBandTemplateId("countdown")).toBe(true);
    expect(isPromoBandTemplateId("image-overlay")).toBe(true);
  });

  it("devuelve false para valores inválidos", () => {
    expect(isPromoBandTemplateId("no-existe")).toBe(false);
    expect(isPromoBandTemplateId("split")).toBe(false);
    expect(isPromoBandTemplateId("solid")).toBe(false);
    expect(isPromoBandTemplateId(undefined)).toBe(false);
    expect(isPromoBandTemplateId(null)).toBe(false);
    expect(isPromoBandTemplateId(42)).toBe(false);
    expect(isPromoBandTemplateId("")).toBe(false);
  });
});

describe("resolvePromoBandTemplateId", () => {
  it("resuelve variantes válidas como identidad", () => {
    expect(resolvePromoBandTemplateId("split-cta")).toBe("split-cta");
    expect(resolvePromoBandTemplateId("solid-bg")).toBe("solid-bg");
    expect(resolvePromoBandTemplateId("countdown")).toBe("countdown");
    expect(resolvePromoBandTemplateId("image-overlay")).toBe("image-overlay");
  });

  it("degrada al default cuando el input no matchea", () => {
    expect(resolvePromoBandTemplateId("no-existe")).toBe(DEFAULT_PROMO_BAND_TEMPLATE_ID);
    expect(resolvePromoBandTemplateId(undefined)).toBe(DEFAULT_PROMO_BAND_TEMPLATE_ID);
    expect(resolvePromoBandTemplateId(null)).toBe(DEFAULT_PROMO_BAND_TEMPLATE_ID);
    expect(resolvePromoBandTemplateId(42)).toBe(DEFAULT_PROMO_BAND_TEMPLATE_ID);
    expect(resolvePromoBandTemplateId("")).toBe(DEFAULT_PROMO_BAND_TEMPLATE_ID);
  });
});

describe("PromoBandContentSchema (Zod)", () => {
  it("valida un content mínimo (solo title)", () => {
    const result = PromoBandContentSchema.safeParse({ title: "Promo de prueba" });
    expect(result.success).toBe(true);
  });

  it("valida un content completo", () => {
    const result = PromoBandContentSchema.safeParse({
      title: "Oferta del día",
      subtitle: "FLASH",
      description: "Aprovechá esta promo por tiempo limitado.",
      imageUrl: "https://example.com/promo.jpg",
      bgColor: "var(--accent)",
      cta: { label: "Ver oferta", href: "/catalog", variant: "primary" },
      endsAt: "2026-12-31T23:59:59.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("falla si title está vacío", () => {
    const result = PromoBandContentSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("falla si falta title completamente", () => {
    const result = PromoBandContentSchema.safeParse({ subtitle: "Solo un subtítulo" });
    expect(result.success).toBe(false);
  });

  it("falla si cta.href está vacío", () => {
    const result = PromoBandContentSchema.safeParse({
      title: "Promo",
      cta: { label: "Ver", href: "" },
    });
    expect(result.success).toBe(false);
  });

  it("falla si cta.label está vacío", () => {
    const result = PromoBandContentSchema.safeParse({
      title: "Promo",
      cta: { label: "", href: "/catalog" },
    });
    expect(result.success).toBe(false);
  });

  it("valida cta sin variant (opcional)", () => {
    const result = PromoBandContentSchema.safeParse({
      title: "Promo",
      cta: { label: "Ver", href: "/catalog" },
    });
    expect(result.success).toBe(true);
  });

  it("valida todos los valores de variant de CTA", () => {
    for (const variant of ["primary", "secondary", "link"] as const) {
      const result = PromoBandContentSchema.safeParse({
        title: "Promo",
        cta: { label: "Ver", href: "/catalog", variant },
      });
      expect(result.success).toBe(true);
    }
  });

  it("falla con variant de CTA inválida", () => {
    const result = PromoBandContentSchema.safeParse({
      title: "Promo",
      cta: { label: "Ver", href: "/catalog", variant: "invalid" },
    });
    expect(result.success).toBe(false);
  });

  it("los campos opcionales pueden omitirse sin errores", () => {
    const optionalFields = ["subtitle", "description", "imageUrl", "bgColor", "cta", "endsAt"];
    for (const field of optionalFields) {
      const payload: Record<string, unknown> = { title: "Promo" };
      delete payload[field];
      const result = PromoBandContentSchema.safeParse(payload);
      expect(result.success).toBe(true);
    }
  });
});
