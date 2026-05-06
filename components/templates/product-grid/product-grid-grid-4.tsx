import type { ProductGridModule } from "@/lib/modules/product-grid";
import { ProductGridHeader, ProductGridList } from "./shared";

/**
 * ProductGrid — Grilla de 4 columnas.
 * Responsive: 1 col mobile, 2 col tablet, 3 col desktop-lg, 4 col wide.
 * Máxima densidad para catálogos grandes y resultados de búsqueda.
 */
export function ProductGridGrid4({ module }: { module: ProductGridModule }) {
  return (
    <section className="py-10 sm:py-12" data-template="product-grid-grid-4" aria-label={module.content.title}>
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6">
        <ProductGridHeader module={module} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          <ProductGridList module={module} />
        </div>
      </div>
    </section>
  );
}
