import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";
import {
  CatalogToolbar,
  EmptyCatalogState,
  FilterSidebar,
  MOCK_PRODUCTS,
  ProductGrid,
} from "./catalog-layout-shared";

/**
 * CatalogLayout — Filtros lateral (default).
 * Filtros a la izquierda + grilla de productos a la derecha.
 */
export function CatalogLayoutFiltersSidebar({ module }: { module: CatalogLayoutModule }) {
  const { content } = module;
  const { cardVariant, cardDisplayOptions, filters, sort, perPage } = content;
  const products = MOCK_PRODUCTS.slice(0, perPage ?? 12);

  return (
    <section className="py-8" data-template="catalog-layout-filters-sidebar">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="shrink-0 lg:w-64">
            <FilterSidebar activeFilters={filters} />
          </div>

          <div className="flex-1 space-y-6">
            <CatalogToolbar
              count={products.length}
              sortOptions={sort?.options}
              defaultSort={sort?.default}
            />

            {products.length > 0 ? (
              <ProductGrid
                products={products}
                cardVariant={cardVariant}
                cardDisplayOptions={cardDisplayOptions}
                columns={3}
              />
            ) : (
              <EmptyCatalogState />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
