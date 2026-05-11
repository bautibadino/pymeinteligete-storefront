import { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/marketing/pyme-store-landing-motion", () => ({
  LandingReveal: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => createElement("div", { className }, children),
  PymeStoreLandingMotion: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => createElement("div", { className }, children),
}));

import { PymeStoreLanding } from "@/components/marketing/pyme-store-landing";

function renderLanding() {
  return renderToStaticMarkup(createElement(PymeStoreLanding));
}

describe("PymeInteligente Store landing", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PYME_STORE_WHATSAPP;
  });

  it("renderiza una landing comercial indexable con un único h1 y secciones clave", () => {
    const html = renderLanding();

    expect(html.match(/<h1/g)?.length).toBe(1);
    expect(html).toContain("PymeInteligente Store");
    expect(html).toContain("Qué hacemos");
    expect(html).toContain("Para quién es");
    expect(html).toContain("Qué incluye una tienda personalizada");
    expect(html).toContain("Caso real: BYM Lubricentro");
    expect(html).toContain("Preguntas frecuentes");
    expect(html).toContain("Lanzar mi tienda");
  });

  it("incluye el caso BYM con link visible y CTAs a WhatsApp", () => {
    process.env.NEXT_PUBLIC_PYME_STORE_WHATSAPP = "5493515550000";

    const html = renderLanding();

    expect(html).toContain("https://www.bymlubricentro.com");
    expect(html).toContain('href="https://www.bymlubricentro.com"');
    expect(html).toContain('href="https://wa.me/');
    expect(html).toContain("Quiero una tienda personalizada");
    expect(html).toContain("Coordinar demo por WhatsApp");
  });

  it("no inventa enlace de WhatsApp si falta configuración", () => {
    const html = renderLanding();

    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain('href="https://wa.me/');
  });

  it("no muestra UI de tienda genérica ni estados de tienda no resuelta", () => {
    const html = renderLanding();

    expect(html).not.toContain("Agregar al carrito");
    expect(html).not.toContain("Ver carrito");
    expect(html).not.toContain("Catálogo base");
    expect(html).not.toContain("tienda no resuelta");
    expect(html).not.toContain("shopStatus");
  });
});
