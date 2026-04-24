import { describe, expect, it } from "vitest";

import {
  DEFAULT_TRUST_BAR_TEMPLATE_ID,
  TRUST_BAR_TEMPLATE_DESCRIPTORS,
  TRUST_BAR_TEMPLATE_IDS,
  TrustBarContentSchema,
  defaultTrustBarContent,
  isTrustBarTemplateId,
  resolveTrustBarTemplateId,
} from "@/lib/templates/trust-bar-catalog";

describe("TrustBar template catalog — descriptores", () => {
  it("expone exactamente 4 variantes", () => {
    expect(TRUST_BAR_TEMPLATE_IDS).toHaveLength(4);
    expect(TRUST_BAR_TEMPLATE_IDS).toEqual(["inline", "stacked-cards", "rail-dense", "compact-strip"]);
  });

  it("el default es 'inline'", () => {
    expect(DEFAULT_TRUST_BAR_TEMPLATE_ID).toBe("inline");
  });

  it("cada variante tiene descriptor completo con label, description, bestFor y thumbnailUrl", () => {
    for (const id of TRUST_BAR_TEMPLATE_IDS) {
      const descriptor = TRUST_BAR_TEMPLATE_DESCRIPTORS[id];
      expect(descriptor, `Descriptor faltante para '${id}'`).toBeDefined();
      expect(descriptor.label.length).toBeGreaterThan(0);
      expect(descriptor.description.length).toBeGreaterThan(0);
      expect(descriptor.bestFor.length).toBeGreaterThan(0);
      expect(descriptor.thumbnailUrl).toMatch(/^\/template-thumbnails\/trust-bar-/);
      expect(descriptor.id).toBe(id);
    }
  });
});

describe("TrustBar template catalog — resolver", () => {
  it("reconoce todos los IDs válidos con isTrustBarTemplateId", () => {
    expect(isTrustBarTemplateId("inline")).toBe(true);
    expect(isTrustBarTemplateId("stacked-cards")).toBe(true);
    expect(isTrustBarTemplateId("rail-dense")).toBe(true);
    expect(isTrustBarTemplateId("compact-strip")).toBe(true);
  });

  it("rechaza valores inválidos con isTrustBarTemplateId", () => {
    expect(isTrustBarTemplateId("no-existe")).toBe(false);
    expect(isTrustBarTemplateId("")).toBe(false);
    expect(isTrustBarTemplateId(undefined)).toBe(false);
    expect(isTrustBarTemplateId(null)).toBe(false);
    expect(isTrustBarTemplateId(42)).toBe(false);
  });

  it("resuelve IDs válidos como identidad", () => {
    expect(resolveTrustBarTemplateId("inline")).toBe("inline");
    expect(resolveTrustBarTemplateId("stacked-cards")).toBe("stacked-cards");
    expect(resolveTrustBarTemplateId("rail-dense")).toBe("rail-dense");
    expect(resolveTrustBarTemplateId("compact-strip")).toBe("compact-strip");
  });

  it("degrada al default con input inválido o desconocido", () => {
    expect(resolveTrustBarTemplateId("no-existe")).toBe(DEFAULT_TRUST_BAR_TEMPLATE_ID);
    expect(resolveTrustBarTemplateId(undefined)).toBe(DEFAULT_TRUST_BAR_TEMPLATE_ID);
    expect(resolveTrustBarTemplateId(null)).toBe(DEFAULT_TRUST_BAR_TEMPLATE_ID);
    expect(resolveTrustBarTemplateId(42)).toBe(DEFAULT_TRUST_BAR_TEMPLATE_ID);
    expect(resolveTrustBarTemplateId("")).toBe(DEFAULT_TRUST_BAR_TEMPLATE_ID);
  });
});

describe("TrustBar template catalog — schema Zod", () => {
  it("defaultTrustBarContent parsea sin errores", () => {
    const result = TrustBarContentSchema.safeParse(defaultTrustBarContent);
    expect(result.success).toBe(true);
  });

  it("acepta contenido válido con todos los íconos del enum", () => {
    const validIcons = [
      "truck",
      "shield",
      "credit-card",
      "clock",
      "badge-check",
      "headset",
      "package",
      "refresh-cw",
    ] as const;

    for (const icon of validIcons) {
      const result = TrustBarContentSchema.safeParse({
        items: [{ icon, title: "Título de prueba" }],
      });
      expect(result.success, `Ícono '${icon}' debería ser válido`).toBe(true);
    }
  });

  it("rechaza ícono desconocido", () => {
    const result = TrustBarContentSchema.safeParse({
      items: [{ icon: "star-wars", title: "Test" }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza items vacío", () => {
    const result = TrustBarContentSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("acepta item sin subtitle (campo opcional)", () => {
    const result = TrustBarContentSchema.safeParse({
      items: [{ icon: "truck", title: "Solo título" }],
    });
    expect(result.success).toBe(true);
  });

  it("acepta alignment 'left' y 'center'", () => {
    for (const alignment of ["left", "center"] as const) {
      const result = TrustBarContentSchema.safeParse({
        items: [{ icon: "shield", title: "Test" }],
        alignment,
      });
      expect(result.success, `alignment '${alignment}' debería ser válido`).toBe(true);
    }
  });

  it("rechaza alignment inválido", () => {
    const result = TrustBarContentSchema.safeParse({
      items: [{ icon: "truck", title: "Test" }],
      alignment: "right",
    });
    expect(result.success).toBe(false);
  });
});
