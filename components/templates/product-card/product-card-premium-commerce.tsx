import Link from "next/link";
import type { Route } from "next";

import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { themeTypographyStyles } from "@/lib/theme";
import type {
  ProductCardData,
  ProductCardDisplayOptions,
  ProductCardBadge,
} from "@/lib/templates/product-card-catalog";
import { ProductCardStockBadge } from "@/components/templates/product-card/product-card-stock-badge";

interface ProductCardPremiumCommerceProps {
  product: ProductCardData;
  displayOptions?: ProductCardDisplayOptions | undefined;
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
    showStockBadge = true,
    stockBadgeTone = "forest",
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

          {showStockBadge ? (
            <ProductCardStockBadge
              stock={stock}
              tone={stockBadgeTone}
              className="absolute bottom-2 left-2 z-10 backdrop-blur-sm"
            />
          ) : null}
        </div>
      </Link>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Marca */}
        {showBrand && brand ? (
          <span className={themeTypographyStyles.brand("text-[10px] text-muted")}>
            {brand}
          </span>
        ) : null}

        {/* Nombre */}
        <Link href={href as Route}>
          <h3
            className={themeTypographyStyles.cardTitle(
              "line-clamp-2 text-sm leading-snug text-foreground transition-colors hover:text-primary",
            )}
          >
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
            <span
              className={themeTypographyStyles.label(
                "rounded-sm bg-primary-soft px-1.5 py-0.5 text-[10px] text-primary",
              )}
            >
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
        {showAddToCart && isAvailable ? (
          <AddToCartButton
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              href: product.href,
              price: product.price,
              ...(product.brand ? { brand: product.brand } : {}),
              ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
            }}
            size="sm"
            className="mt-auto w-full"
            aria-label={`Agregar ${name} al carrito`}
          />
        ) : !showAddToCart ? (
          <Button asChild size="sm" variant="outline" className="mt-auto w-full">
            <Link href={href as Route}>Ver producto</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="mt-auto w-full" disabled>
            No disponible
          </Button>
        )}
      </div>
    </article>
  );
}
