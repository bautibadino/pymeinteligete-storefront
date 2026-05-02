import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HeaderLeftLogoSearch } from "@/components/templates/header/header-left-logo-search";
import {
  DEFAULT_HEADER_TEMPLATE_ID,
  HEADER_CONTENT_SCHEMAS,
  HEADER_TEMPLATE_DESCRIPTORS,
  HEADER_TEMPLATE_IDS,
  isHeaderTemplateId,
  resolveHeaderTemplateId,
} from "@/lib/templates/header-catalog";
import type { HeaderModule } from "@/lib/modules/header";

// ---------------------------------------------------------------------------
// Helper builders
// ---------------------------------------------------------------------------

function buildHeaderModule(overrides: Partial<HeaderModule> = {}): HeaderModule {
  return {
    id: "hdr-test",
    type: "header",
    variant: "centered-logo",
    logoUrl: "https://example.com/logo.png",
    logoAlt: "Empresa",
    showSearch: true,
    showCart: true,
    ...overrides,
  };
}

function renderHtml(module: HeaderModule): string {
  return renderToStaticMarkup(
    createElement(HeaderLeftLogoSearch, { module }),
  ).replaceAll("&amp;", "&");
}

// ---------------------------------------------------------------------------
// Template IDs
// ---------------------------------------------------------------------------

describe("Header template catalog — IDs y constantes", () => {
  it("expone exactamente las 4 variantes documentadas en §7", () => {
    expect(HEADER_TEMPLATE_IDS).toEqual([
      "centered-logo",
      "left-logo-search",
      "sticky-compact",
      "minimal",
    ]);
  });

  it("el default es left-logo-search", () => {
    expect(DEFAULT_HEADER_TEMPLATE_ID).toBe("left-logo-search");
  });

  it("cada id del array aparece como clave en DESCRIPTORS", () => {
    for (const id of HEADER_TEMPLATE_IDS) {
      expect(HEADER_TEMPLATE_DESCRIPTORS[id]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Descriptors
// ---------------------------------------------------------------------------

describe("Header template catalog — Descriptors", () => {
  it("cada descriptor tiene label, description y bestFor no vacíos", () => {
    for (const id of HEADER_TEMPLATE_IDS) {
      const d = HEADER_TEMPLATE_DESCRIPTORS[id];
      expect(d.label.length).toBeGreaterThan(0);
      expect(d.description.length).toBeGreaterThan(0);
      expect(d.bestFor.length).toBeGreaterThan(0);
    }
  });

  it("cada descriptor tiene thumbnailUrl apuntando a /template-thumbnails/", () => {
    for (const id of HEADER_TEMPLATE_IDS) {
      const d = HEADER_TEMPLATE_DESCRIPTORS[id];
      expect(d.thumbnailUrl).toMatch(/^\/template-thumbnails\/header-/);
    }
  });

  it("el id del descriptor coincide con la clave del record", () => {
    for (const id of HEADER_TEMPLATE_IDS) {
      expect(HEADER_TEMPLATE_DESCRIPTORS[id].id).toBe(id);
    }
  });
});

// ---------------------------------------------------------------------------
// Type guard isHeaderTemplateId
// ---------------------------------------------------------------------------

describe("isHeaderTemplateId", () => {
  it("devuelve true para cada variante válida", () => {
    for (const id of HEADER_TEMPLATE_IDS) {
      expect(isHeaderTemplateId(id)).toBe(true);
    }
  });

  it("devuelve false para strings que no son variantes", () => {
    expect(isHeaderTemplateId("split")).toBe(false);
    expect(isHeaderTemplateId("editorial")).toBe(false);
    expect(isHeaderTemplateId("no-existe")).toBe(false);
    expect(isHeaderTemplateId("")).toBe(false);
    expect(isHeaderTemplateId("CENTERED-LOGO")).toBe(false);
  });

  it("devuelve false para valores no-string", () => {
    expect(isHeaderTemplateId(undefined)).toBe(false);
    expect(isHeaderTemplateId(null)).toBe(false);
    expect(isHeaderTemplateId(42)).toBe(false);
    expect(isHeaderTemplateId({})).toBe(false);
    expect(isHeaderTemplateId([])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Resolver resolveHeaderTemplateId
// ---------------------------------------------------------------------------

describe("resolveHeaderTemplateId", () => {
  it("resuelve cada variante válida como identidad", () => {
    for (const id of HEADER_TEMPLATE_IDS) {
      expect(resolveHeaderTemplateId(id)).toBe(id);
    }
  });

  it("degrada al default para inputs inválidos", () => {
    expect(resolveHeaderTemplateId("no-existe")).toBe(DEFAULT_HEADER_TEMPLATE_ID);
    expect(resolveHeaderTemplateId(undefined)).toBe(DEFAULT_HEADER_TEMPLATE_ID);
    expect(resolveHeaderTemplateId(null)).toBe(DEFAULT_HEADER_TEMPLATE_ID);
    expect(resolveHeaderTemplateId(42)).toBe(DEFAULT_HEADER_TEMPLATE_ID);
    expect(resolveHeaderTemplateId("")).toBe(DEFAULT_HEADER_TEMPLATE_ID);
  });

  it("nunca devuelve undefined", () => {
    const inputs = [undefined, null, "", "bad", 0, false, {}, []];
    for (const input of inputs) {
      expect(resolveHeaderTemplateId(input)).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Content Schemas (Zod)
// ---------------------------------------------------------------------------

describe("HEADER_CONTENT_SCHEMAS — validación Zod", () => {
  it("cada variante tiene un schema definido", () => {
    for (const id of HEADER_TEMPLATE_IDS) {
      expect(HEADER_CONTENT_SCHEMAS[id]).toBeDefined();
    }
  });

  it("acepta un content mínimo vacío (todos los campos opcionales)", () => {
    for (const id of HEADER_TEMPLATE_IDS) {
      const result = HEADER_CONTENT_SCHEMAS[id].safeParse({});
      expect(result.success).toBe(true);
    }
  });

  it("acepta content completo válido", () => {
    const fullContent = {
      logoUrl: "https://example.com/logo.png",
      logoHref: "/",
      logoAlt: "Mi Empresa",
      showSearch: true,
      searchPlaceholder: "Buscar...",
      showCart: true,
      showAccount: false,
      navLinks: [
        { label: "Inicio", href: "/" },
        { label: "Catálogo", href: "/catalogo", children: [{ label: "Sub", href: "/sub" }] },
      ],
      topBarLinks: [{ label: "Contacto", href: "/contacto" }],
    };

    for (const id of HEADER_TEMPLATE_IDS) {
      const result = HEADER_CONTENT_SCHEMAS[id].safeParse(fullContent);
      expect(result.success).toBe(true);
    }
  });

  it("acepta content parcial (campos opcionales ausentes)", () => {
    const partialContent = { logoUrl: "https://example.com/logo.svg", showCart: true };

    for (const id of HEADER_TEMPLATE_IDS) {
      const result = HEADER_CONTENT_SCHEMAS[id].safeParse(partialContent);
      expect(result.success).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// HeaderModule type — estructura
// ---------------------------------------------------------------------------

describe("HeaderModule — estructura del tipo", () => {
  it("buildHeaderModule produce un objeto con id y type=header", () => {
    const m = buildHeaderModule();
    expect(m.id).toBe("hdr-test");
    expect(m.type).toBe("header");
  });

  it("el variant de un HeaderModule es resolvible por resolveHeaderTemplateId", () => {
    for (const id of HEADER_TEMPLATE_IDS) {
      const m = buildHeaderModule({ variant: id });
      expect(resolveHeaderTemplateId(m.variant)).toBe(id);
    }
  });

  it("un módulo con variant inválido degrada al default al resolver", () => {
    const m = buildHeaderModule({ variant: "centered-logo" });
    // Forzamos un valor inválido para simular dato corrupto del backend
    const corrupted = { ...m, variant: "no-existe" } as unknown as HeaderModule;
    expect(resolveHeaderTemplateId(corrupted.variant)).toBe(DEFAULT_HEADER_TEMPLATE_ID);
  });
});

describe("HeaderLeftLogoSearch", () => {
  it("renderiza un buscador real con submit explícito hacia /catalogo", () => {
    const html = renderHtml(
      buildHeaderModule({
        variant: "left-logo-search",
        searchPlaceholder: "Buscar cubiertas",
      }),
    );

    expect(html).toContain('action="/catalogo"');
    expect(html).toContain('role="search"');
    expect(html).toContain('type="search"');
    expect(html).toContain('name="search"');
    expect(html).toContain('type="submit"');
    expect(html).toContain(">Buscar<");
  });

  it("eleva la capa del header y del form para no perder interacción ante overlays vecinos", () => {
    const html = renderHtml(
      buildHeaderModule({
        variant: "left-logo-search",
      }),
    );

    expect(html).toContain("relative z-20 isolate w-full");
    expect(html).toContain("pointer-events-auto relative z-10 flex flex-1 items-center");
    expect(html).toContain("pointer-events-auto");
  });

  it("no renderiza acceso de cuenta aunque el contenido legacy lo pida", () => {
    const html = renderHtml(
      buildHeaderModule({
        variant: "left-logo-search",
        showAccount: true,
      }),
    );

    expect(html).not.toContain("Mi cuenta");
  });
});
