import type { TestimonialsModule } from "@/lib/modules/testimonials";

import { TestimonialCard } from "./testimonial-card";

/**
 * Testimonials Grid — server component.
 *
 * Grilla 2×2 (desktop) / 1 columna (mobile) de tarjetas de testimonio.
 * Si hay ≥5 items, expande a 3 columnas en desktop.
 * Sin hex literals; consume tokens CSS via Tailwind.
 */
export function TestimonialsGrid({ module }: { module: TestimonialsModule }) {
  const { title, subtitle, items } = module;

  if (items.length === 0) return null;

  const gridClass =
    items.length >= 5
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-4 sm:grid-cols-2";

  return (
    <section
      aria-labelledby={title ? `testim-${module.id}-title` : undefined}
      className="py-14 md:py-20"
      data-template="testimonials-grid"
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

        <ul role="list" className={gridClass}>
          {items.map((item, index) => (
            <li key={index} role="listitem">
              <TestimonialCard item={item} size="md" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
