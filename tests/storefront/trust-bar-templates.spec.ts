import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TrustBarInline } from "@/components/templates/trust-bar/trust-bar-inline";
import { TrustBarStackedCards } from "@/components/templates/trust-bar/trust-bar-stacked-cards";
import type { TrustBarModule } from "@/lib/modules/trust-bar";

const baseModule: TrustBarModule = {
  id: "trust-test",
  type: "trustBar",
  variant: "inline",
  content: {
    alignment: "center",
    items: [
      { icon: "truck", title: "Envíos a todo el país", subtitle: "Despacho coordinado" },
      { icon: "shield", title: "Compra protegida", subtitle: "Garantía oficial" },
      { icon: "credit-card", title: "Financiación", subtitle: "Hasta 6 cuotas" },
    ],
  },
};

describe("TrustBar templates", () => {
  it("inline usa estructura de lista para que los beneficios tengan mejor ritmo y lectura", () => {
    const markup = renderToStaticMarkup(
      createElement(TrustBarInline, {
        module: baseModule,
      }),
    );

    expect(markup).toContain("<ul");
    expect(markup.match(/<li\b/g)?.length ?? 0).toBe(baseModule.content.items.length);
  });

  it("stacked-cards renderiza cada beneficio como una card semántica, no como divs genéricos", () => {
    const markup = renderToStaticMarkup(
      createElement(TrustBarStackedCards, {
        module: {
          ...baseModule,
          variant: "stacked-cards",
        },
      }),
    );

    expect(markup).toContain("<ul");
    expect(markup.match(/<article\b/g)?.length ?? 0).toBe(baseModule.content.items.length);
  });
});
