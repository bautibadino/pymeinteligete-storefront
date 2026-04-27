import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";
import type { ProductCardData, ProductCardDisplayOptions } from "@/lib/templates/product-card-catalog";

/**
 * Opciones de ordenamiento disponibles.
 */
export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "relevance", label: "Relevancia" },
  { value: "priceAsc", label: "Menor precio" },
  { value: "priceDesc", label: "Mayor precio" },
  { value: "newest", label: "Más nuevos" },
  { value: "popular", label: "Más populares" },
];

/**
 * Etiquetas para filtros configurados.
 */
export const FILTER_LABELS: Record<string, string> = {
  brand: "Marca",
  priceRange: "Precio",
  category: "Categoría",
  availability: "Disponibilidad",
  rating: "Valoración",
};

/**
 * Renderiza el estado vacío del catálogo.
 */
export function EmptyCatalogState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          No se encontraron productos
        </h3>
        <p className="max-w-xs text-sm text-muted">
          Probá ajustando los filtros o volvé a revisar más tarde.
        </p>
      </div>
    </div>
  );
}

/**
 * Barra de controles compartida: resultados + ordenamiento.
 */
export function CatalogToolbar({
  count,
  sortOptions,
  defaultSort,
}: {
  count: number;
  sortOptions?: string[] | undefined;
  defaultSort?: string | undefined;
}) {
  const options = sortOptions?.length
    ? SORT_OPTIONS.filter((o) => sortOptions.includes(o.value))
    : SORT_OPTIONS;

  const selected = defaultSort && options.some((o) => o.value === defaultSort)
    ? defaultSort
    : options[0]?.value ?? "relevance";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">{count}</span> resultados
      </p>
      <div className="flex items-center gap-2">
        <label htmlFor="catalog-sort" className="text-sm text-muted">
          Ordenar por
        </label>
        <select
          id="catalog-sort"
          defaultValue={selected}
          className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/**
 * Lista de filtros configurados .
 */
export function FilterGroup({ label }: { label: string }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      <div className="space-y-2">
        {["Opción A", "Opción B", "Opción C"].map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="size-4 rounded border-line text-primary focus:ring-primary"
              disabled
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

/**
 * Sidebar de filtros compartida.
 */
export function FilterSidebar({
  activeFilters,
}: {
  activeFilters?: Record<string, boolean | undefined> | undefined;
}) {
  const entries = activeFilters
    ? Object.entries(activeFilters).filter(([, v]) => v === true)
    : [];

  if (entries.length === 0) {
    return (
      <aside className="space-y-6 rounded-xl border border-line bg-panel p-5">
        <h3 className="font-heading text-base font-semibold text-foreground">Filtros</h3>
        <p className="text-sm text-muted">No hay filtros activos.</p>
      </aside>
    );
  }

  return (
    <aside className="space-y-6 rounded-xl border border-line bg-panel p-5">
      <h3 className="font-heading text-base font-semibold text-foreground">Filtros</h3>
      {entries.map(([key]) => (
        <FilterGroup key={key} label={FILTER_LABELS[key] ?? key} />
      ))}
    </aside>
  );
}

/**
 * Barra de filtros horizontal (para filters-top / infinite-scroll).
 */
export function FilterBar({
  activeFilters,
}: {
  activeFilters?: Record<string, boolean | undefined> | undefined;
}) {
  const entries = activeFilters
    ? Object.entries(activeFilters).filter(([, v]) => v === true)
    : [];

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-panel p-4">
        <p className="text-sm text-muted">No hay filtros activos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-line bg-panel p-4">
      {entries.map(([key]) => (
        <span
          key={key}
          className="inline-flex items-center rounded-pill bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
        >
          {FILTER_LABELS[key] ?? key}
        </span>
      ))}
    </div>
  );
}

/**
 * Grilla de productos compartida.
 */
export function ProductGrid({
  products,
  cardVariant,
  cardDisplayOptions,
  columns = 3,
}: {
  products: ProductCardData[];
  cardVariant: string;
  cardDisplayOptions?: ProductCardDisplayOptions | undefined;
  columns?: 2 | 3 | 4;
}) {
  const gridCols =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {products.map((product) => {
        const ProductCard = resolveProductCardTemplate(cardVariant);
        return (
          <ProductCard
            key={product.id}
            product={product}
            {...(cardDisplayOptions ? { displayOptions: cardDisplayOptions } : {})}
          />
        );
      })}
    </div>
  );
}


