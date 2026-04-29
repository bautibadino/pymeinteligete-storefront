import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";
import {
  CatalogInfiniteNavigation,
  CatalogToolbar,
  EmptyCatalogState,
  FilterBar,
  ProductGrid,
} from "./catalog-layout-shared";

/**
 * CatalogLayout — Scroll infinito.
 * Filtros arriba + grilla de productos con indicador de carga.
 * V1: visual inerte (sin lógica de scroll infinito real).
 */
export function CatalogLayoutInfiniteScroll({ module }: { module: CatalogLayoutModule }) {
  const { content } = module;
  const { cardVariant, cardDisplayOptions, filters, sort, perPage } = content;
  const products = (module.products ?? []).slice(0, perPage ?? 12);

  return (
    <section className="py-8" data-template="catalog-layout-infinite-scroll">
      <div className="mx-auto max-w-7xl px-4 space-y-6">
        <FilterBar activeFilters={filters} />

        <CatalogToolbar
          count={products.length}
          sortOptions={sort?.options}
          defaultSort={sort?.default}
        />

        {products.length > 0 ? (
          <>
            <ProductGrid
              products={products}
              cardVariant={cardVariant}
              cardDisplayOptions={cardDisplayOptions}
              columns={3}
            />
            <CatalogInfiniteNavigation pageSize={perPage} renderedCount={products.length} />
          </>
        ) : (
          <EmptyCatalogState />
        )}
      </div>
    </section>
  );
}
