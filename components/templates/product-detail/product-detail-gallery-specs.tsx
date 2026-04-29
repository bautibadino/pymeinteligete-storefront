import Link from "next/link";
import type { Route } from "next";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductDetailModule } from "@/lib/modules/product-detail";

/**
 * ProductDetail Gallery + Specs — layout clásico de ficha de producto.
 * Galería a la izquierda, especificaciones y CTA a la derecha.
 *
 * Los datos del producto vienen de `module.product` (mock o fetch real).
 * TODO: reemplazar por fetch server-side desde la API del producto.
 */
export function ProductDetailGallerySpecs({ module }: { module: ProductDetailModule }) {
  const { content, product } = module;
  const { showBreadcrumbs = true } = content;

  if (!product) {
    return (
      <section className="py-12" data-template="product-detail-gallery-specs">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-muted">Producto no disponible</p>
        </div>
      </section>
    );
  }

  const mainImage = product.images[0];
  const isAvailable = product.stock === undefined || product.stock.available;

  return (
    <section className="py-8 md:py-12" data-template="product-detail-gallery-specs">
      <div className="mx-auto max-w-7xl px-4">
        {showBreadcrumbs ? (
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={"/catalogo" as Route} className="hover:text-foreground">
                  Catálogo
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-panel-strong">
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
            {product.images.length > 1 ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-panel-strong"
                  >
                    <img
                      src={img.url}
                      alt={img.alt ?? product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Specs + CTA */}
          <div className="flex flex-col gap-5">
            {product.brand ? (
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                {product.brand}
              </span>
            ) : null}

            <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
              {product.name}
            </h1>

            {product.badges && product.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.badges.map((badge, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-pill bg-accent-soft px-3 py-1 text-xs font-medium text-accent"
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex flex-col gap-1">
              <p className="text-2xl font-bold text-foreground md:text-3xl">
                {product.price.formatted}
              </p>
              {product.compareAtPrice ? (
                <p className="text-sm text-muted line-through">
                  {product.compareAtPrice.formatted}
                </p>
              ) : null}
              {product.installments ? (
                <p className="text-sm text-muted">
                  {product.installments.count} cuotas de {product.installments.formatted}
                  {product.installments.interestFree ? " sin interés" : ""}
                </p>
              ) : null}
              {product.cashDiscount ? (
                <p className="text-sm font-medium text-accent">
                  {product.cashDiscount.formatted}
                </p>
              ) : null}
            </div>

            {product.stock?.label ? (
              <p
                className={`text-sm ${
                  product.stock.available ? "text-success" : "text-warning"
                }`}
              >
                {product.stock.label}
              </p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button size="lg" className="flex-1" disabled={!isAvailable}>
                <ShoppingCart className="mr-2 size-5" aria-hidden="true" />
                {isAvailable ? "Agregar al carrito" : "No disponible"}
              </Button>
            </div>

            {product.description ? (
              <p className="max-w-prose leading-relaxed text-muted">
                {product.description}
              </p>
            ) : null}

            {product.specifications && product.specifications.length > 0 ? (
              <div className="rounded-lg border border-border bg-panel p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Especificaciones
                </h3>
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <dt className="text-xs text-muted">{spec.label}</dt>
                      <dd className="text-sm font-medium text-foreground">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
