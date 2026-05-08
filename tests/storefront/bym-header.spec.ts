import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const pathnameMock = vi.hoisted(() => ({ value: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock.value,
}));

vi.mock("@/components/storefront/cart/header-cart-button", () => ({
  HeaderCartButton: () => createElement("button", { type: "button" }, "Carrito"),
}));

import { BymHeader } from "@/components/storefront/bym-header";

const announcement = {
  messages: ["6 cuotas sin interés"],
};

function renderHeader() {
  return renderToStaticMarkup(
    createElement(BymHeader, {
      announcement,
      displayName: "BYM SRL",
      links: [{ href: "/", label: "Inicio" }],
    }),
  );
}

describe("BYM header", () => {
  it("mantiene el modo transparente sólo en la home", () => {
    pathnameMock.value = "/";

    const html = renderHeader();

    expect(html).toContain('data-bym-header-state="top"');
    expect(html).toContain("bg-white/[0.03]");
  });

  it("usa chrome sólido oscuro en checkout desde el primer pixel", () => {
    pathnameMock.value = "/checkout";

    const html = renderHeader();

    expect(html).toContain('data-bym-header-state="solid"');
    expect(html).toContain("bg-[#070707]");
    expect(html).toContain("text-[#f4c542]");
    expect(html).not.toContain("bg-white/[0.03]");
    expect(html).not.toContain("backdrop-blur-xl");
  });

  it("cuando hay logo no duplica el nombre textual de la empresa", () => {
    pathnameMock.value = "/";

    const html = renderToStaticMarkup(
      createElement(BymHeader, {
        displayName: "BYM SRL",
        links: [{ href: "/", label: "Inicio" }],
        logoUrl: "https://cdn.example.com/bym-logo.svg",
      }),
    );

    expect(html).toContain("https://cdn.example.com/bym-logo.svg");
    expect(html).toContain('aria-label="Inicio de BYM SRL"');
    expect(html).not.toContain(">BYM SRL<");
  });

  it("renderiza búsqueda y menú lateral mobile sin mezclarlos con carrito", () => {
    pathnameMock.value = "/";

    const html = renderToStaticMarkup(
      createElement(BymHeader, {
        displayName: "BYM SRL",
        links: [
          { href: "/", label: "Inicio" },
          { href: "/catalogo", label: "Catálogo" },
          { href: "/contacto", label: "Contacto" },
        ],
        categories: [
          { categoryId: "cat-1", slug: "autos", name: "Autos" },
          { categoryId: "cat-2", slug: "camionetas", name: "Camionetas" },
        ],
      }),
    );

    expect(html).toContain('data-bym-mobile-actions="true"');
    expect(html).toContain('action="/catalogo"');
    expect(html).toContain('name="search"');
    expect(html).toContain('aria-label="Abrir menú de navegación"');
    expect(html).toContain('data-bym-mobile-menu="true"');
    expect(html).toContain("Catálogo");
    expect(html).toContain("/catalogo?category=autos");
    expect(html).toContain("Camionetas");
  });
});
