import type { TestimonialsModule } from "@/lib/modules/testimonials";

import { TestimonialCard } from "./testimonial-card";

/**
 * Testimonials Masonry — server component.
 *
 * Layout asimétrico usando `columns` CSS (Tailwind `columns-*`).
 * Cada tarjeta tiene altura natural según el largo del quote,
 * generando un mosaico visual sin JavaScript de layout.
 * Sin hex literals; consume tokens CSS via Tailwind.
 */
export function TestimonialsMasonry({ module }: { module: TestimonialsModule }) {
  const { title, subtitle, items } = module;

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby={title ? `testim-${module.id}-title` : undefined}
      className="py-14 md:py-20"
      data-template="testimonials-masonry"
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

        {/*
          CSS Columns masonry: el navegador distribuye los items verticalmente
          primero, de arriba a abajo en cada columna. `break-inside-avoid`
          evita que una card se parta entre columnas.
        */}
        <ul
          role="list"
          className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid"
        >
          {items.map((item, index) => (
            <li key={index} role="listitem">
              <TestimonialCard item={item} size="sm" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
