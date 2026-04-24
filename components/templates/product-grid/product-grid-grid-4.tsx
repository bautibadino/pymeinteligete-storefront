import type { ProductGridModule } from "@/lib/modules/product-grid";
import { ProductGridHeader, ProductGridList } from "./shared";

/**
 * ProductGrid — Grilla de 4 columnas.
 * Responsive: 1 col mobile, 2 col tablet, 3 col desktop-lg, 4 col wide.
 * Máxima densidad para catálogos grandes y resultados de búsqueda.
 */
export function ProductGridGrid4({ module }: { module: ProductGridModule }) {
  return (
    <section className="py-12" data-template="product-grid-grid-4" aria-label={module.content.title}>
      <div className="mx-auto max-w-7xl px-4">
        <ProductGridHeader module={module} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProductGridList module={module} />
        </div>
      </div>
    </section>
  );
}
