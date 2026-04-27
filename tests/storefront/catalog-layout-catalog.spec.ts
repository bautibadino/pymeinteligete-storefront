import { describe, expect, it, vi } from "vitest";

/**
 * Los componentes React viven en archivos .tsx con JSX. El entorno de test
 * corre en Node sin plugin de JSX, por lo que mockeamos los módulos de los
 * componentes para poder testear el registry sin parsear JSX.
 */
vi.mock("@/components/templates/catalog-layout/catalog-layout-filters-sidebar", () => ({
  CatalogLayoutFiltersSidebar: function CatalogLayoutFiltersSidebar() {
    return null;
  },
}));
vi.mock("@/components/templates/catalog-layout/catalog-layout-filters-top", () => ({
  CatalogLayoutFiltersTop: function CatalogLayoutFiltersTop() {
    return null;
  },
}));
vi.mock("@/components/templates/catalog-layout/catalog-layout-infinite-scroll", () => ({
  CatalogLayoutInfiniteScroll: function CatalogLayoutInfiniteScroll() {
    return null;
  },
}));
vi.mock("@/components/templates/catalog-layout/catalog-layout-paginated-classic", () => ({
  CatalogLayoutPaginatedClassic: function CatalogLayoutPaginatedClassic() {
    return null;
  },
}));

import {
  CATALOG_LAYOUT_TEMPLATE_DESCRIPTORS,
  CATALOG_LAYOUT_TEMPLATE_IDS,
  DEFAULT_CATALOG_LAYOUT_TEMPLATE_ID,
  CatalogLayoutContentSchema,
  isCatalogLayoutTemplateId,
  resolveCatalogLayoutTemplateId,
} from "@/lib/templates/catalog-layout-catalog";
import { resolveCatalogLayoutTemplate } from "@/lib/templates/catalog-layout-registry";
import {
  CATALOG_LAYOUT_VARIANTS,
  normalizeCatalogLayoutContent,
} from "@/lib/modules/catalog-layout";

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

describe("CatalogLayout template catalog", () => {
  it("expone las 4 variantes declaradas en el catálogo", () => {
    expect(CATALOG_LAYOUT_TEMPLATE_IDS).toEqual([
      "filters-sidebar",
      "filters-top",
      "infinite-scroll",
      "paginated-classic",
    ]);
  });

  it("el default es filters-sidebar", () => {
    expect(DEFAULT_CATALOG_LAYOUT_TEMPLATE_ID).toBe("filters-sidebar");
  });

  it("CATALOG_LAYOUT_TEMPLATE_IDS coincide con CATALOG_LAYOUT_VARIANTS del módulo", () => {
    expect([...CATALOG_LAYOUT_TEMPLATE_IDS]).toEqual([...CATALOG_LAYOUT_VARIANTS]);
  });

  it("describe cada variante con label, descripción y bestFor no vacíos", () => {
    for (const id of CATALOG_LAYOUT_TEMPLATE_IDS) {
      const descriptor = CATALOG_LAYOUT_TEMPLATE_DESCRIPTORS[id];
      expect(descriptor, `descriptor[${id}] debe existir`).toBeDefined();
      expect(descriptor.id).toBe(id);
      expect(descriptor.label.length).toBeGreaterThan(0);
      expect(descriptor.description.length).toBeGreaterThan(0);
      expect(descriptor.bestFor.length).toBeGreaterThan(0);
    }
  });

  it("cada descriptor tiene thumbnailUrl apuntando al SVG correspondiente", () => {
    for (const id of CATALOG_LAYOUT_TEMPLATE_IDS) {
      const { thumbnailUrl } = CATALOG_LAYOUT_TEMPLATE_DESCRIPTORS[id];
      expect(thumbnailUrl).toBe(`/template-thumbnails/catalog-layout-${id}.svg`);
    }
  });

  it("cada descriptor expone contentSchema (Zod)", () => {
    for (const id of CATALOG_LAYOUT_TEMPLATE_IDS) {
      const { contentSchema } = CATALOG_LAYOUT_TEMPLATE_DESCRIPTORS[id];
      expect(contentSchema).toBeDefined();
      expect(typeof contentSchema.parse).toBe("function");
    }
  });
});

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

describe("isCatalogLayoutTemplateId", () => {
  it("devuelve true para variantes válidas", () => {
    expect(isCatalogLayoutTemplateId("filters-sidebar")).toBe(true);
    expect(isCatalogLayoutTemplateId("filters-top")).toBe(true);
    expect(isCatalogLayoutTemplateId("infinite-scroll")).toBe(true);
    expect(isCatalogLayoutTemplateId("paginated-classic")).toBe(true);
  });

  it("devuelve false para valores inválidos", () => {
    expect(isCatalogLayoutTemplateId("no-existe")).toBe(false);
    expect(isCatalogLayoutTemplateId("filters")).toBe(false);
    expect(isCatalogLayoutTemplateId(undefined)).toBe(false);
    expect(isCatalogLayoutTemplateId(null)).toBe(false);
    expect(isCatalogLayoutTemplateId(42)).toBe(false);
    expect(isCatalogLayoutTemplateId("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Resolver — degrada al default
// ---------------------------------------------------------------------------

describe("resolveCatalogLayoutTemplateId", () => {
  it("resuelve variantes válidas como identidad", () => {
    expect(resolveCatalogLayoutTemplateId("filters-sidebar")).toBe("filters-sidebar");
    expect(resolveCatalogLayoutTemplateId("filters-top")).toBe("filters-top");
    expect(resolveCatalogLayoutTemplateId("infinite-scroll")).toBe("infinite-scroll");
    expect(resolveCatalogLayoutTemplateId("paginated-classic")).toBe("paginated-classic");
  });

  it("degrada al default cuando el input no matchea", () => {
    expect(resolveCatalogLayoutTemplateId("no-existe")).toBe(DEFAULT_CATALOG_LAYOUT_TEMPLATE_ID);
    expect(resolveCatalogLayoutTemplateId(undefined)).toBe(DEFAULT_CATALOG_LAYOUT_TEMPLATE_ID);
    expect(resolveCatalogLayoutTemplateId(null)).toBe(DEFAULT_CATALOG_LAYOUT_TEMPLATE_ID);
    expect(resolveCatalogLayoutTemplateId(42)).toBe(DEFAULT_CATALOG_LAYOUT_TEMPLATE_ID);
    expect(resolveCatalogLayoutTemplateId("")).toBe(DEFAULT_CATALOG_LAYOUT_TEMPLATE_ID);
  });
});

// ---------------------------------------------------------------------------
// Registry — resolveCatalogLayoutTemplate
// ---------------------------------------------------------------------------

describe("resolveCatalogLayoutTemplate", () => {
  it("devuelve un componente (función) para cada id válido", () => {
    for (const id of CATALOG_LAYOUT_TEMPLATE_IDS) {
      const Component = resolveCatalogLayoutTemplate(id);
      expect(typeof Component).toBe("function");
    }
  });

  it("devuelve el componente filters-sidebar (default) cuando el input no matchea", () => {
    const fallback = resolveCatalogLayoutTemplate("no-existe");
    const defaultComp = resolveCatalogLayoutTemplate("filters-sidebar");
    expect(fallback).toBe(defaultComp);
  });

  it("devuelve componentes distintos para cada variante", () => {
    const a = resolveCatalogLayoutTemplate("filters-sidebar");
    const b = resolveCatalogLayoutTemplate("filters-top");
    const c = resolveCatalogLayoutTemplate("infinite-scroll");
    const d = resolveCatalogLayoutTemplate("paginated-classic");

    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
    expect(a).not.toBe(d);
    expect(b).not.toBe(c);
    expect(b).not.toBe(d);
    expect(c).not.toBe(d);
  });
});

// ---------------------------------------------------------------------------
// Schema Zod
// ---------------------------------------------------------------------------

describe("CatalogLayoutContentSchema", () => {
  it("valida un content mínimo (solo cardVariant)", () => {
    const result = CatalogLayoutContentSchema.safeParse({
      cardVariant: "classic",
    });
    expect(result.success).toBe(true);
  });

  it("valida un content completo", () => {
    const result = CatalogLayoutContentSchema.safeParse({
      cardVariant: "premium-commerce",
      cardDisplayOptions: {
        showBrand: true,
        showBadges: true,
        showInstallments: false,
        showCashDiscount: true,
        showAddToCart: true,
      },
      filters: {
        brand: true,
        priceRange: true,
        category: false,
        availability: true,
        rating: false,
      },
      sort: {
        options: ["relevance", "priceAsc", "priceDesc", "newest"],
        default: "relevance",
      },
      perPage: 24,
    });
    expect(result.success).toBe(true);
  });

  it("falla si cardVariant no es válido", () => {
    const result = CatalogLayoutContentSchema.safeParse({
      cardVariant: "no-existe",
    });
    expect(result.success).toBe(false);
  });

  it("falla si falta cardVariant", () => {
    const result = CatalogLayoutContentSchema.safeParse({
      perPage: 12,
    });
    expect(result.success).toBe(false);
  });

  it("falla si perPage es menor a 1", () => {
    const result = CatalogLayoutContentSchema.safeParse({
      cardVariant: "classic",
      perPage: 0,
    });
    expect(result.success).toBe(false);
  });

  it("falla si perPage es mayor a 96", () => {
    const result = CatalogLayoutContentSchema.safeParse({
      cardVariant: "classic",
      perPage: 100,
    });
    expect(result.success).toBe(false);
  });

  it("falla si sort.default no está en sort.options", () => {
    const result = CatalogLayoutContentSchema.safeParse({
      cardVariant: "classic",
      sort: {
        options: ["priceAsc", "priceDesc"],
        default: "popular",
      },
    });
    expect(result.success).toBe(false);
  });

  it("acepta campos opcionales omitidos", () => {
    const result = CatalogLayoutContentSchema.safeParse({
      cardVariant: "compact",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cardDisplayOptions).toBeUndefined();
      expect(result.data.filters).toBeUndefined();
      expect(result.data.sort).toBeUndefined();
      expect(result.data.perPage).toBeUndefined();
    }
  });
});

describe("normalizeCatalogLayoutContent", () => {
  it("degrada cardVariant inválido y conserva controles válidos", () => {
    const normalized = normalizeCatalogLayoutContent({
      cardVariant: "card-inexistente",
      filters: {
        brand: true,
        priceRange: "si",
        availability: false,
      },
      sort: {
        options: ["priceAsc", "popular", "desconocido"],
        default: "desconocido",
      },
      perPage: 500,
    });

    expect(normalized.cardVariant).toBe("classic");
    expect(normalized.filters).toEqual({ brand: true, availability: false });
    expect(normalized.sort).toEqual({ options: ["priceAsc", "popular"], default: "priceAsc" });
    expect(normalized.perPage).toBe(96);
  });

  it("omite sort si el builder no envía opciones válidas", () => {
    const normalized = normalizeCatalogLayoutContent({
      cardVariant: "premium-commerce",
      sort: {
        options: ["desconocido"],
        default: "popular",
      },
    });

    expect(normalized.cardVariant).toBe("premium-commerce");
    expect(normalized.sort).toBeUndefined();
  });
});
