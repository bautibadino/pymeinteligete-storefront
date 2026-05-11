import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/storefront/cart/storefront-cart-page-content", () => ({
  StorefrontCartPageContent: () =>
    createElement("section", { "data-cart-page-content": "true" }, "cart-page-content"),
}));

vi.mock("@/lib/seo", () => ({
  buildTenantMetadata: vi.fn((_snapshot, metadata) => metadata),
  resolveTenantSeoSnapshot: vi.fn(async () => ({
    title: "Demo Store",
  })),
}));

describe("Storefront cart page", () => {
  it("renderiza una página pública de carrito en el storefront externo", async () => {
    const module = await import("@/app/(storefront)/carrito/page");

    const html = renderToStaticMarkup(await module.default());

    expect(html).toContain("Tu carrito");
    expect(html).toContain("Revisá los productos antes de avanzar al checkout.");
    expect(html).toContain("data-cart-page-content=\"true\"");
  });

  it("marca la página como no indexable", async () => {
    const module = await import("@/app/(storefront)/carrito/page");

    await expect(module.generateMetadata()).resolves.toMatchObject({
      pathname: "/carrito",
      title: "Demo Store | Carrito",
      noIndex: true,
    });
  });
});
