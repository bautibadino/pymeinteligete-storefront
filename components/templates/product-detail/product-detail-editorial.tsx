import type { ProductDetailModule } from "@/lib/modules/product-detail";
import { ProductImageGallery } from "@/components/templates/product-detail/product-detail-showcase-client";
import {
  ProductDetailBadgeGroup,
  ProductDetailEmptyState,
  ProductDetailPriceStack,
  ProductDetailPurchaseCard,
  ProductDetailShell,
  productDetailCardClassName,
  resolveProductDetailCommercialData,
} from "@/components/templates/product-detail/product-detail-primitives";

/**
 * ProductDetail Editorial — imagen hero grande + título + descripción prosa + CTA flotante.
 * Estética minimalista pensada para marcas premium, boutique y lifestyle.
 *
 * Los datos del producto vienen de `module.product` (mock o fetch real).
 * TODO: reemplazar por fetch server-side desde la API del producto.
 */
export function ProductDetailEditorial({ module }: { module: ProductDetailModule }) {
  const { content, product } = module;

  if (!product) {
    return <ProductDetailEmptyState />;
  }

  const mainImage = product.images[0];
  const commercialData = resolveProductDetailCommercialData(content);

  return (
    <ProductDetailShell>
      <div data-template="product-detail-editorial" className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] lg:items-end">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
            aspectClassName="aspect-[5/4] md:aspect-[16/10]"
            imageFit="cover"
          />

          <div className={productDetailCardClassName("grid gap-5 p-6 md:p-8")}>
            {product.brand ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/54">
                {product.brand}
              </span>
            ) : null}

            <div className="grid gap-4">
              <h1 className="font-heading text-4xl font-semibold leading-[0.94] tracking-[-0.05em] text-white md:text-6xl">
                {product.name}
              </h1>
              <ProductDetailBadgeGroup badges={product.badges} />
            </div>

            <ProductDetailPriceStack product={product} />

            <p className="max-w-[48ch] text-sm leading-7 text-white/68 md:text-base">
              {product.description ??
                "La narrativa editorial de este producto todavía no fue publicada."}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:items-start">
          <div className={productDetailCardClassName("p-6 md:p-8")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/44">
              Edición curada
            </p>
            <p className="mt-4 max-w-[64ch] text-base leading-8 text-white/74 md:text-lg">
              {product.description ??
                "Este espacio queda reservado para una narrativa más extensa cuando el storefront publique contenido editorial específico para la ficha."}
            </p>
          </div>

          <div className="lg:sticky lg:top-24">
            <ProductDetailPurchaseCard
              product={product}
              mainImage={mainImage}
              description={undefined}
              commercialData={commercialData}
            />
          </div>
        </div>
      </div>
    </ProductDetailShell>
  );
}
