import Link from "next/link";
import type { Route } from "next";
import { ChevronRight, Layers } from "lucide-react";

import type { CategoryTileModule } from "@/lib/modules/category-tile";

/**
 * Category Tile — Lista compacta.
 *
 * Lista vertical: ícono (o placeholder) + label + flecha. Sin imágenes
 * de fondo. Máxima densidad, mobile-friendly. Ideal para catálogos con
 * muchas categorías o cuando no hay imágenes disponibles.
 * Consume exclusivamente CSS vars del sistema de design tokens.
 */
export function CategoryTileCompactList({ module }: { module: CategoryTileModule }) {
  const { title, subtitle, tiles } = module;

  return (
    <section
      aria-labelledby={title ? `cat-tile-${module.id}-title` : undefined}
      className="py-8"
      data-template="category-tile-compact-list"
    >
      {(title || subtitle) ? (
        <div className="mb-5">
          {title ? (
            <h2
              id={`cat-tile-${module.id}-title`}
              className="font-heading text-xl font-semibold text-foreground md:text-2xl"
            >
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          ) : null}
        </div>
      ) : null}

      <ul
        className="divide-y divide-line rounded-xl border border-border bg-panel shadow-tenant"
        role="list"
      >
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link
              href={tile.href as Route}
              className="group flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-panel-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary first:rounded-t-xl last:rounded-b-xl"
            >
              <div
                aria-hidden="true"
                className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-soft text-primary"
              >
                {tile.imageUrl ? (
                  <img
                    src={tile.imageUrl}
                    alt=""
                    className="size-9 rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Layers className="size-4" aria-hidden="true" />
                )}
              </div>

              <span className="flex-1 text-sm font-medium leading-tight text-foreground group-hover:text-primary md:text-base">
                {tile.label}
              </span>

              <ChevronRight
                className="size-4 flex-shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
