import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";
import {
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
  const { cardVariant, cardDisplayOptions, filters, sort, perPage } = content;
  const products = (module.products ?? []).slice(0, perPage ?? 12);

  return (
    <section className="py-8" data-template="catalog-layout-paginated-classic">
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
              <>
                <ProductGrid
                  products={products}
                  cardVariant={cardVariant}
                  cardDisplayOptions={cardDisplayOptions}
                  columns={3}
                />
                <nav
                  aria-label="Paginación"
                  className="flex items-center justify-center gap-2 pt-4"
                >
                  <button
                    disabled
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-panel text-sm text-muted disabled:opacity-50"
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>
                  <button
                    aria-current="page"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
                  >
                    1
                  </button>
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-panel text-sm text-foreground hover:bg-panel-strong">
                    2
                  </button>
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-panel text-sm text-foreground hover:bg-panel-strong">
                    3
                  </button>
                  <span className="text-sm text-muted">…</span>
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-panel text-sm text-foreground hover:bg-panel-strong"
                    aria-label="Página siguiente"
                  >
                    ›
                  </button>
                </nav>
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
