import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { ProductCardMediaFrame } from "@/components/templates/product-card/product-card-media-frame";
import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";
import { themeTypographyStyles } from "@/lib/theme";
import type {
  ProductCardData,
  ProductCardDisplayOptions,
} from "@/lib/templates/product-card-catalog";
import { ProductCardStockBadge } from "@/components/templates/product-card/product-card-stock-badge";

interface ProductCardCompactProps {
  product: ProductCardData;
  displayOptions?: ProductCardDisplayOptions | undefined;
}

/**
 * ProductCard Compact — layout denso para grillas de 4 o 5 columnas.
 * Imagen pequeña + nombre + precio + CTA ícono.
 * Prioriza la densidad informativa sobre el detalle visual.
 */
export function ProductCardCompact({
  product,
  displayOptions = {},
}: ProductCardCompactProps) {
  const {
    showBrand = false,
    showStockBadge = true,
    stockBadgeTone = "forest",
  } = displayOptions;

  const { name, brand, imageUrl, price, stock, href } = product;

  const isAvailable = stock === undefined || stock.available;

  return (
    <article
      aria-label={name}
      className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-white transition-shadow hover:shadow-sm"
      data-template="product-card-compact"
    >
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
          frameClassName="aspect-square"
          imageClassName="p-2.5 group-hover:scale-[1.02]"
        >
          {showStockBadge ? (
            <ProductCardStockBadge
              stock={stock}
              tone={stockBadgeTone}
              className="absolute bottom-2 left-2 z-10 max-w-[calc(100%-1rem)] backdrop-blur-sm"
            />
          ) : null}

          {!isAvailable ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-black/40"
            >
              <span
                className={themeTypographyStyles.label(
                  "rounded-full bg-panel px-2 py-0.5 text-[10px] text-muted",
                )}
              >
                Sin stock
              </span>
            </div>
          ) : null}
        </ProductCardMediaFrame>
      </Link>

      <div className="flex flex-col gap-1 p-2">
        {showBrand && brand ? (
          <span className={themeTypographyStyles.brand("text-[10px] text-muted")}>
            {brand}
          </span>
        ) : null}

        <Link href={href as Route} prefetch={shouldPrefetchStorefrontLink(href)}>
          <h3
            className={themeTypographyStyles.cardTitle(
              "line-clamp-2 text-xs leading-snug text-foreground transition-colors hover:text-primary",
            )}
          >
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-1 pt-0.5">
          <span className="text-sm font-bold text-foreground">{price.formatted}</span>

          <Link
            href={href as Route}
            prefetch={shouldPrefetchStorefrontLink(href)}
            aria-label={`Ver ${name}`}
            className="rounded-full bg-primary p-1 text-primary-foreground transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
