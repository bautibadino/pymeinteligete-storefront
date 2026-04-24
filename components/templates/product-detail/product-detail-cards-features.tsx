import { ShoppingCart, Zap, Truck, Shield, CreditCard, Star, Clock, Package, RotateCcw, BadgeCheck, Headset } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductDetailModule } from "@/lib/modules/product-detail";

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
    return (
      <section className="py-12" data-template="product-detail-cards-features">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-muted">Producto no disponible</p>
        </div>
      </section>
    );
  }

  const mainImage = product.images[0];
  const isAvailable = product.stock === undefined || product.stock.available;

  return (
    <section className="py-8 md:py-12" data-template="product-detail-cards-features">
      <div className="mx-auto max-w-7xl px-4">
        {showBreadcrumbs ? (
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <span className="hover:text-foreground">Inicio</span>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span className="hover:text-foreground">Catálogo</span>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </nav>
        ) : null}

        {/* Hero gallery */}
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-panel-strong md:aspect-[21/9]">
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
        </div>

        {/* Title + CTA row */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            {product.brand ? (
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                {product.brand}
              </span>
            ) : null}
            <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-foreground">{product.price.formatted}</p>
          </div>
          <Button size="lg" disabled={!isAvailable}>
            <ShoppingCart className="mr-2 size-5" aria-hidden="true" />
            {isAvailable ? "Agregar al carrito" : "No disponible"}
          </Button>
        </div>

        {/* Feature cards */}
        {featureCards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card, i) => {
              const IconComponent = card.icon ? ICON_MAP[card.icon.toLowerCase()] : undefined;
              return (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-panel p-5 shadow-tenant"
                >
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                    {IconComponent ? (
                      <IconComponent className="size-5" aria-hidden={true} />
                    ) : (
                      <Zap className="size-5" aria-hidden="true" />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{card.body}</p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
