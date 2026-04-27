import { describe, expect, it } from "vitest";

import {
  getEnabledSortedSections,
  shouldUsePresentation,
} from "@/lib/presentation/render-utils";
import { adaptSectionToModule } from "@/components/presentation/section-adapter";
import type { Presentation, SectionInstance, SectionType } from "@/lib/types/presentation";

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
});
