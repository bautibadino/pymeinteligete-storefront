import { ProductGrid } from "@/components/templates/catalog-layout/catalog-layout-shared";
import { mapCatalogProductsToCardData } from "@/components/presentation/render-context";
import type { StorefrontBootstrap, StorefrontCatalogProduct } from "@/lib/storefront-api";
import type { CatalogLayoutDensity } from "@/lib/modules/catalog-layout";

type CatalogGridProps = {
  bootstrap?: StorefrontBootstrap | null;
  products: StorefrontCatalogProduct[];
  emptyTitle: string;
  emptyDescription: string;
  analyticsList?: { id: string; name: string } | undefined;
  density?: CatalogLayoutDensity;
  showHeader?: boolean;
};

export function CatalogGrid({
  bootstrap,
  products,
  emptyTitle,
  emptyDescription,
  analyticsList,
  density = "compact",
  showHeader = true,
}: CatalogGridProps) {
  const normalizedProducts = mapCatalogProductsToCardData(products, products.length, bootstrap);

  if (normalizedProducts.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-[color:var(--surface-raised)] p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground">{emptyTitle}</h3>
        <p className="mt-2 max-w-prose text-sm leading-6 text-muted">{emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-4" aria-label="Productos públicos">
      {showHeader ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              Catálogo público
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              Resultados disponibles
            </h2>
          </div>
          <span className="rounded-full border border-border bg-[color:var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-muted">
            {normalizedProducts.length} {normalizedProducts.length === 1 ? "producto" : "productos"}
          </span>
        </div>
      ) : null}

      <ProductGrid
        products={normalizedProducts}
        cardVariant="premium-commerce"
        analyticsList={analyticsList}
        density={density}
        cardDisplayOptions={{
          showBrand: true,
          showBadges: true,
          showInstallments: true,
          showCashDiscount: true,
          showAddToCart: true,
        }}
        columns={4}
      />
    </section>
  );
}
