import { cn } from "@/lib/utils/cn";
import type {
  ProductCardStock,
  ProductCardStockBadgeTone,
} from "@/lib/templates/product-card-catalog";

const STOCK_BADGE_TONE_CLASSNAMES: Record<ProductCardStockBadgeTone, string> = {
  slate:
    "border-slate-200 bg-slate-100/90 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200",
  forest:
    "border-emerald-200 bg-emerald-100/90 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  ocean:
    "border-sky-200 bg-sky-100/90 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200",
  amber:
    "border-amber-200 bg-amber-100/95 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
};

interface ProductCardStockBadgeProps {
  stock: ProductCardStock | undefined;
  tone?: ProductCardStockBadgeTone | undefined;
  className?: string;
}

export function ProductCardStockBadge({
  stock,
  tone = "forest",
  className,
}: ProductCardStockBadgeProps) {
  if (!stock?.available || !stock.label) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium leading-none",
        STOCK_BADGE_TONE_CLASSNAMES[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      <span>{stock.label}</span>
    </span>
  );
}
