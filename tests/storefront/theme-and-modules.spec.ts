import { describe, expect, it } from "vitest";

import { buildBootstrapFetchCacheOptions } from "@/lib/fetchers/bootstrap";
import { normalizeModules } from "@/lib/modules";
import type { StorefrontBootstrap } from "@/lib/storefront-api";
import { resolveEffectiveTenantTheme, resolveTenantTheme, themeToCssVars } from "@/lib/theme";

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
        presentation: {
          theme: {
            preset: "editorialDark",
            name: "Draft editorial",
            colors: {
              primary: "#ff5500",
              accent: "#00aa99",
            },
            typography: {
              heading: '"Fraunces", serif',
            },
          },
        },
        branding: {
          storeName: "Tenant Test",
          colors: { primary: "#111827", accent: "#2563eb" },
          typography: { heading: '"Brand Heading"', body: '"Brand Body"' },
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
    expect(theme.typography.body).toBe(
      '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
    );
  });

  it("mapea presentation.theme.overrides al TenantTheme efectivo", () => {
    const theme = resolveEffectiveTenantTheme(
      buildBootstrap({
        presentation: {
          theme: {
            preset: "minimalClean",
            overrides: {
              bg: "#f1f5f9",
              paper: "#ffffff",
              accent: "#123456",
              accentSoft: "rgba(18, 52, 86, 0.14)",
              moduleAccent: "#abcdef",
              moduleAccentSoft: "rgba(171, 205, 239, 0.18)",
              fontHeading: "Brand",
              radiusMd: "6px",
              shadow: "none",
              contentWidth: "1040px",
            },
          },
          pages: [],
          globals: { footer: { enabled: true } },
        },
      }),
    );
    const vars = themeToCssVars(theme);

    expect(theme.preset).toBe("minimalClean");
    expect(vars["--bg"]).toBe("#f1f5f9");
    expect(vars["--paper"]).toBe("#ffffff");
    expect(vars["--accent"]).toBe("#123456");
    expect(vars["--accent-soft"]).toBe("rgba(18, 52, 86, 0.14)");
    expect(vars["--module-accent"]).toBe("#abcdef");
    expect(vars["--module-accent-soft"]).toBe("rgba(171, 205, 239, 0.18)");
    expect(vars["--font-heading"]).toBe("Brand");
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
        presentation: {
          theme: {
            preset: "futurePresentationPreset",
          },
        },
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
      presentation: {
        theme: {
          preset: "minimalClean",
        },
      },
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
