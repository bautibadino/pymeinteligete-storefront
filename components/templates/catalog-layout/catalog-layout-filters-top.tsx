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
  const { cardVariant, cardDisplayOptions, density, filters, sort, perPage } = content;
  const products = (module.products ?? []).slice(0, perPage ?? 12);
  const resolvedDensity = density ?? "compact";

  return (
    <section
      className={resolvedDensity === "comfortable" ? "py-7" : "py-4"}
      data-template="catalog-layout-filters-top"
    >
      <div className={resolvedDensity === "comfortable" ? "mx-auto max-w-7xl space-y-5 px-4" : "mx-auto max-w-7xl space-y-4 px-4"}>
        <FilterBar
          activeFilters={filters}
          categories={module.categories}
          density={resolvedDensity}
          facets={module.facets}
          products={products}
        />

        <CatalogToolbar
          count={products.length}
          density={resolvedDensity}
          sortOptions={sort?.options}
          defaultSort={sort?.default}
        />

        {products.length > 0 ? (
          <ProductGrid
            products={products}
            cardVariant={cardVariant}
            cardDisplayOptions={cardDisplayOptions}
            columns={4}
            density={resolvedDensity}
          />
        ) : (
          <EmptyCatalogState />
        )}
      </div>
    </section>
  );
}
