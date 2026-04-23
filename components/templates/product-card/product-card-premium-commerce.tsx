import Link from "next/link";
import type { Route } from "next";
import { ShoppingCart, Truck, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ProductCardData,
  ProductCardDisplayOptions,
  ProductCardBadge,
} from "@/lib/templates/product-card-catalog";

interface ProductCardPremiumCommerceProps {
  product: ProductCardData;
  displayOptions?: ProductCardDisplayOptions;
}

const BADGE_VARIANT_MAP: Record<
  NonNullable<ProductCardBadge["tone"]>,
  "default" | "secondary" | "destructive" | "outline"
> = {
  info: "secondary",
  success: "default",
  warning: "outline",
  accent: "default",
};

/**
 * ProductCard Premium Commerce — paridad BYM.
 * Muestra toda la información comercial relevante:
 * badges de promo, marca, imagen, cuotas, precio tachado,
 * descuento contado y estado de stock. Diseñada para mayoristas
 * y tiendas con cuotas donde el detalle financiero importa.
 */
export function ProductCardPremiumCommerce({
  product,
  displayOptions = {},
}: ProductCardPremiumCommerceProps) {
  const {
    showBrand = true,
    showBadges = true,
    showInstallments = true,
    showCashDiscount = true,
    showAddToCart = true,
  } = displayOptions;

  const {
    name,
    brand,
    imageUrl,
    price,
    compareAtPrice,
    installments,
    cashDiscount,
    badges,
    stock,
    href,
  } = product;

  const isAvailable = stock === undefined || stock.available;
  const stockLabel = stock?.label;
  const hasBadges = showBadges && badges && badges.length > 0;

  return (
    <article
      aria-label={name}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-tenant transition-shadow hover:shadow-md"
      data-template="product-card-premium-commerce"
    >
      {/* Badges superiores */}
      {hasBadges ? (
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
          {badges!.map((badge, i) => (
            <Badge
              key={i}
              variant={badge.tone ? BADGE_VARIANT_MAP[badge.tone] : "default"}
              className="text-[10px] font-semibold"
            >
              {badge.label}
            </Badge>
          ))}
        </div>
      ) : null}

      {/* Imagen */}
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
              className="flex h-full w-full bg-gradient-to-br from-primary-soft to-accent-soft"
            />
          )}

          {/* Indicador de stock sobre imagen */}
          {stockLabel ? (
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 rounded-full bg-panel/90 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
              {stockLabel.toLowerCase().includes("inmediato") ? (
                <Truck className="size-3 shrink-0 text-primary" aria-hidden="true" />
              ) : (
                <Clock className="size-3 shrink-0 text-muted" aria-hidden="true" />
              )}
              <span className="truncate">{stockLabel}</span>
            </div>
          ) : null}
        </div>
      </Link>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Marca */}
        {showBrand && brand ? (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
            {brand}
          </span>
        ) : null}

        {/* Nombre */}
        <Link href={href as Route}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary">
            {name}
          </h3>
        </Link>

        {/* Precio tachado + descuento contado */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {compareAtPrice ? (
            <span className="text-xs text-muted line-through">
              {compareAtPrice.formatted}
            </span>
          ) : null}

          {showCashDiscount && cashDiscount ? (
            <span className="rounded-sm bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {cashDiscount.percent}% OFF contado
            </span>
          ) : null}
        </div>

        {/* Precio final */}
        <p className="text-lg font-bold leading-none text-foreground">
          {price.formatted}
        </p>

        {/* Cuotas */}
        {showInstallments && installments ? (
          <p className="text-xs text-muted">
            {installments.count}x {installments.formatted}
            {installments.interestFree ? (
              <span className="ml-1 font-medium text-primary">sin interés</span>
            ) : null}
          </p>
        ) : null}

        {/* CTA */}
        {isAvailable ? (
          showAddToCart ? (
            <Button
              size="sm"
              className="mt-auto w-full"
              aria-label={`Agregar ${name} al carrito`}
            >
              <ShoppingCart className="mr-2 size-4" aria-hidden="true" />
              Agregar al carrito
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="mt-auto w-full">
              <Link href={href as Route}>Ver producto</Link>
            </Button>
          )
        ) : (
          <Button size="sm" variant="outline" className="mt-auto w-full" disabled>
            No disponible
          </Button>
        )}
      </div>
    </article>
  );
}
