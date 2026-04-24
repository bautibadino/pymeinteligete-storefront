import type { FaqModule } from "@/lib/modules/faq";

/**
 * FAQ Accordion — acordeón nativo con `<details>/<summary>`.
 * Server Component: cero JS en el cliente.
 * Una pregunta abierta a la vez mediante el grupo CSS (sin JS).
 */
export function FaqAccordion({ module }: { module: FaqModule }) {
  const { title, subtitle, items } = module;

  return (
    <section
      aria-labelledby={title ? `faq-${module.id}-title` : undefined}
      className="py-12"
      data-template="faq-accordion"
    >
      <div className="mx-auto max-w-3xl px-4">
        {title ? (
          <div className="mb-8 text-center">
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

        <div className="flex flex-col divide-y divide-line">
          {items.map((item, index) => (
            <details
              key={index}
              name={`faq-group-${module.id}`}
              className="group py-4 open:pb-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span>{item.question}</span>
                {/* Chevron via CSS group-open — sin JS */}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
