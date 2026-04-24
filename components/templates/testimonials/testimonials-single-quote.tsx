import { Quote } from "lucide-react";

import type { TestimonialsModule } from "@/lib/modules/testimonials";

/**
 * Testimonials Single Quote — server component.
 *
 * Presenta el primer item de la lista como cita destacada, centrada y grande.
 * Máximo impacto para el caso de éxito más representativo de un tenant.
 * Sin hex literals; consume tokens CSS via Tailwind.
 */
export function TestimonialsSingleQuote({ module }: { module: TestimonialsModule }) {
  const { title, subtitle, items } = module;
  const featured = items[0];

  if (!featured) return null;

  const initials = featured.author
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <section
      aria-labelledby={title ? `testim-${module.id}-title` : undefined}
      className="py-14 md:py-24"
      data-template="testimonials-single-quote"
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

        <figure className="mx-auto max-w-3xl text-center">
          <Quote
            className="mx-auto mb-6 size-12 text-primary-soft"
            aria-hidden="true"
          />

          {featured.rating !== undefined && (
            <div
              aria-label={`Puntuación: ${Math.round(featured.rating)} de 5`}
              className="mb-6 flex justify-center gap-1 text-2xl"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={
                    i < Math.min(5, Math.max(1, Math.round(featured.rating ?? 0)))
                      ? "text-primary"
                      : "text-border"
                  }
                >
                  ★
                </span>
              ))}
            </div>
          )}

          <blockquote className="font-heading text-2xl font-medium leading-relaxed text-foreground md:text-3xl lg:text-4xl">
            &ldquo;{featured.quote}&rdquo;
          </blockquote>

          <figcaption className="mt-8 flex flex-col items-center gap-3">
            {featured.avatarUrl ? (
              <img
                src={featured.avatarUrl}
                alt={featured.author}
                className="size-14 rounded-pill object-cover shadow-tenant"
                loading="lazy"
                width={56}
                height={56}
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex size-14 items-center justify-center rounded-pill bg-primary-soft text-lg font-semibold text-primary"
              >
                {initials}
              </div>
            )}

            <div>
              <cite className="block text-base font-semibold not-italic text-foreground">
                {featured.author}
              </cite>
              {featured.role && (
                <span className="block text-sm text-muted">{featured.role}</span>
              )}
            </div>
          </figcaption>
        </figure>

        {/* Items adicionales como lista reducida debajo */}
        {items.length > 1 && (
          <ul
            role="list"
            aria-label="Otros testimonios"
            className="mt-12 flex flex-wrap justify-center gap-3"
          >
            {items.slice(1).map((item, index) => (
              <li
                key={index}
                className="rounded-pill border border-border bg-paper px-4 py-2 text-sm text-muted shadow-tenant"
              >
                <span className="font-medium text-foreground">{item.author}</span>
                {item.role && ` — ${item.role}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
