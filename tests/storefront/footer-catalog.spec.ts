import { describe, expect, it } from "vitest";

import {
  DEFAULT_FOOTER_TEMPLATE_ID,
  FOOTER_TEMPLATE_DESCRIPTORS,
  FOOTER_TEMPLATE_IDS,
  FooterContentSchema,
  isFooterTemplateId,
  resolveFooterTemplateId,
  defaultFooterContent,
} from "@/lib/templates/footer-catalog";
import type { FooterTemplateId } from "@/lib/templates/footer-catalog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildContent(overrides: Record<string, unknown> = {}) {
  return { ...defaultFooterContent, ...overrides };
}

// ---------------------------------------------------------------------------
// IDs y tipos
// ---------------------------------------------------------------------------

describe("Footer template IDs", () => {
  it("expone exactamente las 4 variantes del catálogo", () => {
    expect(FOOTER_TEMPLATE_IDS).toEqual([
      "four-columns",
      "minimal",
      "with-newsletter",
      "corporate",
    ]);
  });

  it("el default es four-columns", () => {
    expect(DEFAULT_FOOTER_TEMPLATE_ID).toBe("four-columns");
  });
});

// ---------------------------------------------------------------------------
// Descriptores
// ---------------------------------------------------------------------------

describe("Footer template descriptors", () => {
  it("describe cada variante con label, descripción, casos de uso y thumbnailUrl", () => {
    for (const id of FOOTER_TEMPLATE_IDS) {
      const desc = FOOTER_TEMPLATE_DESCRIPTORS[id];
      expect(desc).toBeDefined();
      expect(desc.id).toBe(id);
      expect(desc.label.length).toBeGreaterThan(0);
      expect(desc.description.length).toBeGreaterThan(0);
      expect(desc.bestFor.length).toBeGreaterThan(0);
      expect(desc.thumbnailUrl).toMatch(/^\/template-thumbnails\/footer-/);
      expect(desc.thumbnailUrl).toMatch(/\.svg$/);
    }
  });

  it("los thumbnailUrls son únicos por variante", () => {
    const urls = FOOTER_TEMPLATE_IDS.map(
      (id) => FOOTER_TEMPLATE_DESCRIPTORS[id].thumbnailUrl
    );
    const unique = new Set(urls);
    expect(unique.size).toBe(FOOTER_TEMPLATE_IDS.length);
  });
});

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

describe("isFooterTemplateId", () => {
  it("devuelve true para los ids válidos", () => {
    const ids: FooterTemplateId[] = [
      "four-columns",
      "minimal",
      "with-newsletter",
      "corporate",
    ];
    for (const id of ids) {
      expect(isFooterTemplateId(id)).toBe(true);
    }
  });

  it("devuelve false para strings inválidos", () => {
    expect(isFooterTemplateId("no-existe")).toBe(false);
    expect(isFooterTemplateId("")).toBe(false);
    expect(isFooterTemplateId("split")).toBe(false);
  });

  it("devuelve false para tipos no-string", () => {
    expect(isFooterTemplateId(undefined)).toBe(false);
    expect(isFooterTemplateId(null)).toBe(false);
    expect(isFooterTemplateId(42)).toBe(false);
    expect(isFooterTemplateId({})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

describe("resolveFooterTemplateId", () => {
  it("resuelve ids válidos como identidad", () => {
    expect(resolveFooterTemplateId("four-columns")).toBe("four-columns");
    expect(resolveFooterTemplateId("minimal")).toBe("minimal");
    expect(resolveFooterTemplateId("with-newsletter")).toBe("with-newsletter");
    expect(resolveFooterTemplateId("corporate")).toBe("corporate");
  });

  it("degrada al default cuando el input no matchea", () => {
    expect(resolveFooterTemplateId("no-existe")).toBe(DEFAULT_FOOTER_TEMPLATE_ID);
    expect(resolveFooterTemplateId(undefined)).toBe(DEFAULT_FOOTER_TEMPLATE_ID);
    expect(resolveFooterTemplateId(null)).toBe(DEFAULT_FOOTER_TEMPLATE_ID);
    expect(resolveFooterTemplateId(42)).toBe(DEFAULT_FOOTER_TEMPLATE_ID);
    expect(resolveFooterTemplateId("")).toBe(DEFAULT_FOOTER_TEMPLATE_ID);
  });

  it("nunca devuelve undefined", () => {
    const result = resolveFooterTemplateId(undefined);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// Schema Zod — FooterContentSchema
// ---------------------------------------------------------------------------

describe("FooterContentSchema", () => {
  it("acepta el contenido por defecto", () => {
    const result = FooterContentSchema.safeParse(defaultFooterContent);
    expect(result.success).toBe(true);
  });

  it("acepta un objeto vacío (todos los campos son opcionales)", () => {
    const result = FooterContentSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("valida columns con links válidos", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        columns: [
          {
            title: "Empresa",
            links: [{ label: "Contacto", href: "/contacto" }],
          },
        ],
      })
    );
    expect(result.success).toBe(true);
  });

  it("rechaza columns con title vacío", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        columns: [
          {
            title: "",
            links: [{ label: "Link", href: "/link" }],
          },
        ],
      })
    );
    expect(result.success).toBe(false);
  });

  it("rechaza columns sin links", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        columns: [{ title: "Col", links: [] }],
      })
    );
    expect(result.success).toBe(false);
  });

  it("valida socialLinks con plataformas conocidas", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        socialLinks: [
          { platform: "instagram", href: "https://instagram.com/empresa" },
          { platform: "facebook", href: "https://facebook.com/empresa" },
          { platform: "whatsapp", href: "https://wa.me/541100000000" },
          { platform: "youtube", href: "https://youtube.com/@empresa" },
          { platform: "tiktok", href: "https://tiktok.com/@empresa" },
          { platform: "x", href: "https://x.com/empresa" },
        ],
      })
    );
    expect(result.success).toBe(true);
  });

  it("rechaza socialLinks con plataforma inválida", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        socialLinks: [{ platform: "twitter", href: "https://twitter.com" }],
      })
    );
    expect(result.success).toBe(false);
  });

  it("rechaza email inválido en contact", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        contact: { email: "no-es-un-email" },
      })
    );
    expect(result.success).toBe(false);
  });

  it("acepta contact sin email", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        contact: { phone: "+54 11 0000-0000" },
      })
    );
    expect(result.success).toBe(true);
  });

  it("valida newsletter con enabled false", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        newsletter: { enabled: false },
      })
    );
    expect(result.success).toBe(true);
  });

  it("valida newsletter completo", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        newsletter: {
          enabled: true,
          title: "Novedades",
          placeholder: "Tu email",
          successMessage: "¡Listo!",
        },
      })
    );
    expect(result.success).toBe(true);
  });

  it("valida legal links", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        legal: [
          { label: "Términos", href: "/terminos" },
          { label: "Privacidad", href: "/privacidad" },
        ],
      })
    );
    expect(result.success).toBe(true);
  });

  it("rechaza legal link con label vacío", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({
        legal: [{ label: "", href: "/terminos" }],
      })
    );
    expect(result.success).toBe(false);
  });

  it("acepta copyright como string", () => {
    const result = FooterContentSchema.safeParse(
      buildContent({ copyright: "© 2026 Empresa S.A." })
    );
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Contenido por defecto
// ---------------------------------------------------------------------------

describe("defaultFooterContent", () => {
  it("pasa validación del schema", () => {
    const result = FooterContentSchema.safeParse(defaultFooterContent);
    expect(result.success).toBe(true);
  });

  it("tiene al menos 2 columnas", () => {
    expect((defaultFooterContent.columns ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("tiene al menos 1 social link", () => {
    expect((defaultFooterContent.socialLinks ?? []).length).toBeGreaterThanOrEqual(1);
  });
});
