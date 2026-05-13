import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Sparkles } from "lucide-react";

import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { resolveCartItemPrice } from "@/lib/cart/storefront-cart";
import {
  isProductCardShippingBadge,
  ProductCardBadgeIcon,
} from "@/components/templates/product-card/product-card-badge-icon";
import { ProductCardMediaFrame } from "@/components/templates/product-card/product-card-media-frame";
import { ProductCardStockBadge } from "@/components/templates/product-card/product-card-stock-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";
import { themeTypographyStyles } from "@/lib/theme";
import { cn } from "@/lib/utils/cn";
import type {
  ProductCardBadge,
  ProductCardData,
  ProductCardDisplayOptions,
} from "@/lib/templates/product-card-catalog";

interface ProductCardSpotlightCommerceProps {
  product: ProductCardData;
  displayOptions?: ProductCardDisplayOptions | undefined;
}

const BADGE_VARIANT_MAP: Record<
  NonNullable<ProductCardBadge["tone"]>,
  "default" | "secondary" | "warning" | "success"
> = {
  info: "secondary",
  success: "success",
  warning: "warning",
  accent: "default",
};

export function ProductCardSpotlightCommerce({
  product,
  displayOptions = {},
}: ProductCardSpotlightCommerceProps) {
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
  const renderedBadges = showBadges ? badges?.slice(0, 3) ?? [] : [];

  return (
    <article
      aria-label={name}
      className={cn(
        "group relative grid min-h-[11.5rem] overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/95",
        "shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] transition-all duration-300",
        "hover:border-border/80 hover:shadow-[0_24px_52px_-36px_rgba(15,23,42,0.42)]",
        "sm:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]",
      )}
      data-template="product-card-spotlight-commerce"
    >
      <div className="relative border-b border-border/50 bg-[linear-gradient(180deg,rgba(248,250,252,0.94),rgba(255,255,255,0.98))] sm:border-b-0 sm:border-r">
        <Link
          href={href as Route}
          prefetch={shouldPrefetchStorefrontLink(href)}
          className="contents"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ProductCardMediaFrame
            imageUrl={imageUrl}
            alt={name}
            fit="contain"
            frameClassName="aspect-[4/3] bg-transparent sm:h-full sm:min-h-[11.5rem] sm:aspect-auto"
            imageClassName="p-4 transition-transform duration-500 group-hover:scale-[1.02] sm:p-5"
            placeholderClassName="bg-[linear-gradient(135deg,rgba(241,245,249,0.96),rgba(255,255,255,1))]"
          >
            {renderedBadges.length > 0 ? (
              <div className="absolute left-3 top-3 z-10 flex max-w-[78%] flex-wrap gap-1.5">
                {renderedBadges.map((badge, index) => (
                  <Badge
                    key={`${badge.label}-${index}`}
                    variant={badge.tone ? BADGE_VARIANT_MAP[badge.tone] : "outline"}
                    className="border border-white/70 bg-white/88 text-[10px] text-slate-700 shadow-none"
                  >
                    <ProductCardBadgeIcon badge={badge} />
                    {index === 0 && !isProductCardShippingBadge(badge) ? (
                      <Sparkles className="size-3" aria-hidden="true" />
                    ) : null}
                    {badge.label}
                  </Badge>
                ))}
              </div>
            ) : null}

            {showStockBadge ? (
              <ProductCardStockBadge
                stock={stock}
                tone={stockBadgeTone}
                className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] border border-white/70 bg-white/92 shadow-none"
              />
            ) : null}
          </ProductCardMediaFrame>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="space-y-2.5">
          {showBrand && brand ? (
            <span className={themeTypographyStyles.brand("text-[10px] text-muted/90")}>
              {brand}
            </span>
          ) : null}

          <Link href={href as Route} prefetch={shouldPrefetchStorefrontLink(href)}>
            <h3
              className={themeTypographyStyles.cardTitle(
                "line-clamp-2 text-base leading-tight text-foreground transition-colors hover:text-primary sm:text-[1.05rem]",
              )}
            >
              {name}
            </h3>
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
            {compareAtPrice ? (
              <span className="line-through">{compareAtPrice.formatted}</span>
            ) : null}
            {showInstallments && installments ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted/90">
                {installments.count}x {installments.formatted}
                {installments.interestFree ? (
                  <span className="text-foreground">sin interés</span>
                ) : null}
              </span>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Precio final</p>
            <div data-price-row="final" className="flex flex-wrap items-center gap-2">
              <p className="text-[1.6rem] font-semibold leading-none text-foreground">
                {price.formatted}
              </p>
              {showCashDiscount && cashDiscount ? (
                <span
                  data-discount-badge="cash-discount"
                  className="inline-flex items-center rounded-full border border-primary/15 bg-primary-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-950"
                >
                  {cashDiscount.percent}% OFF contado
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Ficha</p>
            <Link
              href={href as Route}
              prefetch={shouldPrefetchStorefrontLink(href)}
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Ver detalle
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            {!isAvailable && stock?.label ? (
              <p className="mt-1 text-xs text-muted">{stock.label}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {showAddToCart ? (
              <AddToCartButton
                item={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  href: product.href,
                  price: resolveCartItemPrice({
                    price: product.price,
                    basePrice: product.basePrice,
                  }),
                  ...(product.brand ? { brand: product.brand } : {}),
                  ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
                }}
                size="sm"
                className="rounded-full px-4"
                disabled={!isAvailable}
                aria-label={`Agregar ${name} al carrito`}
                unavailableLabel="Sin stock"
              >
                Agregar
              </AddToCartButton>
            ) : (
              <Button asChild size="sm" variant="outline" className="rounded-full px-4">
                <Link href={href as Route} prefetch={shouldPrefetchStorefrontLink(href)}>
                  Ver
                </Link>
              </Button>
            )}

            <Button
              asChild
              size="icon"
              variant="outline"
              className="size-9 rounded-full border border-border/70 bg-white/90"
            >
              <Link
                href={href as Route}
                prefetch={shouldPrefetchStorefrontLink(href)}
                aria-label={`Ver ${name}`}
              >
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
