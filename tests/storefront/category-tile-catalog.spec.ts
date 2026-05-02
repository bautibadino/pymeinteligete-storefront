import { describe, expect, it } from "vitest";

import {
  CATEGORY_TILE_TEMPLATE_IDS,
  CATEGORY_TILE_TEMPLATE_DESCRIPTORS,
  DEFAULT_CATEGORY_TILE_TEMPLATE_ID,
  defaultCategoryTileContent,
  defaultCategoryTileModule,
  isCategoryTileTemplateId,
  resolveCategoryTileTemplateId,
  validateCategoryTileContent,
  CATEGORY_TILE_CONTENT_SCHEMAS,
} from "@/lib/templates/category-tile-catalog";

// ---------------------------------------------------------------------------
// IDs y constantes
// ---------------------------------------------------------------------------

describe("Category Tile template IDs", () => {
  it("expone las 4 variantes definidas en la especificación", () => {
    expect(CATEGORY_TILE_TEMPLATE_IDS).toEqual([
      "grid-cards",
      "rail-horizontal",
      "masonry",
      "compact-list",
    ]);
  });

  it("el default es 'grid-cards'", () => {
    expect(DEFAULT_CATEGORY_TILE_TEMPLATE_ID).toBe("grid-cards");
  });

  it("el default está incluido en la lista de IDs", () => {
    expect(CATEGORY_TILE_TEMPLATE_IDS).toContain(DEFAULT_CATEGORY_TILE_TEMPLATE_ID);
  });
});

// ---------------------------------------------------------------------------
// Guard: isCategoryTileTemplateId
// ---------------------------------------------------------------------------

describe("isCategoryTileTemplateId", () => {
  it("devuelve true para cada variante válida", () => {
    for (const id of CATEGORY_TILE_TEMPLATE_IDS) {
      expect(isCategoryTileTemplateId(id)).toBe(true);
    }
  });

  it("devuelve false para strings no válidos", () => {
    expect(isCategoryTileTemplateId("no-existe")).toBe(false);
    expect(isCategoryTileTemplateId("hero-split")).toBe(false);
    expect(isCategoryTileTemplateId("")).toBe(false);
  });

  it("devuelve false para valores no-string", () => {
    expect(isCategoryTileTemplateId(undefined)).toBe(false);
    expect(isCategoryTileTemplateId(null)).toBe(false);
    expect(isCategoryTileTemplateId(42)).toBe(false);
    expect(isCategoryTileTemplateId({})).toBe(false);
    expect(isCategoryTileTemplateId([])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Resolver: resolveCategoryTileTemplateId
// ---------------------------------------------------------------------------

describe("resolveCategoryTileTemplateId", () => {
  it("devuelve el mismo id para inputs válidos (identidad)", () => {
    expect(resolveCategoryTileTemplateId("grid-cards")).toBe("grid-cards");
    expect(resolveCategoryTileTemplateId("rail-horizontal")).toBe("rail-horizontal");
    expect(resolveCategoryTileTemplateId("masonry")).toBe("masonry");
    expect(resolveCategoryTileTemplateId("compact-list")).toBe("compact-list");
  });

  it("degrada al default cuando el input no matchea", () => {
    expect(resolveCategoryTileTemplateId("no-existe")).toBe(DEFAULT_CATEGORY_TILE_TEMPLATE_ID);
    expect(resolveCategoryTileTemplateId(undefined)).toBe(DEFAULT_CATEGORY_TILE_TEMPLATE_ID);
    expect(resolveCategoryTileTemplateId(null)).toBe(DEFAULT_CATEGORY_TILE_TEMPLATE_ID);
    expect(resolveCategoryTileTemplateId(42)).toBe(DEFAULT_CATEGORY_TILE_TEMPLATE_ID);
    expect(resolveCategoryTileTemplateId("")).toBe(DEFAULT_CATEGORY_TILE_TEMPLATE_ID);
  });

  it("nunca devuelve undefined", () => {
    const inputs = [undefined, null, 0, "", "foo", {}, []];
    for (const input of inputs) {
      expect(resolveCategoryTileTemplateId(input)).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Descriptores
// ---------------------------------------------------------------------------

describe("CATEGORY_TILE_TEMPLATE_DESCRIPTORS", () => {
  it("existe un descriptor para cada variante", () => {
    for (const id of CATEGORY_TILE_TEMPLATE_IDS) {
      expect(CATEGORY_TILE_TEMPLATE_DESCRIPTORS[id]).toBeDefined();
    }
  });

  it("cada descriptor tiene label, description y bestFor no vacíos", () => {
    for (const id of CATEGORY_TILE_TEMPLATE_IDS) {
      const descriptor = CATEGORY_TILE_TEMPLATE_DESCRIPTORS[id];
      expect(descriptor.label.length).toBeGreaterThan(0);
      expect(descriptor.description.length).toBeGreaterThan(0);
      expect(descriptor.bestFor.length).toBeGreaterThan(0);
    }
  });

  it("cada descriptor tiene thumbnailUrl apuntando a la ruta correcta", () => {
    for (const id of CATEGORY_TILE_TEMPLATE_IDS) {
      const { thumbnailUrl } = CATEGORY_TILE_TEMPLATE_DESCRIPTORS[id];
      expect(thumbnailUrl).toBe(`/template-thumbnails/category-tile-${id}.svg`);
    }
  });

  it("el id del descriptor coincide con la clave del mapa", () => {
    for (const id of CATEGORY_TILE_TEMPLATE_IDS) {
      expect(CATEGORY_TILE_TEMPLATE_DESCRIPTORS[id].id).toBe(id);
    }
  });
});

// ---------------------------------------------------------------------------
// Zod schemas: validateCategoryTileContent
// ---------------------------------------------------------------------------

describe("validateCategoryTileContent", () => {
  const validContent = {
    title: "¿Qué estás buscando?",
    subtitle: "Explorá nuestras categorías",
    tiles: [
      { label: "Neumáticos", href: "/catalogo/neumaticos" },
      { label: "Aceites", href: "/catalogo/aceites", imageUrl: "https://cdn.example.com/aceites.jpg" },
    ],
  };

  it("acepta contenido válido para todas las variantes", () => {
    for (const id of CATEGORY_TILE_TEMPLATE_IDS) {
      const result = validateCategoryTileContent(id, validContent);
      expect(result.success).toBe(true);
    }
  });

  it("acepta contenido sin title ni subtitle (son opcionales)", () => {
    const minimalContent = {
      tiles: [{ label: "Categoría A", href: "/catalogo/a" }],
    };
    const result = validateCategoryTileContent("grid-cards", minimalContent);
    expect(result.success).toBe(true);
  });

  it("rechaza contenido sin tiles", () => {
    const result = validateCategoryTileContent("grid-cards", { title: "Test", tiles: [] });
    expect(result.success).toBe(false);
  });

  it("rechaza tile sin label", () => {
    const result = validateCategoryTileContent("compact-list", {
      tiles: [{ href: "/catalogo/a" }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza tile sin href", () => {
    const result = validateCategoryTileContent("masonry", {
      tiles: [{ label: "Sin href" }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza imageUrl con formato inválido", () => {
    const result = validateCategoryTileContent("rail-horizontal", {
      tiles: [{ label: "A", href: "/a", imageUrl: "no-es-url" }],
    });
    expect(result.success).toBe(false);
  });

  it("acepta imageUrl con URL absoluta válida", () => {
    const result = validateCategoryTileContent("grid-cards", {
      tiles: [{ label: "A", href: "/a", imageUrl: "https://cdn.example.com/img.jpg" }],
    });
    expect(result.success).toBe(true);
  });

  it("acepta metadata aditiva por tile mientras imageUrl siga siendo público", () => {
    const result = validateCategoryTileContent("grid-cards", {
      tiles: [
        {
          label: "A",
          href: "/a",
          imageUrl: "https://cdn.example.com/img.jpg",
          image: {
            url: "https://cdn.example.com/img.jpg",
            alt: "Imagen pública",
            width: 1200,
            height: 1200,
          },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("acepta campo icon como string arbitrario (nombre lucide)", () => {
    const result = validateCategoryTileContent("compact-list", {
      tiles: [{ label: "A", href: "/a", icon: "car" }],
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Schemas por variante (CATEGORY_TILE_CONTENT_SCHEMAS)
// ---------------------------------------------------------------------------

describe("CATEGORY_TILE_CONTENT_SCHEMAS", () => {
  it("existe un schema para cada variante", () => {
    for (const id of CATEGORY_TILE_TEMPLATE_IDS) {
      expect(CATEGORY_TILE_CONTENT_SCHEMAS[id]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Default content y módulo
// ---------------------------------------------------------------------------

describe("defaultCategoryTileContent", () => {
  it("pasa validación Zod de su propia variante default", () => {
    const result = validateCategoryTileContent(
      DEFAULT_CATEGORY_TILE_TEMPLATE_ID,
      defaultCategoryTileContent,
    );
    expect(result.success).toBe(true);
  });

  it("tiene al menos un tile", () => {
    expect(defaultCategoryTileContent.tiles.length).toBeGreaterThan(0);
  });

  it("todos los tiles tienen label y href", () => {
    for (const tile of defaultCategoryTileContent.tiles) {
      expect(tile.label.length).toBeGreaterThan(0);
      expect(tile.href.length).toBeGreaterThan(0);
    }
  });
});

describe("defaultCategoryTileModule", () => {
  it("tiene type 'categoryTile'", () => {
    expect(defaultCategoryTileModule.type).toBe("categoryTile");
  });

  it("tiene la variante default", () => {
    expect(defaultCategoryTileModule.variant).toBe(DEFAULT_CATEGORY_TILE_TEMPLATE_ID);
  });

  it("tiene id no vacío", () => {
    expect(defaultCategoryTileModule.id.length).toBeGreaterThan(0);
  });
});
