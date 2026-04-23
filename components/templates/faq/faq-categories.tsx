"use client";

import { useMemo, useState } from "react";

import type { FaqModule, FaqItem } from "@/lib/modules/faq";

/**
 * FAQ Categories — Client Component.
 * Preguntas agrupadas en tabs por categoría.
 * Items sin categoría se muestran en tab "General".
 */
const UNCATEGORIZED_LABEL = "General";

export function FaqCategories({ module }: { module: FaqModule }) {
  const { title, subtitle, items } = module;

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const item of items) {
      set.add(item.category ?? UNCATEGORIZED_LABEL);
    }
    return Array.from(set);
  }, [items]);

  const [activeTab, setActiveTab] = useState<string>(categories[0] ?? UNCATEGORIZED_LABEL);

  const visibleItems = useMemo<FaqItem[]>(() => {
    return items.filter(
      (item) => (item.category ?? UNCATEGORIZED_LABEL) === activeTab
    );
  }, [items, activeTab]);

  return (
    <section
      aria-labelledby={title ? `faq-${module.id}-title` : undefined}
      className="py-12"
      data-template="faq-categories"
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

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Categorías de preguntas frecuentes"
          className="mb-8 flex flex-wrap gap-2 border-b border-line pb-4"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeTab === cat}
              aria-controls={`faq-panel-${cat}`}
              id={`faq-tab-${cat}`}
              onClick={() => setActiveTab(cat)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeTab === cat
                  ? "bg-primary text-primary-foreground shadow-tenant"
                  : "bg-panel-strong text-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div
          role="tabpanel"
          id={`faq-panel-${activeTab}`}
          aria-labelledby={`faq-tab-${activeTab}`}
          className="flex flex-col divide-y divide-line"
        >
          {visibleItems.map((item, index) => (
            <details
              key={index}
              name={`faq-cat-group-${module.id}`}
              className="group py-4 open:pb-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span>{item.question}</span>
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

          {visibleItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No hay preguntas en esta categoría.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
