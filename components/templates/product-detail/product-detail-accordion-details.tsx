import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductDetailModule } from "@/lib/modules/product-detail";

/**
 * ProductDetail Accordion Details — galería izquierda + descripción + acordeones.
 * Ideal para productos con políticas extensas o múltiples secciones de información.
 *
 * Los datos del producto vienen de `module.product` (mock o fetch real).
 * TODO: reemplazar por fetch server-side desde la API del producto.
 */
export function ProductDetailAccordionDetails({ module }: { module: ProductDetailModule }) {
  const { content, product } = module;
  const { accordionSections = [], showBreadcrumbs = true } = content;

  if (!product) {
    return (
      <section className="py-12" data-template="product-detail-accordion-details">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-muted">Producto no disponible</p>
        </div>
      </section>
    );
  }

  const mainImage = product.images[0];
  const isAvailable = product.stock === undefined || product.stock.available;

  return (
    <section className="py-8 md:py-12" data-template="product-detail-accordion-details">
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
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            {product.brand ? (
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                {product.brand}
              </span>
            ) : null}
            <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
              {product.name}
            </h1>

            <div className="flex flex-col gap-1">
              <p className="text-2xl font-bold text-foreground md:text-3xl">
                {product.price.formatted}
              </p>
              {product.compareAtPrice ? (
                <p className="text-sm text-muted line-through">
                  {product.compareAtPrice.formatted}
                </p>
              ) : null}
            </div>

            <Button size="lg" className="w-full sm:w-auto" disabled={!isAvailable}>
              <ShoppingCart className="mr-2 size-5" aria-hidden="true" />
              {isAvailable ? "Agregar al carrito" : "No disponible"}
            </Button>

            {product.description ? (
              <p className="leading-relaxed text-muted">{product.description}</p>
            ) : null}

            {/* Accordions */}
            {accordionSections.length > 0 ? (
              <div className="flex flex-col divide-y divide-line">
                {accordionSections.map((section, i) => (
                  <details
                    key={i}
                    name={`accordion-${module.id}`}
                    className="group py-4 open:pb-5"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <span>{section.title}</span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                      {section.body}
                    </p>
                  </details>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
