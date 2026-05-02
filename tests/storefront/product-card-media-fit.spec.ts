import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProductCardClassic } from "@/components/templates/product-card/product-card-classic";
import { ProductCardCompact } from "@/components/templates/product-card/product-card-compact";
import { ProductCardEditorial } from "@/components/templates/product-card/product-card-editorial";
import { ProductCardPremiumCommerce } from "@/components/templates/product-card/product-card-premium-commerce";
import { ProductCardSpotlightCommerce } from "@/components/templates/product-card/product-card-spotlight-commerce";
import type { ProductCardData } from "@/lib/templates/product-card-catalog";

const product: ProductCardData = {
  id: "prod-1",
  name: "Neumático 205/55 R16",
  slug: "neumatico-205-55-r16",
  brand: "Pirelli",
  imageUrl: "https://example.com/neumatico.png",
  href: "/producto/neumatico-205-55-r16",
  price: {
    amount: 100000,
    currency: "ARS",
    formatted: "$100.000",
  },
  compareAtPrice: {
    amount: 120000,
    formatted: "$120.000",
  },
  cashDiscount: {
    percent: 15,
    formatted: "15% OFF contado",
  },
};

describe("Product card media fit", () => {
  it("usa object-contain en las cards comerciales para evitar recortes agresivos", () => {
    const markup = [
      renderToStaticMarkup(createElement(ProductCardClassic, { product })),
      renderToStaticMarkup(createElement(ProductCardCompact, { product })),
      renderToStaticMarkup(createElement(ProductCardPremiumCommerce, { product })),
      renderToStaticMarkup(createElement(ProductCardSpotlightCommerce, { product })),
    ].join("\n");

    expect(markup).not.toContain("object-cover");
    expect(markup.match(/object-contain/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
    expect(markup).not.toContain("bg-[radial-gradient(");
    expect(markup).not.toContain(
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.9))]",
    );
    expect(markup.match(/bg-white/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  it("mantiene object-cover en la variante editorial, que sí es más aspiracional", () => {
    const markup = renderToStaticMarkup(createElement(ProductCardEditorial, { product }));

    expect(markup).toContain("object-cover");
    expect(markup).not.toContain("object-contain");
  });

  it("muestra el badge de descuento junto al precio final y con texto oscuro en las cards comerciales", () => {
    const markups = [
      renderToStaticMarkup(createElement(ProductCardClassic, { product })),
      renderToStaticMarkup(createElement(ProductCardPremiumCommerce, { product })),
      renderToStaticMarkup(createElement(ProductCardSpotlightCommerce, { product })),
    ];

    for (const markup of markups) {
      expect(markup).toContain('data-discount-badge="cash-discount"');
      expect(markup).toMatch(/data-price-row="final"[\s\S]*data-discount-badge="cash-discount"/);
      expect(markup).toMatch(/data-discount-badge="cash-discount"[\s\S]*text-slate-950/);
    }
  });
});
