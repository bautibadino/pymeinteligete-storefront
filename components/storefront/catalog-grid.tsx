import { ProductGrid } from "@/components/templates/catalog-layout/catalog-layout-shared";
import { mapCatalogProductsToCardData } from "@/components/presentation/render-context";
import type { StorefrontBootstrap, StorefrontCatalogProduct } from "@/lib/storefront-api";

type CatalogGridProps = {
  bootstrap?: StorefrontBootstrap | null;
  products: StorefrontCatalogProduct[];
  emptyTitle: string;
  emptyDescription: string;
};

export function CatalogGrid({ bootstrap, products, emptyTitle, emptyDescription }: CatalogGridProps) {
  const normalizedProducts = mapCatalogProductsToCardData(products, products.length, bootstrap);

  if (normalizedProducts.length === 0) {
    return (
      <section className="empty-state-card">
        <h3>{emptyTitle}</h3>
        <p>{emptyDescription}</p>
      </section>
    );
  }

  return (
    <section aria-label="Productos públicos">
      <ProductGrid
        products={normalizedProducts}
        cardVariant="premium-commerce"
        cardDisplayOptions={{
          showBrand: true,
          showBadges: true,
          showInstallments: true,
          showCashDiscount: true,
          showAddToCart: false,
        }}
        columns={3}
      />
    </section>
  );
}
