import Link from "next/link";
import type { Route } from "next";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  ProductCardData,
  ProductCardDisplayOptions,
} from "@/lib/templates/product-card-catalog";

interface ProductCardClassicProps {
  product: ProductCardData;
  displayOptions?: ProductCardDisplayOptions;
}

/**
 * ProductCard Classic — layout vertical estándar.
 * Imagen + marca + nombre + precio + botón «Agregar al carrito».
 * Equilibrio entre densidad informativa y limpieza visual.
 */
export function ProductCardClassic({
  product,
  displayOptions = {},
}: ProductCardClassicProps) {
  const {
    showBrand = true,
    showAddToCart = true,
  } = displayOptions;

  const {
    name,
    brand,
    imageUrl,
    price,
    stock,
    href,
  } = product;

  const isAvailable = stock === undefined || stock.available;

  return (
    <article
      aria-label={name}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-tenant transition-shadow hover:shadow-md"
      data-template="product-card-classic"
    >
      <Link href={href as Route} className="contents" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-square overflow-hidden bg-panel-strong">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-soft to-accent-soft"
            />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {showBrand && brand ? (
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            {brand}
          </span>
        ) : null}

        <Link href={href as Route} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary">
            {name}
          </h3>
        </Link>

        <p className="text-base font-bold text-foreground">{price.formatted}</p>

        {showAddToCart ? (
          <Button
            size="sm"
            className="mt-auto w-full"
            disabled={!isAvailable}
            aria-label={
              isAvailable ? `Agregar ${name} al carrito` : `${name} no disponible`
            }
          >
            <ShoppingCart className="mr-2 size-4" aria-hidden="true" />
            {isAvailable ? "Agregar al carrito" : "No disponible"}
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline" className="mt-auto w-full">
            <Link href={href as Route}>Ver producto</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
