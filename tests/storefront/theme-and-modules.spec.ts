import { describe, expect, it } from "vitest";

import { normalizeModules } from "@/lib/modules";
import type { StorefrontBootstrap } from "@/lib/storefront-api";
import { resolveTenantTheme, themeToCssVars } from "@/lib/theme";

function buildBootstrap(overrides: Partial<StorefrontBootstrap> = {}): StorefrontBootstrap {
  return {
    shopStatus: "active",
    tenant: {
      tenantSlug: "tenant-test",
      displayName: "Tenant Test",
    },
    branding: {
      name: "Tenant Test",
    },
    ...overrides,
  };
}

describe("tenant theme", () => {
  it("usa industrialWarm como fallback seguro", () => {
    const theme = resolveTenantTheme(buildBootstrap());

    expect(theme.preset).toBe("industrialWarm");
    expect(theme.colors.primary).toBeTruthy();
  });

  it("permite overrides parciales desde bootstrap.branding.theme", () => {
    const theme = resolveTenantTheme(
      buildBootstrap({
        branding: {
          name: "Tenant Test",
          theme: {
            preset: "minimalClean",
            colors: {
              primary: "#123456",
            },
          },
        },
      }),
    );
    const vars = themeToCssVars(theme);

    expect(theme.preset).toBe("minimalClean");
    expect(theme.colors.primary).toBe("#123456");
    expect(vars["--accent"]).toBe("#123456");
  });

  it("descarta overrides malformados y conserva el preset", () => {
    const theme = resolveTenantTheme(
      buildBootstrap({
        branding: {
          name: "Tenant Test",
          theme: {
            preset: "minimalClean",
            colors: {
              primary: ["#bad"],
              accent: "#abcdef",
              unknown: "#000000",
            },
            typography: {
              heading: null,
              body: "Custom Body",
            },
            radii: {
              medium: 12,
              large: "20px",
            },
            shadow: false,
          },
        },
      } as Partial<StorefrontBootstrap>),
    );

    expect(theme.preset).toBe("minimalClean");
    expect(theme.colors.primary).toBe("#243f36");
    expect(theme.colors.accent).toBe("#abcdef");
    expect(theme.typography.heading).toBe('"Optima", "Avenir Next", "Segoe UI", sans-serif');
    expect(theme.typography.body).toBe("Custom Body");
    expect(theme.radii.medium).toBe("12px");
    expect(theme.radii.large).toBe("20px");
    expect(theme.shadow).toBe("0 20px 70px rgba(22, 35, 28, 0.08)");
  });
});

describe("module normalization", () => {
  it("normaliza aliases y variantes conocidas del bootstrap", () => {
    const bootstrap = buildBootstrap({
      modules: [
        {
          id: "hero-1",
          type: "hero",
          variant: "workshop",
          title: "Taller",
          description: "Herramientas para operar.",
        },
        {
          id: "destacados",
          type: "featured-products",
          variant: "spotlight",
          title: "Destacados",
          limit: 4,
        },
      ],
    });
    const theme = resolveTenantTheme(bootstrap);
    const modules = normalizeModules({ bootstrap, theme, host: "tenant.test" });

    expect(modules).toHaveLength(2);
    expect(modules[0]).toMatchObject({ type: "hero", variant: "workshop" });
    expect(modules[1]).toMatchObject({ type: "featuredProducts", variant: "spotlight" });
  });

  it("genera fallback por preset cuando bootstrap no trae módulos", () => {
    const bootstrap = buildBootstrap({
      branding: {
        name: "Tenant Test",
        theme: "editorialDark",
      },
      modules: [],
    });
    const theme = resolveTenantTheme(bootstrap);
    const modules = normalizeModules({ bootstrap, theme, host: "tenant.test" });

    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0]).toMatchObject({ type: "hero", variant: "editorial" });
    expect(modules.some((module) => module.type === "trustBar")).toBe(true);
  });

  it("descarta items malformados y conserva módulos conocidos incompletos", () => {
    const bootstrap = buildBootstrap({
      modules: [
        null,
        "x",
        123,
        [],
        {
          id: "hero-incompleto",
          type: "hero",
        },
        {
          id: "desconocido",
          type: "modulo-futuro",
        },
      ],
    } as Partial<StorefrontBootstrap>);
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
      modules: [null, "x", 123, { type: "modulo-futuro" }],
    } as Partial<StorefrontBootstrap>);
    const theme = resolveTenantTheme(bootstrap);
    const modules = normalizeModules({ bootstrap, theme, host: "tenant.test" });

    expect(modules.length).toBeGreaterThan(1);
    expect(modules[0]).toMatchObject({ type: "hero", variant: "workshop" });
  });
});
