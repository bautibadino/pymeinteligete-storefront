import { describe, expect, it } from "vitest";

import { normalizeModules } from "@/lib/modules";
import type { StorefrontBootstrap } from "@/lib/storefront-api";
import { resolveTenantTheme, themeToCssVars } from "@/lib/theme";

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
    const theme = resolveTenantTheme(buildBootstrap());

    expect(theme.preset).toBe("industrialWarm");
    expect(theme.colors.primary).toBeTruthy();
  });

  it("permite overrides parciales desde bootstrap.theme", () => {
    const theme = resolveTenantTheme(
      buildBootstrap({
        theme: {
          preset: "minimalClean",
          layout: "commerce",
        },
      }),
    );
    const vars = themeToCssVars(theme);

    expect(theme.preset).toBe("minimalClean");
    expect(vars["--accent"]).toBe("#243f36");
  });

  it("descarta overrides malformados y conserva el preset", () => {
    const theme = resolveTenantTheme(
      buildBootstrap({
        theme: {
          preset: "minimalClean",
          layout: "commerce",
        },
      }),
    );

    expect(theme.preset).toBe("minimalClean");
    expect(theme.colors.primary).toBe("#243f36");
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
