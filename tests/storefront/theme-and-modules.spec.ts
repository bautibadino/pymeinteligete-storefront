import { describe, expect, it } from "vitest";

import { buildBootstrapFetchCacheOptions } from "@/lib/fetchers/bootstrap";
import { normalizeModules } from "@/lib/modules";
import type { StorefrontBootstrap } from "@/lib/storefront-api";
import { resolveEffectiveTenantTheme, resolveTenantTheme, themeToCssVars } from "@/lib/theme";
import type { Presentation, SectionInstance, SectionType } from "@/lib/types/presentation";

function buildSection<T extends SectionType = "hero">(
  overrides: Partial<SectionInstance<T>> = {},
): SectionInstance<T> {
  return {
    id: "section-test",
    type: "hero" as T,
    variant: "split",
    enabled: true,
    order: 0,
    content: {},
    ...overrides,
  };
}

function buildPresentation(theme: unknown): Presentation {
  return {
    version: 1,
    updatedAt: "2026-04-26T00:00:00.000Z",
    theme: theme as Presentation["theme"],
    globals: {
      announcementBar: buildSection({ type: "announcementBar", variant: "static", enabled: false }),
      header: buildSection({ type: "header", variant: "minimal" }),
      footer: buildSection({ type: "footer", variant: "minimal" }),
    },
    pages: {
      home: { sections: [] },
      catalog: { sections: [] },
      product: { sections: [] },
    },
  };
}

function buildBootstrap(overrides: Partial<StorefrontBootstrap> = {}): StorefrontBootstrap {
  return {
    requestContext: { requestId: "req_1", storefrontVersion: "test", apiVersion: "v1" },
    tenant: {
      tenantSlug: "tenant-test",
      empresaId: "emp_1",
      status: "active",
      resolvedHost: "tenant.test",
      resolvedBy: "custom_domain",
    },
    branding: {
      storeName: "Tenant Test",
      colors: { primary: "#111827" },
    },
    theme: { preset: "industrialWarm", layout: "commerce" },
    seo: {},
    navigation: { headerLinks: [], footerColumns: [] },
    home: { modules: [] },
    commerce: { payment: { visibleMethods: [] } },
    features: {
      reviewsEnabled: false,
      compareEnabled: false,
      wishlistEnabled: false,
      contactBarEnabled: false,
      searchEnabled: false,
    },
    pages: [],
    ...overrides,
  };
}

describe("tenant theme", () => {
  it("usa industrialWarm como fallback seguro", () => {
    const theme = resolveEffectiveTenantTheme(buildBootstrap());

    expect(theme.preset).toBe("industrialWarm");
    expect(theme.colors.primary).toBeTruthy();
  });

  it("usa presentation.theme como fuente visual principal", () => {
    const theme = resolveEffectiveTenantTheme(
      buildBootstrap({
        presentation: buildPresentation({
          preset: "editorialDark",
          name: "Draft editorial",
          colors: {
            primary: "#ff5500",
            accent: "#00aa99",
          },
          typography: {
            heading: '"Fraunces", serif',
            accent: '"Instrument Sans", sans-serif',
          },
        }),
        branding: {
          storeName: "Tenant Test",
          colors: { primary: "#111827", accent: "#2563eb" },
          typography: {
            heading: '"Brand Heading"',
            body: '"Brand Body"',
            accent: '"Brand Accent"',
          },
        },
        theme: {
          preset: "minimalClean",
          layout: "commerce",
        },
      }),
    );

    expect(theme.preset).toBe("editorialDark");
    expect(theme.name).toBe("Draft editorial");
    expect(theme.colors.primary).toBe("#ff5500");
    expect(theme.colors.accent).toBe("#00aa99");
    expect(theme.typography.heading).toBe('"Fraunces", serif');
    expect(theme.typography.accent).toBe('"Instrument Sans", sans-serif');
    expect(theme.typography.body).toBe(
      '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
    );
  });

  it("mapea presentation.theme.overrides al TenantTheme efectivo", () => {
    const theme = resolveEffectiveTenantTheme(
      buildBootstrap({
        presentation: buildPresentation({
          preset: "minimalClean",
          overrides: {
            bg: "#f1f5f9",
            paper: "#ffffff",
            surfaceMuted: "rgba(255,255,255,0.74)",
            surfaceRaised: "rgba(255,255,255,0.92)",
            surfaceOverlay: "rgba(255,255,255,0.84)",
            accent: "#123456",
            accentSoft: "rgba(18, 52, 86, 0.14)",
            focusRing: "rgba(18, 52, 86, 0.24)",
            moduleAccent: "#abcdef",
            moduleAccentSoft: "rgba(171, 205, 239, 0.18)",
            fontHeading: "Brand",
            fontBody: '"Brand Body"',
            radiusMd: "6px",
            shadow: "none",
            contentWidth: "1040px",
          },
        }),
      }),
    );
    const vars = themeToCssVars(theme);

    expect(theme.preset).toBe("minimalClean");
    expect(vars["--bg"]).toBe("#f1f5f9");
    expect(vars["--paper"]).toBe("#ffffff");
    expect(vars["--surface-muted"]).toBe("rgba(255,255,255,0.74)");
    expect(vars["--surface-raised"]).toBe("rgba(255,255,255,0.92)");
    expect(vars["--surface-overlay"]).toBe("rgba(255,255,255,0.84)");
    expect(vars["--accent"]).toBe("#123456");
    expect(vars["--accent-soft"]).toBe("rgba(18, 52, 86, 0.14)");
    expect(vars["--focus-ring"]).toBe("rgba(18, 52, 86, 0.24)");
    expect(vars["--module-accent"]).toBe("#abcdef");
    expect(vars["--module-accent-soft"]).toBe("rgba(171, 205, 239, 0.18)");
    expect(vars["--font-heading"]).toBe("Brand");
    expect(vars["--font-body"]).toBe('"Brand Body"');
    expect(vars["--font-accent"]).toBe('"Brand Body"');
    expect(vars["--radius-md"]).toBe("6px");
    expect(vars["--shadow"]).toBe("none");
    expect(vars["--content-width"]).toBe("1040px");
  });

  it("usa preset legacy y overrides de branding cuando no hay presentation", () => {
    const theme = resolveEffectiveTenantTheme(
      buildBootstrap({
        branding: {
          storeName: "Tenant Test",
          colors: { primary: "#112233", accent: "#445566" },
          typography: { heading: '"Brand Heading"', body: '"Brand Body"' },
        },
        theme: {
          preset: "minimalClean",
          layout: "commerce",
        },
      }),
    );
    const vars = themeToCssVars(theme);

    expect(theme.preset).toBe("minimalClean");
    expect(vars["--accent"]).toBe("#112233");
    expect(vars["--module-accent"]).toBe("#445566");
    expect(vars["--font-heading"]).toBe('"Brand Heading"');
    expect(vars["--font-body"]).toBe('"Brand Body"');
    expect(vars["--font-accent"]).toBe('"Brand Body"');
  });

  it("respeta accent typography explicita desde branding legacy", () => {
    const theme = resolveEffectiveTenantTheme(
      buildBootstrap({
        branding: {
          storeName: "Tenant Test",
          colors: { primary: "#112233" },
          typography: {
            heading: '"Brand Heading"',
            body: '"Brand Body"',
            accent: '"Brand Accent"',
          },
        },
      }),
    );
    const vars = themeToCssVars(theme);

    expect(vars["--font-heading"]).toBe('"Brand Heading"');
    expect(vars["--font-body"]).toBe('"Brand Body"');
    expect(vars["--font-accent"]).toBe('"Brand Accent"');
  });

  it("cae a industrialWarm si el preset legacy es desconocido", () => {
    const theme = resolveEffectiveTenantTheme(
      buildBootstrap({
        theme: {
          preset: "futurePreset",
          layout: "commerce",
        },
      }),
    );

    expect(theme.preset).toBe("industrialWarm");
    expect(theme.colors.primary).toBe("#111827");
  });

  it("no vuelve al legacy cuando presentation.theme existe con preset desconocido", () => {
    const theme = resolveEffectiveTenantTheme(
      buildBootstrap({
        presentation: buildPresentation({
          preset: "futurePresentationPreset",
        }),
        theme: {
          preset: "minimalClean",
          layout: "commerce",
        },
      }),
    );

    expect(theme.preset).toBe("industrialWarm");
    expect(theme.colors.primary).toBe("#8c4319");
  });

  it("mantiene resolveTenantTheme como alias compatible", () => {
    const bootstrap = buildBootstrap({
      presentation: buildPresentation({
        preset: "minimalClean",
      }),
    });

    expect(resolveTenantTheme(bootstrap)).toEqual(resolveEffectiveTenantTheme(bootstrap));
  });

  it("evita cache de bootstrap cuando hay preview token", () => {
    const previewOptions = buildBootstrapFetchCacheOptions({
      host: "tenant.test",
      requestId: "req_1",
      storefrontVersion: "test",
      previewToken: "preview_123",
    });
    const productionOptions = buildBootstrapFetchCacheOptions({
      host: "tenant.test",
      requestId: "req_1",
      storefrontVersion: "test",
    });

    expect(previewOptions).toEqual({ cache: "no-store" });
    expect(productionOptions.cache).toBeUndefined();
    expect(productionOptions.next?.tags).toContain("bootstrap:tenant.test");
  });
});

describe("module normalization", () => {
  it("normaliza aliases y variantes conocidas del bootstrap", () => {
    const bootstrap = buildBootstrap({
      home: {
        modules: [
          {
            id: "hero-1",
            type: "hero",
            enabled: true,
            order: 1,
            payload: {
              variant: "workshop",
              title: "Taller",
              description: "Herramientas para operar.",
            },
          },
          {
            id: "destacados",
            type: "product_collection",
            enabled: true,
            order: 2,
            payload: {
              variant: "spotlight",
              title: "Destacados",
              limit: 4,
            },
          },
        ],
      },
    });
    const theme = resolveTenantTheme(bootstrap);
    const modules = normalizeModules({ bootstrap, theme, host: "tenant.test" });

    expect(modules).toHaveLength(2);
    expect(modules[0]).toMatchObject({ type: "hero", variant: "workshop" });
    expect(modules[1]).toMatchObject({ type: "featuredProducts", variant: "spotlight" });
  });

  it("normaliza los tipos reales que emite bootstrap v1 del ERP", () => {
    const bootstrap = buildBootstrap({
      home: {
        modules: [
          {
            id: "hero",
            type: "hero",
            enabled: true,
            order: 0,
            payload: {
              title: "Neumáticos y Repuestos",
              subtitle: "Envío a todo el país.",
              heroDesktopImage: "https://cdn.example.com/hero.png",
              primaryCta: { label: "Ver catálogo", href: "/catalogo", enabled: true },
            },
          },
          {
            id: "ticker",
            type: "ticker",
            enabled: true,
            order: 1,
            payload: {
              items: [{ text: "6 cuotas sin interés", enabled: true, order: 1 }],
            },
          },
          {
            id: "trust_chips",
            type: "trust_chips",
            enabled: true,
            order: 2,
            payload: {
              chips: [{ label: "Envío gratis", enabled: true, order: 0 }],
            },
          },
          {
            id: "intent_cards",
            type: "intent_cards",
            enabled: true,
            order: 3,
            payload: { title: "Qué estás buscando" },
          },
          {
            id: "featured_products",
            type: "product_carousel" as any,
            enabled: true,
            order: 4,
            payload: { title: "Destacados", count: 8 },
          },
        ],
      },
    });
    const modules = normalizeModules({
      bootstrap,
      theme: resolveEffectiveTenantTheme(bootstrap),
      host: "tenant.test",
    });

    expect(modules.map((module) => module.type)).toEqual([
      "hero",
      "promoBand",
      "trustBar",
      "richText",
      "featuredProducts",
    ]);
    expect(modules[0]).toMatchObject({
      type: "hero",
      image: { src: "https://cdn.example.com/hero.png" },
      primaryAction: { label: "Ver catálogo", href: "/catalogo" },
    });
    expect(modules[1]).toMatchObject({
      type: "promoBand",
      description: "6 cuotas sin interés",
    });
    expect(modules[2]).toMatchObject({
      type: "trustBar",
      items: [{ title: "Envío gratis" }],
    });
    expect(modules[4]).toMatchObject({
      type: "featuredProducts",
      title: "Destacados",
      limit: 8,
    });
  });

  it("genera fallback por preset cuando bootstrap no trae módulos", () => {
    const bootstrap = buildBootstrap({
      theme: { preset: "editorialDark", layout: "commerce" },
      home: { modules: [] },
    });
    const theme = resolveTenantTheme(bootstrap);
    const modules = normalizeModules({ bootstrap, theme, host: "tenant.test" });

    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0]).toMatchObject({ type: "hero", variant: "editorial" });
    expect(modules.some((module) => module.type === "trustBar")).toBe(true);
  });

  it("descarta items malformados y conserva módulos conocidos incompletos", () => {
    const bootstrap = buildBootstrap({
      home: {
        modules: [
          {
            id: "hero-incompleto",
            type: "hero",
            enabled: true,
            order: 1,
            payload: {},
          },
          {
            id: "desconocido",
            type: "modulo-futuro" as any,
            enabled: true,
            order: 2,
            payload: {},
          },
        ],
      },
    });
    const theme = resolveTenantTheme(bootstrap);
    const modules = normalizeModules({ bootstrap, theme, host: "tenant.test" });

    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({
      id: "hero-incompleto",
      type: "hero",
      title: "Tienda online",
    });
  });

  it("usa fallback cuando todos los items de modules son inválidos", () => {
    const bootstrap = buildBootstrap({
      home: {
        modules: [
          { id: "bad", type: "modulo-futuro" as any, enabled: true, order: 1, payload: {} },
        ],
      },
    });
    const theme = resolveTenantTheme(bootstrap);
    const modules = normalizeModules({ bootstrap, theme, host: "tenant.test" });

    expect(modules.length).toBeGreaterThan(1);
    expect(modules[0]).toMatchObject({ type: "hero", variant: "workshop" });
  });
});
