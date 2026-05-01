import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import type { ProductDetailModule } from "@/lib/modules/product-detail";

/**
 * ProductDetail Editorial — imagen hero grande + título + descripción prosa + CTA flotante.
 * Estética minimalista pensada para marcas premium, boutique y lifestyle.
 *
 * Los datos del producto vienen de `module.product` (mock o fetch real).
 * TODO: reemplazar por fetch server-side desde la API del producto.
 */
export function ProductDetailEditorial({ module }: { module: ProductDetailModule }) {
  const { product } = module;

  if (!product) {
    return (
      <section className="py-12" data-template="product-detail-editorial">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-muted">Producto no disponible</p>
        </div>
      </section>
    );
  }

  const mainImage = product.images[0];
  const isAvailable = product.stock === undefined || product.stock.available;

  return (
    <section className="relative" data-template="product-detail-editorial">
      {/* Hero image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt ?? product.name}
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-soft to-accent-soft" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Floating content */}
      <div className="relative mx-auto -mt-24 max-w-3xl px-4 md:-mt-32">
        <div className="rounded-xl border border-border bg-panel p-6 shadow-tenant md:p-10">
          {product.brand ? (
            <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-muted">
              {product.brand}
            </span>
          ) : null}
          <h1 className="mb-4 font-heading text-3xl font-semibold text-foreground md:text-5xl">
            {product.name}
          </h1>
          <p className="mb-6 text-2xl font-bold text-foreground">
            {product.price.formatted}
          </p>

          {product.description ? (
            <p className="mb-8 leading-relaxed text-muted">{product.description}</p>
          ) : null}

          <AddToCartButton
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              href: product.href,
              price: product.price,
              ...(product.brand ? { brand: product.brand } : {}),
              ...(mainImage?.url ? { imageUrl: mainImage.url } : {}),
            }}
            size="lg"
            disabled={!isAvailable}
            unavailableLabel="No disponible"
          />
        </div>
      </div>
    </section>
  );
}
