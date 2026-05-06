import type { ProductGridModule } from "@/lib/modules/product-grid";
import { ProductGridHeader, ProductGridList } from "./shared";

/**
 * ProductGrid — Grilla de 3 columnas.
 * Responsive: 1 col mobile, 2 col tablet, 3 col desktop.
 * Ideal para destacados en home y secciones de relacionados.
 */
export function ProductGridGrid3({ module }: { module: ProductGridModule }) {
  return (
    <section className="py-10 sm:py-12" data-template="product-grid-grid-3" aria-label={module.content.title}>
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6">
        <ProductGridHeader module={module} />
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-6 lg:grid-cols-3 lg:gap-x-6">
          <ProductGridList module={module} />
        </div>
      </div>
    </section>
  );
}
