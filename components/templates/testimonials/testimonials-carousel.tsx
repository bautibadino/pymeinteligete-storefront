"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { TestimonialsModule } from "@/lib/modules/testimonials";

import { TestimonialCard } from "./testimonial-card";

/**
 * Testimonials Carousel — client component.
 *
 * Implementa un carousel accesible con:
 *  - scroll-snap nativo (sin dependencias externas)
 *  - flechas Prev/Next con aria-label y control de teclado
 *  - indicadores de posición (dots)
 *  - scrollbar oculta cross-browser
 *
 * No contiene hex literals; consume exclusivamente tokens CSS via Tailwind.
 */
export function TestimonialsCarousel({ module }: { module: TestimonialsModule }) {
  const { title, subtitle, items } = module;
  const total = items.length;
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.offsetWidth, behavior: "smooth" });
    setCurrent(index);
  }, []);

  const handlePrev = useCallback(
    () => scrollToIndex((current - 1 + total) % total),
    [current, total, scrollToIndex],
  );

  const handleNext = useCallback(
    () => scrollToIndex((current + 1) % total),
    [current, total, scrollToIndex],
  );

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby={title ? `testim-${module.id}-title` : undefined}
      className="py-14 md:py-20"
      data-template="testimonials-carousel"
    >
      <div className="container">
        {(title || subtitle) && (
          <div className="mb-10 text-center">
            {title && (
              <h2
                id={`testim-${module.id}-title`}
                className="font-heading text-3xl font-semibold text-foreground md:text-4xl"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-base text-muted md:text-lg">{subtitle}</p>
            )}
          </div>
        )}

        <div className="relative">
          {/* Scroll container */}
          <div
            ref={scrollRef}
            role="list"
            aria-label="Testimonios"
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          >
            {items.map((item, index) => (
              <div
                key={index}
                role="listitem"
                aria-label={`Testimonio de ${item.author}`}
                className="w-full flex-shrink-0 snap-start px-4 md:px-8"
              >
                <TestimonialCard item={item} size="lg" />
              </div>
            ))}
          </div>

          {/* Flechas de navegación */}
          {total > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Testimonio anterior"
                className="absolute -left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-paper shadow-tenant transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:-left-5"
              >
                <ChevronLeft className="size-5 text-foreground" aria-hidden="true" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Testimonio siguiente"
                className="absolute -right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-paper shadow-tenant transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:-right-5"
              >
                <ChevronRight className="size-5 text-foreground" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Indicadores (dots) */}
        {total > 1 && (
          <div
            role="tablist"
            aria-label="Posición del carousel"
            className="mt-8 flex justify-center gap-2"
          >
            {items.map((_, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={index === current}
                aria-label={`Ir al testimonio ${index + 1}`}
                onClick={() => scrollToIndex(index)}
                className={[
                  "h-2 rounded-pill transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  index === current
                    ? "w-6 bg-primary"
                    : "w-2 bg-border hover:bg-muted",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
