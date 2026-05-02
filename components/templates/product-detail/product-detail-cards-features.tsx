import { Zap, Truck, Shield, CreditCard, Star, Clock, Package, RotateCcw, BadgeCheck, Headset } from "lucide-react";

import type { ProductDetailModule } from "@/lib/modules/product-detail";
import { ProductImageGallery } from "@/components/templates/product-detail/product-detail-showcase-client";
import {
  ProductDetailBadgeGroup,
  ProductDetailBreadcrumbs,
  ProductDetailEmptyState,
  ProductDetailPurchaseCard,
  ProductDetailShell,
  productDetailCardClassName,
  resolveProductDetailCommercialData,
} from "@/components/templates/product-detail/product-detail-primitives";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  zap: Zap,
  truck: Truck,
  shield: Shield,
  "credit-card": CreditCard,
  star: Star,
  clock: Clock,
  package: Package,
  "refresh-cw": RotateCcw,
  "badge-check": BadgeCheck,
  headset: Headset,
};

/**
 * ProductDetail Cards + Features — galería arriba + grid de feature cards abajo.
 * Ideal para destacar beneficios y características del producto.
 *
 * Los datos del producto vienen de `module.product` (mock o fetch real).
 * TODO: reemplazar por fetch server-side desde la API del producto.
 */
export function ProductDetailCardsFeatures({ module }: { module: ProductDetailModule }) {
  const { content, product } = module;
  const { featureCards = [], showBreadcrumbs = false } = content;

  if (!product) {
    return <ProductDetailEmptyState />;
  }

  const mainImage = product.images[0];
  const commercialData = resolveProductDetailCommercialData(content);

  return (
    <ProductDetailShell>
      <div data-template="product-detail-cards-features" className="grid gap-6">
        {showBreadcrumbs ? <ProductDetailBreadcrumbs productName={product.name} /> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <div className="order-2 grid gap-5 lg:order-1">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              aspectClassName="aspect-[5/4] md:aspect-[16/11]"
              imageFit="cover"
            />

            <div className={productDetailCardClassName("hidden p-5 md:p-6 lg:block")}>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div className="grid gap-3">
                  {product.brand ? (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/54">
                      {product.brand}
                    </span>
                  ) : null}
                  <h1 className="font-heading text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                    {product.name}
                  </h1>
                  <ProductDetailBadgeGroup badges={product.badges} />
                </div>
                <p className="font-heading text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  {product.price.formatted}
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <ProductDetailPurchaseCard
              product={product}
              mainImage={mainImage}
              description={product.description}
              commercialData={commercialData}
            />
          </div>
        </div>

        {featureCards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((card, index) => {
              const IconComponent = card.icon ? ICON_MAP[card.icon.toLowerCase()] : undefined;
              return (
                <article
                  key={`${card.title}-${index}`}
                  className={productDetailCardClassName("flex h-full flex-col gap-4 p-5 md:p-6")}
                >
                  <div className="flex size-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.07] text-white/78">
                    {IconComponent ? (
                      <IconComponent className="size-5" aria-hidden={true} />
                    ) : (
                      <Zap className="size-5" aria-hidden="true" />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <h3 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-white">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-7 text-white/66">{card.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </ProductDetailShell>
  );
}
