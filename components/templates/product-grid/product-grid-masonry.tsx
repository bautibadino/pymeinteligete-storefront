import type { ProductGridModule } from "@/lib/modules/product-grid";
import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";
import { ProductGridHeader, MOCK_PRODUCTS } from "./shared";

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
  const { cardVariant, cardDisplayOptions, limit } = module.content;
  const ProductCard = resolveProductCardTemplate(cardVariant);
  const products = MOCK_PRODUCTS.slice(0, limit ?? 12);

  return (
    <section className="py-12" data-template="product-grid-masonry" aria-label={module.content.title}>
      <div className="mx-auto max-w-7xl px-4">
        <ProductGridHeader module={module} />
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`mb-4 break-inside-avoid ${
                index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-square" : "aspect-[4/5]"
              }`}
            >
              {/* 
                En V1 renderizamos la card normal; el aspect-ratio del wrapper
                simula la variación de altura del masonry. En V2 con contenido
                real, el break-inside-avoid de cada card bastará.
              */}
              <ProductCard product={product} displayOptions={cardDisplayOptions} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
