import Link from "next/link";
import type { Route } from "next";
import { Layers } from "lucide-react";

import type { CategoryTileModule } from "@/lib/modules/category-tile";
import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";

/**
 * Category Tile — Rail horizontal.
 *
 * Scroll horizontal en cualquier viewport. Tiles circulares con imagen
 * o ícono. Ideal para mobile-first y catálogos con muchas categorías.
 * Consume exclusivamente CSS vars del sistema de design tokens.
 */
export function CategoryTileRailHorizontal({ module }: { module: CategoryTileModule }) {
  const { title, subtitle, tiles } = module;

  return (
    <section
      aria-labelledby={title ? `cat-tile-${module.id}-title` : undefined}
      className="py-8"
      data-template="category-tile-rail-horizontal"
    >
      {(title || subtitle) ? (
        <div className="mb-5 px-1">
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

      <div className="relative">
        <ul
          className="flex gap-4 overflow-x-auto pb-3 scrollbar-none"
          role="list"
          style={{ scrollbarWidth: "none" }}
        >
          {tiles.map((tile) => (
            <li key={tile.href} className="flex-shrink-0">
              <Link
                href={tile.href as Route}
                prefetch={shouldPrefetchStorefrontLink(tile.href)}
                className="group flex flex-col items-center gap-2 focus-visible:outline-none"
              >
                <div className="relative size-20 overflow-hidden rounded-full border-2 border-border bg-panel-strong shadow-tenant transition-transform duration-200 group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-primary md:size-24">
                  {tile.imageUrl ? (
                    <img
                      src={tile.imageUrl}
                      alt={tile.label}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-soft to-primary-soft"
                    >
                      <Layers className="size-8 text-primary opacity-60" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <span className="max-w-[80px] text-center text-xs font-medium leading-tight text-foreground md:max-w-[96px] md:text-sm">
                  {tile.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
