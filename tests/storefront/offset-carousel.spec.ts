import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OffsetCarousel } from "@/components/ui/offset-carousel";
import {
  clampCarouselIndex,
  getCarouselCenterPadding,
  getCarouselItemVisualState,
  getCarouselTrackTransform,
  getVisibleDotIndexes,
} from "@/lib/utils/offset-carousel";

describe("offset carousel helpers", () => {
  it("clampCarouselIndex mantiene el índice dentro del rango válido", () => {
    expect(clampCarouselIndex(-2, 6)).toBe(0);
    expect(clampCarouselIndex(0, 6)).toBe(0);
    expect(clampCarouselIndex(3, 6)).toBe(3);
    expect(clampCarouselIndex(8, 6)).toBe(5);
  });

  it("deriva scale, opacity, zIndex y hidden a partir del offset", () => {
    expect(getCarouselItemVisualState(0)).toEqual({
      hidden: false,
      opacity: 1,
      scale: 1,
      zIndex: 10,
    });

    expect(getCarouselItemVisualState(1)).toEqual({
      hidden: false,
      opacity: 0.55,
      scale: 0.92,
      zIndex: 5,
    });

    expect(getCarouselItemVisualState(-2)).toEqual({
      hidden: false,
      opacity: 0.3,
      scale: 0.84,
      zIndex: 1,
    });

    expect(getCarouselItemVisualState(3)).toEqual({
      hidden: true,
      opacity: 0,
      scale: 0.76,
      zIndex: 0,
    });
  });

  it("permite configurar la progresión visual vía scaleStep y opacityStep", () => {
    expect(
      getCarouselItemVisualState(2, {
        maxVisibleOffset: 3,
        opacityStep: 0.18,
        scaleStep: 0.05,
      }),
    ).toEqual({
      hidden: false,
      opacity: 0.67,
      scale: 0.9,
      zIndex: 1,
    });
  });

  it("devuelve todos los dots cuando la cantidad total es chica", () => {
    expect(getVisibleDotIndexes(5, 2)).toEqual([0, 1, 2, 3, 4]);
  });

  it("reduce la ventana de dots a los más cercanos cuando hay más de siete items", () => {
    expect(getVisibleDotIndexes(9, 0)).toEqual([0, 1, 2, 3, 4]);
    expect(getVisibleDotIndexes(9, 4)).toEqual([2, 3, 4, 5, 6]);
    expect(getVisibleDotIndexes(9, 8)).toEqual([4, 5, 6, 7, 8]);
  });

  it("mueve el track con pixeles medidos para mantener centrados indices avanzados", () => {
    expect(getCarouselTrackTransform(4, 296)).toBe("translate3d(-1184px, 0, 0)");
    expect(getCarouselTrackTransform(4, null)).toBe("translate3d(0, 0, 0)");
  });

  it("calcula padding de centrado con anchos medidos en vez de calc CSS", () => {
    expect(getCarouselCenterPadding(420, 280)).toBe(70);
    expect(getCarouselCenterPadding(260, 280)).toBe(0);
    expect(getCarouselCenterPadding(null, 280)).toBeNull();
  });

  it("renderiza el carrusel con activeIndex inicial, botones clampados y ventana de dots reducida", () => {
    const markup = renderToStaticMarkup(
      createElement(OffsetCarousel<number>, {
        ariaLabel: "Carrusel de prueba",
        items: [0, 1, 2, 3, 4, 5, 6, 7],
        defaultActiveIndex: 0,
        footerStart: createElement("span", { "data-footer-start": "true" }, "Reviews"),
        footerEnd: createElement("span", { "data-footer-end": "true" }, "Cuotas"),
        renderItem: ({ item, offset }) =>
          createElement("div", { "data-item": item, "data-offset": offset }, String(item)),
      }),
    );

    expect(markup).toContain('aria-label="Carrusel de prueba"');
    expect(markup).toContain('aria-label="Mostrar item anterior"');
    expect(markup).toContain('disabled=""');
    expect(markup.match(/role="tab"/g)?.length).toBe(5);
    expect(markup).toContain('data-active="true"');
    expect(markup).toContain('data-offset="0"');
    expect(markup).toContain('data-carousel-footer="true"');
    expect(markup).toContain('data-footer-start="true"');
    expect(markup).toContain('data-footer-end="true"');
  });
});
