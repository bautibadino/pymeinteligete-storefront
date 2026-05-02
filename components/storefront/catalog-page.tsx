import { Card, CardContent } from "@/components/ui/card";
import { CatalogGrid } from "@/components/storefront/catalog-grid";
import { PreviewBridge } from "@/components/presentation/PreviewBridge";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import {
  CatalogToolbar,
  FilterSidebar,
} from "@/components/templates/catalog-layout/catalog-layout-shared";
import { mapCatalogProductsToCardData } from "@/components/presentation/render-context";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { shouldUsePresentation } from "@/lib/presentation/render-utils";
import type { StorefrontPagination } from "@/lib/types/storefront";
import type {
  StorefrontBootstrap,
  StorefrontCatalogQuery,
  StorefrontCatalogProduct,
  StorefrontCategory,
} from "@/lib/storefront-api";

type CatalogPageContentProps = {
  bootstrap: StorefrontBootstrap | null;
  categories: StorefrontCategory[];
  host: string;
  pagination?: StorefrontPagination | undefined;
  previewToken?: string | null | undefined;
  products: StorefrontCatalogProduct[];
  query: StorefrontCatalogQuery;
  selectedCategory?: StorefrontCategory | null;
};

const ACTIVE_FILTER_LABELS: Partial<Record<keyof StorefrontCatalogQuery, string>> = {
  search: "Búsqueda",
  sortBy: "Orden",
  sortOrder: "Dirección",
  brand: "Marca",
  family: "Familia",
  minPrice: "Precio mínimo",
  maxPrice: "Precio máximo",
  onlyImmediate: "Entrega inmediata",
};

const DEFAULT_PUBLIC_FILTERS = {
  search: true,
  brand: true,
  category: true,
  availability: true,
  priceRange: true,
} as const;

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function resolveTenantDisplayName(bootstrap: StorefrontBootstrap | null, host: string): string {
  return bootstrap?.branding?.storeName ?? bootstrap?.tenant?.tenantSlug ?? host;
}

function buildActiveFilters(
  query: StorefrontCatalogQuery,
  selectedCategory?: StorefrontCategory | null,
): Array<{ key: string; label: string; value: string }> {
  return Object.entries(query).flatMap(([key, value]) => {
    if (value === undefined || (key === "categoryId" && selectedCategory)) {
      return [];
    }

    const resolvedValue =
      typeof value === "boolean"
        ? value
          ? "Si"
          : "No"
        : key === "minPrice" || key === "maxPrice"
          ? formatPrice(Number(value))
          : String(value);

    return [
      {
        key,
        label: ACTIVE_FILTER_LABELS[key as keyof StorefrontCatalogQuery] ?? key,
        value: resolvedValue,
      },
    ];
  });
}

export function CatalogPageContent({
  bootstrap,
  categories,
  host,
  pagination,
  previewToken,
  products,
  query,
  selectedCategory,
}: CatalogPageContentProps) {
  const normalizedProducts = mapCatalogProductsToCardData(products, products.length, bootstrap);
  const renderedProductsCount = normalizedProducts.length;
  const totalResults = pagination?.total ?? renderedProductsCount;
  const activeFilters = buildActiveFilters(query, selectedCategory);
  const hasPreview = Boolean(previewToken);
  const usePresentation = shouldUsePresentation(bootstrap?.presentation, "catalog");
  const displayName = resolveTenantDisplayName(bootstrap, host);
  const heading = selectedCategory?.name ?? displayName;
  const description = selectedCategory
    ? `Explorá productos disponibles en la categoría ${selectedCategory.name}.`
    : "Explorá productos disponibles, precios actualizados y condiciones comerciales de la tienda.";

  if (usePresentation) {
    const presentationContext = {
      bootstrap,
      host,
      products,
      categories,
    };

    return (
      <>
        {hasPreview ? <PreviewBridge /> : null}
        <PresentationRenderer
          presentation={bootstrap!.presentation!}
          page="catalog"
          includeGlobals={false}
          context={presentationContext}
        />
      </>
    );
  }

  return (
    <>
      <SurfaceStateCard
        shopStatus={bootstrap?.tenant.status ?? null}
        surface="catalog"
        title="El catálogo no está habilitado para este estado de tienda."
      />

      <Card className="overflow-hidden rounded-[var(--radius-xl)] border-border bg-[color:var(--surface-raised)] shadow-tenant">
        <CardContent className="flex flex-col gap-5 p-5 md:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-[color:var(--surface-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {selectedCategory ? "Categoria publica" : "Catalogo online"}
              </span>
              {selectedCategory ? (
                <span className="text-sm text-muted-foreground">{displayName}</span>
              ) : null}
            </div>
            <h1 className="font-heading text-3xl font-black leading-none tracking-[-0.05em] text-foreground md:text-5xl">
              {heading}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          </div>

          <div className="grid min-h-20 min-w-28 place-items-center rounded-[calc(var(--radius-lg)-2px)] border border-border bg-[color:var(--surface-muted)] px-4 py-3 text-center">
            <strong className="text-2xl leading-none text-foreground">{totalResults}</strong>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {totalResults === 1 ? "producto" : "productos"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[272px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <FilterSidebar
            activeFilters={DEFAULT_PUBLIC_FILTERS}
            categories={categories}
            density="compact"
            products={normalizedProducts}
          />
        </div>

        <div className="space-y-4">
          {activeFilters.length > 0 ? (
            <section className="grid gap-2" aria-label="Filtros activos">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Filtros activos
                </span>
                <span className="rounded-full border border-border bg-[color:var(--surface-muted)] px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {activeFilters.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex min-h-8 items-center gap-2 rounded-full border border-border bg-[color:var(--surface-muted)] px-3 py-1.5 text-xs text-foreground"
                  >
                    <strong className="font-semibold text-[color:var(--accent)]">{filter.label}</strong>
                    <span>{filter.value}</span>
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <CatalogToolbar count={totalResults} density="compact" />

          <CatalogGrid
            bootstrap={bootstrap}
            density="compact"
            products={products}
            emptyTitle="Sin productos para mostrar"
            emptyDescription="No encontramos productos para la búsqueda actual. Proba ajustar los filtros o volve mas tarde."
          />
        </div>
      </div>

      {hasPreview ? <PreviewBridge /> : null}
    </>
  );
}
