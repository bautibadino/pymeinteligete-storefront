"use client";

import { OffsetCarousel } from "@/components/ui/offset-carousel";
import type { ProductGridModule } from "@/lib/modules/product-grid";
import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";
import { ProductGridEmptyState } from "./shared";
import { ProductGridHeader } from "./shared";

/**
 * ProductGrid — Carrusel horizontal con flechas de navegación.
 * Usa el mismo motor de activeIndex del spotlight, pero sin compresión visual.
 * Ideal para destacados en home sin ocupar mucho espacio vertical.
 */
export function ProductGridCarouselArrows({ module }: { module: ProductGridModule }) {
  const { cardVariant, cardDisplayOptions } = module.content;
  const ProductCard = resolveProductCardTemplate(cardVariant);
  const products = module.products ?? [];

  if (products.length === 0) {
    return <ProductGridEmptyState />;
  }

  return (
    <section
      className="py-10 sm:py-12"
      data-template="product-grid-carousel-arrows"
      aria-label={module.content.title}
    >
      <div className="mx-auto max-w-[86rem] px-4 sm:px-6">
        <ProductGridHeader module={module} />

        <OffsetCarousel
          ariaLabel={module.content.title || "Carrusel de productos"}
          items={products}
          getItemKey={(product) => product.id}
          itemWidth="clamp(14rem, 20vw, 17rem)"
          peek="0.75rem"
          gap="1rem"
          scaleStep={0}
          opacityStep={0}
          maxVisibleOffset={products.length}
          showDots={false}
          viewportClassName="pb-2"
          trackClassName="pb-2"
          renderItem={({ item, index, offset, isActive }) => (
            <div
              data-carousel-index={index}
              data-carousel-offset={offset}
              className={isActive ? "shadow-[0_24px_48px_-38px_rgba(15,23,42,0.24)]" : "shadow-none"}
            >
              <ProductCard product={item} displayOptions={cardDisplayOptions} />
            </div>
          )}
        />
      </div>
    </section>
  );
}
