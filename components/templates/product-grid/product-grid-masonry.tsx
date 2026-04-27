import type { ProductGridModule } from "@/lib/modules/product-grid";
import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";
import { ProductGridEmptyState, ProductGridHeader } from "./shared";

/**
 * ProductGrid — Masonry de altura variable con CSS columns.
 * 1 col mobile, 2 col tablet, 3 col desktop.
 * Ideal para estética editorial y marcas premium.
 *
 * NOTA: para que masonry funcione visualmente con cards de altura
 * variable, se alternan proporciones de imagen simuladas en V1.
 * En V2 con datos reales esto será natural según el contenido.
 */
export function ProductGridMasonry({ module }: { module: ProductGridModule }) {
  const { cardVariant, cardDisplayOptions } = module.content;
  const ProductCard = resolveProductCardTemplate(cardVariant);
  const products = module.products ?? [];

  return (
    <section className="py-12" data-template="product-grid-masonry" aria-label={module.content.title}>
      <div className="mx-auto max-w-7xl px-4">
        <ProductGridHeader module={module} />
        {products.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {products.map((product) => (
              <div key={product.id} className="mb-4 break-inside-avoid">
                <ProductCard product={product} displayOptions={cardDisplayOptions} />
              </div>
            ))}
          </div>
        ) : (
          <ProductGridEmptyState />
        )}
      </div>
    </section>
  );
}
