import { describe, expect, it } from "vitest";

import type { HeroModule, StorefrontModule } from "@/lib/modules";
import { applyTemplateOverrides } from "@/lib/templates/apply-overrides";
import {
  DEFAULT_HERO_TEMPLATE_ID,
  HERO_TEMPLATE_DESCRIPTORS,
  HERO_TEMPLATE_IDS,
  isHeroTemplateId,
  resolveHeroTemplateId,
} from "@/lib/templates/hero-catalog";

function buildHero(overrides: Partial<HeroModule> = {}): HeroModule {
  return {
    id: "hero-test",
    type: "hero",
    variant: "split",
    title: "Hero de prueba",
    description: "Descripción de prueba",
    ...overrides,
  };
}

describe("Hero template catalog", () => {
  it("expone las variantes declaradas en el schema de módulos", () => {
    expect(HERO_TEMPLATE_IDS).toEqual(["split", "workshop", "editorial", "commerce", "button-overlay"]);
  });

  it("describe cada template con label, descripción y casos de uso", () => {
    for (const id of HERO_TEMPLATE_IDS) {
      const descriptor = HERO_TEMPLATE_DESCRIPTORS[id];
      expect(descriptor).toBeDefined();
      expect(descriptor.label.length).toBeGreaterThan(0);
      expect(descriptor.description.length).toBeGreaterThan(0);
      expect(descriptor.bestFor.length).toBeGreaterThan(0);
    }
  });

  it("valida correctamente los templateId con isHeroTemplateId", () => {
    expect(isHeroTemplateId("split")).toBe(true);
    expect(isHeroTemplateId("workshop")).toBe(true);
    expect(isHeroTemplateId("editorial")).toBe(true);
    expect(isHeroTemplateId("commerce")).toBe(true);
    expect(isHeroTemplateId("button-overlay")).toBe(true);
    expect(isHeroTemplateId("no-existe")).toBe(false);
    expect(isHeroTemplateId(undefined)).toBe(false);
    expect(isHeroTemplateId(null)).toBe(false);
    expect(isHeroTemplateId(42)).toBe(false);
    expect(isHeroTemplateId("")).toBe(false);
  });

  it("resuelve un templateId válido como identidad", () => {
    expect(resolveHeroTemplateId("split")).toBe("split");
    expect(resolveHeroTemplateId("workshop")).toBe("workshop");
    expect(resolveHeroTemplateId("editorial")).toBe("editorial");
    expect(resolveHeroTemplateId("commerce")).toBe("commerce");
    expect(resolveHeroTemplateId("button-overlay")).toBe("button-overlay");
  });

  it("degrada al default cuando el input no matchea", () => {
    expect(resolveHeroTemplateId("no-existe")).toBe(DEFAULT_HERO_TEMPLATE_ID);
    expect(resolveHeroTemplateId(undefined)).toBe(DEFAULT_HERO_TEMPLATE_ID);
    expect(resolveHeroTemplateId(null)).toBe(DEFAULT_HERO_TEMPLATE_ID);
    expect(resolveHeroTemplateId(42)).toBe(DEFAULT_HERO_TEMPLATE_ID);
  });
});

describe("applyTemplateOverrides", () => {
  const baseModules: StorefrontModule[] = [
    buildHero({ variant: "split" }),
    {
      id: "featured-1",
      type: "featuredProducts",
      variant: "grid",
      title: "Destacados",
      limit: 6,
    },
  ];

  it("devuelve la misma lista sin modificar si no hay override", () => {
    const result = applyTemplateOverrides(baseModules, {});
    expect(result).toEqual(baseModules);
  });

  it("devuelve la misma lista si el override no matchea un template conocido", () => {
    const result = applyTemplateOverrides(baseModules, { hero: "inventado" });
    expect(result).toEqual(baseModules);
  });

  it("sobreescribe la variant del hero cuando el override matchea", () => {
    const result = applyTemplateOverrides(baseModules, { hero: "workshop" });
    const heroModule = result.find((m) => m.type === "hero");
    expect(heroModule).toBeDefined();
    expect(heroModule?.type === "hero" && heroModule.variant).toBe("workshop");
  });

  it("acepta URLSearchParams como entrada", () => {
    const params = new URLSearchParams({ hero: "editorial" });
    const result = applyTemplateOverrides(baseModules, params);
    const heroModule = result.find((m) => m.type === "hero");
    expect(heroModule?.type === "hero" && heroModule.variant).toBe("editorial");
  });

  it("no muta los módulos originales", () => {
    const original = buildHero({ variant: "split" });
    const snapshot = { ...original };
    const result = applyTemplateOverrides([original], { hero: "workshop" });
    expect(original).toEqual(snapshot);
    const resultHero = result[0];
    expect(resultHero?.type === "hero" && resultHero.variant).toBe("workshop");
  });

  it("no toca módulos que no son hero", () => {
    const result = applyTemplateOverrides(baseModules, { hero: "workshop" });
    const featured = result.find((m) => m.type === "featuredProducts");
    expect(featured).toEqual(baseModules[1]);
  });

  it("si el override viene como array, toma el primer valor", () => {
    const result = applyTemplateOverrides(baseModules, { hero: ["editorial", "split"] });
    const heroModule = result.find((m) => m.type === "hero");
    expect(heroModule?.type === "hero" && heroModule.variant).toBe("editorial");
  });
});
