"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductGridModule } from "@/lib/modules/product-grid";
import { ProductGridHeader } from "./shared";
import { useCarouselScroll, CarouselGridList } from "./carousel-client";

/**
 * ProductGrid — Carrusel horizontal con flechas de navegación.
 * Scroll nativo con snap points. Botones condicionales según posición.
 * Ideal para destacados en home sin ocupar mucho espacio vertical.
 */
export function ProductGridCarouselArrows({ module }: { module: ProductGridModule }) {
  const { scrollRef, canScrollLeft, canScrollRight, scrollBy, checkScroll } =
    useCarouselScroll();

  return (
    <section
      className="py-12"
      data-template="product-grid-carousel-arrows"
      aria-label={module.content.title}
    >
      <div className="mx-auto max-w-7xl px-4">
        <ProductGridHeader module={module} />

        <div className="relative">
          {/* Flecha izquierda */}
          {canScrollLeft ? (
            <div className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 md:-left-4">
              <Button
                size="icon"
                variant="secondary"
                className="size-10 rounded-full shadow-md"
                onClick={() => scrollBy("left")}
                aria-label="Desplazar a la izquierda"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </Button>
            </div>
          ) : null}

          {/* Contenedor scrolleable */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <CarouselGridList module={module} />
          </div>

          {/* Flecha derecha */}
          {canScrollRight ? (
            <div className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 md:-right-4">
              <Button
                size="icon"
                variant="secondary"
                className="size-10 rounded-full shadow-md"
                onClick={() => scrollBy("right")}
                aria-label="Desplazar a la derecha"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
