import type { FaqModule } from "@/lib/modules/faq";

/**
 * FAQ Two-Column — grilla de 2 columnas sin collapse.
 * Server Component: cero JS en el cliente.
 * Ideal para listas cortas de preguntas donde el usuario
 * no necesita expandir/colapsar.
 */
export function FaqTwoColumn({ module }: { module: FaqModule }) {
  const { title, subtitle, items } = module;

  return (
    <section
      aria-labelledby={title ? `faq-${module.id}-title` : undefined}
      className="py-12"
      data-template="faq-two-column"
    >
      <div className="mx-auto max-w-5xl px-4">
        {title ? (
          <div className="mb-10 text-center">
            <h2
              id={`faq-${module.id}-title`}
              className="font-heading text-3xl font-semibold text-foreground md:text-4xl"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-3 text-base text-muted md:text-lg">{subtitle}</p>
            ) : null}
          </div>
        ) : null}

        <dl className="grid gap-8 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-line bg-panel p-6 shadow-tenant"
            >
              <dt className="mb-2 text-base font-semibold text-foreground">
                {item.question}
              </dt>
              <dd className="text-sm leading-relaxed text-muted md:text-base">
                {item.answer}
              </dd>
              {item.category ? (
                <span className="mt-4 inline-block rounded-pill bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                  {item.category}
                </span>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
