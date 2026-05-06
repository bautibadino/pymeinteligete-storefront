import Link from "next/link";
import type { ReactNode } from "react";
import type { Route } from "next";
import { PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { themeTypographyStyles } from "@/lib/theme";
import type { ProductGridModule } from "@/lib/modules/product-grid";
import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";

export interface ProductGridHeaderProps {
  module: ProductGridModule;
  mobileAccessory?: ReactNode;
}

export function ProductGridHeader({ module, mobileAccessory }: ProductGridHeaderProps) {
  const { title, subtitle, showViewAllLink, viewAllHref, viewAllLabel } = module.content;

  if (!title && !subtitle) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
        {mobileAccessory ? <div className="mb-3 md:hidden">{mobileAccessory}</div> : null}
        {title ? (
          <h2 className="font-heading text-[1.55rem] font-semibold tracking-tight text-foreground md:text-[2rem]">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted md:text-[0.95rem]">{subtitle}</p>
        ) : null}
      </div>

      {showViewAllLink && viewAllHref ? (
        <Button asChild variant="outline" size="sm" className="self-start rounded-full px-4 md:self-auto">
          <Link href={viewAllHref as Route}>{viewAllLabel || "Ver catálogo"}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function ProductGridEmptyState({ title = "Todavía no hay productos publicados" }: { title?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-panel/70 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <PackageSearch className="size-7" aria-hidden="true" />
      </div>
      <h3 className={themeTypographyStyles.cardTitle("text-lg text-foreground")}>{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        La sección está configurada, pero el backend no devolvió productos para este tenant o filtro.
      </p>
    </div>
  );
}

export interface ProductGridListProps {
  module: ProductGridModule;
}

export function ProductGridList({ module }: ProductGridListProps) {
  const { cardVariant, cardDisplayOptions } = module.content;
  const ProductCard = resolveProductCardTemplate(cardVariant);
  const products = module.products ?? [];

  if (products.length === 0) {
    return (
      <div className="col-span-full">
        <ProductGridEmptyState />
      </div>
    );
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} displayOptions={cardDisplayOptions} />
      ))}
    </>
  );
}
