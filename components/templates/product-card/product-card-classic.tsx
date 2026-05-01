import Link from "next/link";
import type { Route } from "next";

import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { themeTypographyStyles } from "@/lib/theme";
import type {
  ProductCardData,
  ProductCardDisplayOptions,
} from "@/lib/templates/product-card-catalog";
import { ProductCardStockBadge } from "@/components/templates/product-card/product-card-stock-badge";

interface ProductCardClassicProps {
  product: ProductCardData;
  displayOptions?: ProductCardDisplayOptions | undefined;
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

          {showStockBadge ? (
            <ProductCardStockBadge
              stock={stock}
              tone={stockBadgeTone}
              className="absolute bottom-2 left-2 z-10 backdrop-blur-sm"
            />
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {showBrand && brand ? (
          <span className={themeTypographyStyles.brand("text-xs text-muted")}>
            {brand}
          </span>
        ) : null}

        <Link href={href as Route} className="flex-1">
          <h3
            className={themeTypographyStyles.cardTitle(
              "line-clamp-2 text-sm leading-snug text-foreground transition-colors hover:text-primary",
            )}
          >
            {name}
          </h3>
        </Link>

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

        <p className="text-base font-bold text-foreground">{price.formatted}</p>

        {showInstallments && installments ? (
          <p className="text-xs text-muted">
            {installments.count}x {installments.formatted}
            {installments.interestFree ? (
              <span className="ml-1 font-medium text-primary">sin interés</span>
            ) : null}
          </p>
        ) : null}

        {showAddToCart ? (
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
            disabled={!isAvailable}
            aria-label={
              isAvailable ? `Agregar ${name} al carrito` : `${name} no disponible`
            }
            unavailableLabel="No disponible"
          />
        ) : (
          <Button asChild size="sm" variant="outline" className="mt-auto w-full">
            <Link href={href as Route}>Ver producto</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
