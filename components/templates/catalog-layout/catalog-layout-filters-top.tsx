import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";
import {
  CatalogToolbar,
  EmptyCatalogState,
  FilterBar,
  ProductGrid,
} from "./catalog-layout-shared";

/**
 * CatalogLayout — Filtros arriba.
 * Barra de filtros horizontal + grilla de productos debajo.
 */
export function CatalogLayoutFiltersTop({ module }: { module: CatalogLayoutModule }) {
  const { content } = module;
  const { cardVariant, cardDisplayOptions, filters, sort, perPage } = content;
  const products = (module.products ?? []).slice(0, perPage ?? 12);

  return (
    <section className="py-8" data-template="catalog-layout-filters-top">
      <div className="mx-auto max-w-7xl px-4 space-y-6">
        <FilterBar activeFilters={filters} />

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
            columns={4}
          />
        ) : (
          <EmptyCatalogState />
        )}
      </div>
    </section>
  );
}
