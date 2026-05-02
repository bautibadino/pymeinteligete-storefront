import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Sparkles } from "lucide-react";

import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { resolveCartItemPrice } from "@/lib/cart/storefront-cart";
import { ProductCardMediaFrame } from "@/components/templates/product-card/product-card-media-frame";
import { ProductCardStockBadge } from "@/components/templates/product-card/product-card-stock-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70",
        "bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.55)]",
        "transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-40px_rgba(15,23,42,0.65)]",
      )}
      data-template="product-card-spotlight-commerce"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-28 rounded-b-full bg-primary/10 blur-3xl"
      />

      <Link href={href as Route} className="contents" tabIndex={-1} aria-hidden="true">
        <ProductCardMediaFrame
          imageUrl={imageUrl}
          alt={name}
          fit="contain"
          frameClassName="aspect-[4/4.8]"
          imageClassName="p-5 transition-transform duration-500 group-hover:scale-[1.02]"
          placeholderClassName="bg-gradient-to-br from-primary-soft via-panel-strong to-accent-soft"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/18 via-slate-950/0 to-white/10" />

          {renderedBadges.length > 0 ? (
            <div className="absolute left-4 top-4 z-10 flex max-w-[78%] flex-wrap gap-2">
              {renderedBadges.map((badge, index) => (
                <Badge
                  key={`${badge.label}-${index}`}
                  variant={badge.tone ? BADGE_VARIANT_MAP[badge.tone] : "soft"}
                  className="backdrop-blur-sm"
                >
                  {index === 0 ? <Sparkles className="size-3" aria-hidden="true" /> : null}
                  {badge.label}
                </Badge>
              ))}
            </div>
          ) : null}

          {showStockBadge ? (
            <ProductCardStockBadge
              stock={stock}
              tone={stockBadgeTone}
              className="absolute bottom-4 left-4 z-10 border-white/30 bg-white/85 shadow-sm backdrop-blur-md"
            />
          ) : null}
        </ProductCardMediaFrame>
      </Link>

      <div className="relative flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        <div className="space-y-2">
          {showBrand && brand ? (
            <span className={themeTypographyStyles.brand("text-[10px] text-muted")}>
              {brand}
            </span>
          ) : null}

          <Link href={href as Route}>
            <h3
              className={themeTypographyStyles.cardTitle(
                "line-clamp-2 text-lg leading-tight text-foreground transition-colors hover:text-primary",
              )}
            >
              {name}
            </h3>
          </Link>
        </div>

        <div className="rounded-[1.25rem] border border-border/70 bg-panel/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <div className="flex flex-wrap items-center gap-2">
            {compareAtPrice ? (
              <span className="text-sm text-muted line-through">{compareAtPrice.formatted}</span>
            ) : null}
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Precio final</p>
              <div data-price-row="final" className="flex flex-wrap items-center gap-2">
                <p className="text-2xl font-semibold leading-none text-foreground">
                  {price.formatted}
                </p>
                {showCashDiscount && cashDiscount ? (
                  <span
                    data-discount-badge="cash-discount"
                    className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-950"
                  >
                    {cashDiscount.percent}% OFF contado
                  </span>
                ) : null}
              </div>
            </div>

            {showInstallments && installments ? (
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Financiación</p>
                <p className="text-sm font-medium text-foreground">
                  {installments.count}x {installments.formatted}
                </p>
                {installments.interestFree ? (
                  <p className="text-xs text-primary">sin interés</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {!isAvailable && stock?.label ? (
            <p className="mt-3 text-sm font-medium text-muted">{stock.label}</p>
          ) : null}
        </div>

        {showAddToCart && isAvailable ? (
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
            size="lg"
            className="mt-auto w-full rounded-full"
            aria-label={`Agregar ${name} al carrito`}
          >
            Agregar ahora
          </AddToCartButton>
        ) : !showAddToCart ? (
          <Button asChild size="lg" variant="outline" className="mt-auto w-full rounded-full">
            <Link href={href as Route}>
              Ver producto
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" variant="outline" className="mt-auto w-full rounded-full" disabled>
            Sin stock
          </Button>
        )}
      </div>
    </article>
  );
}
