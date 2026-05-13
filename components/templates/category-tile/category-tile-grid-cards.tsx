import Link from "next/link";
import type { Route } from "next";
import { Layers } from "lucide-react";

import type { CategoryTileModule } from "@/lib/modules/category-tile";
import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";

/**
 * Category Tile — Grid de tarjetas.
 *
 * Grid 3×2 o 4×2 con imagen + label sobre overlay oscuro.
 * Sin imagen: muestra un placeholder con degradado de tokens.
 * Consume exclusivamente CSS vars del sistema de design tokens
 * (sin hex literales).
 */
export function CategoryTileGridCards({ module }: { module: CategoryTileModule }) {
  const { title, subtitle, tiles } = module;

  return (
    <section
      aria-labelledby={title ? `cat-tile-${module.id}-title` : undefined}
      className="py-10"
      data-template="category-tile-grid-cards"
    >
      {(title || subtitle) ? (
        <div className="mb-6 text-center">
          {title ? (
            <h2
              id={`cat-tile-${module.id}-title`}
              className="font-heading text-2xl font-semibold text-foreground md:text-3xl"
            >
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm text-muted md:text-base">{subtitle}</p>
          ) : null}
        </div>
      ) : null}

      <ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        role="list"
      >
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link
              href={tile.href as Route}
              prefetch={shouldPrefetchStorefrontLink(tile.href)}
              className="group relative block aspect-square overflow-hidden rounded-xl bg-panel-strong shadow-tenant transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {tile.imageUrl ? (
                <img
                  src={tile.imageUrl}
                  alt={tile.label}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-soft to-primary-soft"
                >
                  <Layers className="size-10 text-primary opacity-60" aria-hidden="true" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3">
                <span className="font-heading text-sm font-semibold leading-tight text-white md:text-base">
                  {tile.label}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
