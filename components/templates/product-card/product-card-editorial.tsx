import Link from "next/link";
import type { Route } from "next";

import { themeTypographyStyles } from "@/lib/theme";
import type {
  ProductCardData,
  ProductCardDisplayOptions,
} from "@/lib/templates/product-card-catalog";

interface ProductCardEditorialProps {
  product: ProductCardData;
  displayOptions?: ProductCardDisplayOptions | undefined;
}

/**
 * ProductCard Editorial — imagen grande + tipografía elegante + precio sutil.
 * Estética minimal para marcas premium, boutique y lifestyle.
 * No hay botón de carrito explícito: el click lleva a la ficha del producto.
 */
export function ProductCardEditorial({
  product,
  displayOptions = {},
}: ProductCardEditorialProps) {
  const { showBrand = true } = displayOptions;

  const { name, brand, imageUrl, price, compareAtPrice, href } = product;

  return (
    <article
      aria-label={name}
      className="group relative flex flex-col overflow-hidden"
      data-template="product-card-editorial"
    >
      <Link href={href as Route} className="contents" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-panel-strong">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-full w-full bg-gradient-to-br from-primary-soft to-accent-soft"
            />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>
      </Link>

      <div className="flex flex-col gap-1 pt-3">
        {showBrand && brand ? (
          <span className={themeTypographyStyles.brand("text-[11px] text-muted")}>
            {brand}
          </span>
        ) : null}

        <Link href={href as Route}>
          <h3
            className={themeTypographyStyles.cardTitle(
              "text-base leading-snug text-foreground transition-colors hover:text-primary",
            )}
          >
            {name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground">{price.formatted}</span>

          {compareAtPrice ? (
            <span className="text-xs text-muted line-through">
              {compareAtPrice.formatted}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
