import type { ProductGridModule } from "@/lib/modules/product-grid";
import { ProductGridHeader, ProductGridList } from "./shared";

/**
 * ProductGrid — Grilla de 3 columnas.
 * Responsive: 1 col mobile, 2 col tablet, 3 col desktop.
 * Ideal para destacados en home y secciones de relacionados.
 */
export function ProductGridGrid3({ module }: { module: ProductGridModule }) {
  return (
    <section className="py-12" data-template="product-grid-grid-3" aria-label={module.content.title}>
      <div className="mx-auto max-w-7xl px-4">
        <ProductGridHeader module={module} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridList module={module} />
        </div>
      </div>
    </section>
  );
}
