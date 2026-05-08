import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BymImmersiveHomeLayout } from "@/components/presentation/home-layouts/bym-immersive-home-layout";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import type { Presentation, SectionInstance, SectionType } from "@/lib/types/presentation";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

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
    updatedAt: "2026-05-07T12:00:00.000Z",
    theme: { preset: "minimalClean" },
    globals: {
      announcementBar: buildSection({ type: "announcementBar", variant: "static", enabled: false }),
      header: buildSection({ type: "header", variant: "minimal", enabled: false }),
      footer: buildSection({ type: "footer", variant: "minimal", enabled: false }),
    },
    pages: {
      home: { sections: [] },
      catalog: { sections: [] },
      product: { sections: [] },
    },
    ...overrides,
  };
}

describe("BYM immersive home layout", () => {
  it("renderiza H1, picture responsive, CTAs y beneficios como HTML indexable", () => {
    const presentation = buildPresentation({
      pages: {
        home: {
          layout: {
            variant: "bym-immersive-home-v1",
            content: {
              desktopImage: {
                url: "https://cdn.example.com/campania-horizontal.webp",
                alt: "Pickup equipada sobre ruta",
              },
              mobileImage: {
                src: "https://cdn.example.com/campania-vertical.webp",
                alt: "Detalle de neumático",
              },
              h1: "Neumáticos para seguir trabajando",
              introText: "Equipamiento, cubiertas y atención técnica para flotas y particulares.",
              primaryCta: { label: "Ver catálogo", href: "/catalogo" },
              secondaryCta: { label: "Consultar asesor", href: "/contacto" },
              benefits: [
                {
                  icon: "Truck",
                  title: "Despacho coordinado",
                  description: "Opciones de entrega según disponibilidad operativa.",
                },
                {
                  title: "Asesoramiento técnico",
                  description: "Selección por medida, uso y presupuesto.",
                },
              ],
            },
          },
          sections: [],
        },
        catalog: { sections: [] },
        product: { sections: [] },
      },
    });

    const html = renderToStaticMarkup(
      createElement(BymImmersiveHomeLayout, {
        presentation,
        sections: [],
        renderSections: null,
      }),
    );

    expect(html).toContain('data-home-layout="bym-immersive-home-v1"');
    expect(html).toContain("<h1");
    expect(html).toContain("Neumáticos para seguir trabajando");
    expect(html).toContain("<picture");
    expect(html).toContain("campania-horizontal.webp");
    expect(html).toContain("campania-vertical.webp");
    expect(html).toContain("Pickup equipada sobre ruta");
    expect(html).toContain("Ver catálogo");
    expect(html).toContain("/catalogo");
    expect(html).toContain("Consultar asesor");
    expect(html).toContain("Despacho coordinado");
    expect(html).toContain("Opciones de entrega según disponibilidad operativa.");
    expect(html).toContain("Asesoramiento técnico");
  });

  it("activa el layout por variante sin depender del tenant slug y conserva las secciones normales", () => {
    const presentation = buildPresentation({
      pages: {
        home: {
          layout: {
            variant: "bym-immersive-home-v1",
            content: {
              title: "Tienda inmersiva",
              desktopImage: "https://cdn.example.com/desktop.webp",
              mobileImage: "https://cdn.example.com/mobile.webp",
              benefits: [{ title: "Beneficio visible", description: "Texto público indexable." }],
            },
          },
          sections: [
            buildSection({
              id: "seo-section-1",
              type: "richText",
              variant: "simple",
              content: { html: "<p>Contenido SEO posterior</p>" },
            }),
          ],
        },
        catalog: { sections: [] },
        product: { sections: [] },
      },
    });

    const bootstrap = {
      tenant: {
        tenantSlug: "tenant-generico",
        status: "active",
      },
      branding: {
        storeName: "Tienda Genérica",
      },
    } as StorefrontBootstrap;

    const html = renderToStaticMarkup(
      createElement(PresentationRenderer, {
        presentation,
        page: "home",
        includeGlobals: false,
        context: { bootstrap },
      }),
    );

    expect(html).toContain('data-home-layout="bym-immersive-home-v1"');
    expect(html).toContain("Tienda inmersiva");
    expect(html).toContain('class="presentation-renderer-section"');
    expect(html).toContain('data-section-id="seo-section-1"');
  });

  it("integra announcement/header dentro del primer viewport y reemplaza el hero estándar", () => {
    const presentation = buildPresentation({
      globals: {
        announcementBar: buildSection({
          id: "global-announcement",
          type: "announcementBar",
          variant: "static",
          enabled: true,
          content: { message: "Hasta 6 cuotas sin interés" },
        }),
        header: buildSection({
          id: "global-header",
          type: "header",
          variant: "minimal",
          enabled: true,
          content: { logoAlt: "BYM SRL", showCart: false },
        }),
        footer: buildSection({ type: "footer", variant: "minimal", enabled: false }),
      },
      pages: {
        home: {
          layout: {
            variant: "bym-immersive-home-v1",
            content: {
              h1: "Logística y neumáticos para seguir trabajando",
              desktopImage: "https://cdn.example.com/desktop.webp",
            },
          },
          sections: [
            buildSection({
              id: "legacy-home-hero",
              type: "hero",
              variant: "split",
              content: { title: "Banner anterior" },
            }),
            buildSection({
              id: "seo-section-1",
              type: "richText",
              variant: "simple",
              order: 1,
              content: { html: "<p>Contenido SEO posterior</p>" },
            }),
          ],
        },
        catalog: { sections: [] },
        product: { sections: [] },
      },
    });

    const html = renderToStaticMarkup(
      createElement(PresentationRenderer, {
        presentation,
        page: "home",
        includeGlobals: true,
      }),
    );

    expect(html).toContain('data-bym-hero-chrome="true"');
    expect(html).toContain('data-section-id="global-announcement"');
    expect(html).toContain('data-section-id="global-header"');
    expect(html).toContain('style="height:100dvh;min-height:100dvh;width:100vw"');
    expect(html).not.toContain('data-section-id="legacy-home-hero"');
    expect(html).not.toContain("Banner anterior");
    expect(html).toContain('data-section-id="seo-section-1"');
  });

  it("si no hay layout configurado mantiene el renderer de secciones estándar", () => {
    const presentation = buildPresentation({
      pages: {
        home: {
          sections: [
            buildSection({
              id: "standard-hero",
              type: "hero",
              variant: "split",
              content: { title: "Home estándar" },
            }),
          ],
        },
        catalog: { sections: [] },
        product: { sections: [] },
      },
    });

    const html = renderToStaticMarkup(
      createElement(PresentationRenderer, {
        presentation,
        page: "home",
        includeGlobals: false,
      }),
    );

    expect(html).not.toContain('data-home-layout="bym-immersive-home-v1"');
    expect(html).toContain('class="presentation-renderer-section"');
    expect(html).toContain('data-section-id="standard-hero"');
  });
});
