import { describe, expect, it } from "vitest";

import {
  calculateBymHorizontalScrollMetrics,
  calculateBymPinnedHorizontalProgress,
} from "@/lib/storefront/bym-horizontal-scroll";

describe("BYM horizontal benefits scroll", () => {
  it("calcula el recorrido horizontal sin agregar scroll vertical muerto al final", () => {
    const metrics = calculateBymHorizontalScrollMetrics({
      trackWidth: 1560,
      viewportWidth: 390,
      viewportHeight: 780,
    });

    expect(metrics.horizontalTravel).toBe(1170);
    expect(metrics.verticalTravel).toBe(1170);
    expect(metrics.finalReadBuffer).toBe(0);
    expect(metrics.stickyViewportHeight).toBe(780);
    expect(metrics.sectionHeight).toBe(1950);
  });

  it("mantiene una seccion normal si el track no supera el viewport", () => {
    const metrics = calculateBymHorizontalScrollMetrics({
      trackWidth: 360,
      viewportWidth: 390,
      viewportHeight: 780,
    });

    expect(metrics.horizontalTravel).toBe(0);
    expect(metrics.verticalTravel).toBe(0);
    expect(metrics.finalReadBuffer).toBe(0);
    expect(metrics.sectionHeight).toBe(780);
  });

  it("convierte la posicion vertical sticky en progreso horizontal clampado", () => {
    const scrollDistance = 1170;
    const stickyOffset = 96;

    expect(
      calculateBymPinnedHorizontalProgress({
        sectionTop: 160,
        stickyOffset,
        scrollDistance,
      }),
    ).toBe(0);

    expect(
      calculateBymPinnedHorizontalProgress({
        sectionTop: -489,
        stickyOffset,
        scrollDistance,
      }),
    ).toBe(0.5);

    expect(
      calculateBymPinnedHorizontalProgress({
        sectionTop: -1200,
        stickyOffset,
        scrollDistance,
      }),
    ).toBe(1);
  });
});
