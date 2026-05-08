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
});
