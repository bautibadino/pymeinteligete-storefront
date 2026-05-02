import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";
import {
  CatalogPagination,
  CatalogToolbar,
  EmptyCatalogState,
  FilterSidebar,
  ProductGrid,
} from "./catalog-layout-shared";

/**
 * CatalogLayout — Paginado clásico.
 * Filtros lateral + grilla de productos + controles de paginación.
 * V1: paginación visual inerte (sin lógica de navegación real).
 */
export function CatalogLayoutPaginatedClassic({ module }: { module: CatalogLayoutModule }) {
  const { content } = module;
  const { cardVariant, cardDisplayOptions, density, filters, sort, perPage } = content;
  const products = (module.products ?? []).slice(0, perPage ?? 12);
  const resolvedDensity = density ?? "compact";

  return (
    <section
      className={resolvedDensity === "comfortable" ? "py-8" : "py-6"}
      data-template="catalog-layout-paginated-classic"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className={resolvedDensity === "comfortable" ? "flex flex-col gap-6 lg:flex-row" : "flex flex-col gap-5 lg:flex-row"}>
          <div className="shrink-0 self-start lg:sticky lg:top-28 lg:w-72">
            <FilterSidebar
              activeFilters={filters}
              categories={module.categories}
              density={resolvedDensity}
              products={products}
            />
          </div>

          <div className={resolvedDensity === "comfortable" ? "flex-1 space-y-6" : "flex-1 space-y-5"}>
            <CatalogToolbar
              count={products.length}
              density={resolvedDensity}
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
                  density={resolvedDensity}
                />
                <CatalogPagination pageSize={perPage} />
              </>
            ) : (
              <EmptyCatalogState />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
