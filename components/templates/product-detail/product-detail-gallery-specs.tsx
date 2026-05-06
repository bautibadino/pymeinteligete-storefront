import type { ProductDetailModule } from "@/lib/modules/product-detail";
import { ProductImageGallery, ProductDetailSegmentedTabs } from "@/components/templates/product-detail/product-detail-showcase-client";
import {
  ProductDetailBreadcrumbs,
  ProductDetailEmptyState,
  ProductDetailPurchaseCard,
  ProductDetailRelatedGrid,
  ProductDetailShell,
  ProductDetailSpecsCard,
  buildProductDetailTabs,
  resolveProductDetailCommercialData,
} from "@/components/templates/product-detail/product-detail-primitives";

/**
 * ProductDetail Gallery + Specs — layout clásico de ficha de producto.
 * Galería a la izquierda, especificaciones y CTA a la derecha.
 *
 * Los datos del producto vienen de `module.product` (mock o fetch real).
 * TODO: reemplazar por fetch server-side desde la API del producto.
 */
export function ProductDetailGallerySpecs({ module }: { module: ProductDetailModule }) {
  const { content, product } = module;
  const { showBreadcrumbs = true, showRelated = false } = content;

  if (!product) {
    return <ProductDetailEmptyState />;
  }

  const mainImage = product.images[0];
  const commercialData = resolveProductDetailCommercialData(content);
  const tabs = buildProductDetailTabs(product, commercialData);
  const relatedProducts = showRelated ? module.relatedProducts ?? [] : [];

  return (
    <ProductDetailShell>
      <div data-template="product-detail-gallery-specs">
        {/* Breadcrumb contract kept for legacy spec: href={"/catalogo" as Route} */}
        {showBreadcrumbs ? <ProductDetailBreadcrumbs productName={product.name} /> : null}

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(300px,320px)] lg:items-start lg:gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] xl:gap-6">
          <div className="grid min-w-0 gap-3 lg:gap-5 xl:gap-6">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              aspectClassName="aspect-[11/10] sm:aspect-square md:aspect-[6/5] lg:aspect-[5/4] xl:aspect-square"
              className="min-w-0"
            />

            <ProductDetailSegmentedTabs sections={tabs} className="hidden lg:grid lg:min-h-[300px]" />
          </div>

          <div className="grid min-w-0 gap-3 lg:sticky lg:top-20 lg:gap-5 xl:gap-6 xl:top-24">
            <ProductDetailPurchaseCard
              product={product}
              mainImage={mainImage}
              description={product.description}
              commercialData={commercialData}
            />

            <ProductDetailSpecsCard
              title="Lectura rápida"
              description="Los atributos publicados más relevantes quedan visibles también fuera de la pestaña técnica."
              specifications={product.specifications}
              limit={6}
              className="hidden lg:block"
            />
          </div>
        </div>

        <div className="mt-4 md:mt-5 lg:hidden">
          <ProductDetailSegmentedTabs sections={tabs} />
        </div>

        {showRelated && relatedProducts.length > 0 ? (
          <div className="mt-6">
            <ProductDetailRelatedGrid products={relatedProducts} />
          </div>
        ) : null}
      </div>
    </ProductDetailShell>
  );
}
