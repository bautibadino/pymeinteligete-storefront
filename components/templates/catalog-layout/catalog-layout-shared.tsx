import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";
import type { ProductCardData, ProductCardDisplayOptions } from "@/lib/templates/product-card-catalog";

/**
 * Datos mock de productos para los templates de catalogLayout.
 * En runtime real estos vendrían del backend vía fetch server-side.
 */
export const MOCK_PRODUCTS: ProductCardData[] = [
  {
    id: "prod-001",
    name: "Filtro de aceite Bosch",
    slug: "filtro-aceite-bosch",
    brand: "Bosch",
    imageUrl: "",
    price: { amount: 12500, currency: "ARS", formatted: "$12.500" },
    compareAtPrice: { amount: 15000, formatted: "$15.000" },
    installments: { count: 6, amount: 2083, formatted: "$2.083", interestFree: true },
    cashDiscount: { percent: 20, formatted: "20% OFF" },
    badges: [{ label: "Top", tone: "accent" }, { label: "Despacho Inmediato", tone: "success" }],
    stock: { available: true, label: "Despacho Inmediato" },
    href: "/producto/filtro-aceite-bosch",
  },
  {
    id: "prod-002",
    name: "Aceite sintético 5W-40",
    slug: "aceite-sintetico-5w40",
    brand: "Mobil",
    imageUrl: "",
    price: { amount: 48900, currency: "ARS", formatted: "$48.900" },
    installments: { count: 6, amount: 8150, formatted: "$8.150", interestFree: true },
    stock: { available: true },
    href: "/producto/aceite-sintetico-5w40",
  },
  {
    id: "prod-003",
    name: "Pastillas de freno delanteras",
    slug: "pastillas-freno-delanteras",
    brand: "Ferodo",
    imageUrl: "",
    price: { amount: 34500, currency: "ARS", formatted: "$34.500" },
    compareAtPrice: { amount: 42000, formatted: "$42.000" },
    cashDiscount: { percent: 15, formatted: "15% OFF" },
    badges: [{ label: "Oferta", tone: "warning" }],
    stock: { available: true, label: "Stock disponible" },
    href: "/producto/pastillas-freno-delanteras",
  },
  {
    id: "prod-004",
    name: "Bujía de iridio NGK",
    slug: "bujia-iridio-ngk",
    brand: "NGK",
    imageUrl: "",
    price: { amount: 8900, currency: "ARS", formatted: "$8.900" },
    stock: { available: false, label: "Sin stock" },
    href: "/producto/bujia-iridio-ngk",
  },
  {
    id: "prod-005",
    name: "Kit de distribución completo",
    slug: "kit-distribucion-completo",
    brand: "SKF",
    imageUrl: "",
    price: { amount: 129900, currency: "ARS", formatted: "$129.900" },
    compareAtPrice: { amount: 155000, formatted: "$155.000" },
    installments: { count: 12, amount: 10825, formatted: "$10.825", interestFree: false },
    badges: [{ label: "Premium", tone: "info" }],
    stock: { available: true, label: "Despacho Inmediato" },
    href: "/producto/kit-distribucion-completo",
  },
  {
    id: "prod-006",
    name: "Amortiguador trasero",
    slug: "amortiguador-trasero",
    brand: "Monroe",
    imageUrl: "",
    price: { amount: 67500, currency: "ARS", formatted: "$67.500" },
    stock: { available: true },
    href: "/producto/amortiguador-trasero",
  },
];

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
 * Etiquetas para filtros mock.
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
 * Lista de filtros mock (visual, inerte en V1).
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


