"use client";

import { useMemo, useState } from "react";

import type { FaqModule, FaqItem } from "@/lib/modules/faq";

/**
 * FAQ Search — Client Component.
 * Input que filtra preguntas en tiempo real (question + answer + category).
 * Tags de categoría clickeables como filtro adicional.
 */
export function FaqSearch({ module }: { module: FaqModule }) {
  const { title, subtitle, items } = module;
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.category) set.add(item.category);
    }
    return Array.from(set);
  }, [items]);

  const filtered = useMemo<FaqItem[]>(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory ? item.category === activeCategory : true;
      if (!q) return matchesCategory;
      const haystack = `${item.question} ${item.answer} ${item.category ?? ""}`.toLowerCase();
      return matchesCategory && haystack.includes(q);
    });
  }, [items, query, activeCategory]);

  return (
    <section
      aria-labelledby={title ? `faq-${module.id}-title` : undefined}
      className="py-12"
      data-template="faq-search"
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

        {/* Search input */}
        <div className="relative mb-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar una pregunta…"
            aria-label="Buscar preguntas frecuentes"
            className="w-full rounded-lg border border-line bg-panel py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Category tags */}
        {categories.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-pill px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-panel-strong text-muted hover:text-foreground"
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`rounded-pill px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-panel-strong text-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        {/* Results */}
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No encontramos resultados para &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {filtered.map((item, index) => (
              <div key={index} className="py-5">
                <p className="mb-2 text-base font-semibold text-foreground">
                  {item.question}
                </p>
                <p className="text-sm leading-relaxed text-muted md:text-base">
                  {item.answer}
                </p>
                {item.category ? (
                  <span className="mt-3 inline-block rounded-pill bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                    {item.category}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
