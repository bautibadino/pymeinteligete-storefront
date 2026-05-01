import { Card, CardContent } from "@/components/ui/card";
import { CatalogGrid } from "@/components/storefront/catalog-grid";
import { PreviewBridge } from "@/components/presentation/PreviewBridge";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import { mapCatalogProductsToCardData } from "@/components/presentation/render-context";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { shouldUsePresentation } from "@/lib/presentation/render-utils";
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

    return [
      {
        key,
        label: ACTIVE_FILTER_LABELS[key as keyof StorefrontCatalogQuery] ?? key,
        value: typeof value === "boolean" ? (value ? "Sí" : "No") : String(value),
      },
    ];
  });
}

export function CatalogPageContent({
  bootstrap,
  categories,
  host,
  previewToken,
  products,
  query,
  selectedCategory,
}: CatalogPageContentProps) {
  const renderedProductsCount = mapCatalogProductsToCardData(products, products.length).length;
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

      <Card className="rounded-xl border-border bg-panel shadow-tenant">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-10">
          <div className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              {selectedCategory ? "Categoría pública" : "Catálogo online"}
            </span>
            <h1 className="font-heading text-4xl font-black leading-none tracking-[-0.06em] text-foreground md:text-7xl">
              {heading}
            </h1>
            <p className="max-w-2xl leading-7 text-muted-foreground">{description}</p>
          </div>

          <div className="grid min-h-24 min-w-32 place-items-center rounded-lg border border-border bg-panel-strong p-5 text-center">
            <strong className="text-3xl leading-none text-foreground">{renderedProductsCount}</strong>
            <span className="text-sm font-bold text-muted-foreground">
              {renderedProductsCount === 1 ? "producto" : "productos"}
            </span>
          </div>
        </CardContent>
      </Card>

      {activeFilters.length > 0 ? (
        <section className="filter-strip" aria-label="Filtros activos">
          {activeFilters.map((filter) => (
            <span key={filter.key} className="filter-chip">
              <strong>{filter.label}</strong>
              <span>{filter.value}</span>
            </span>
          ))}
        </section>
      ) : null}

      <CatalogGrid
        bootstrap={bootstrap}
        products={products}
        emptyTitle="Sin productos para mostrar"
        emptyDescription="No encontramos productos para la búsqueda actual. Probá ajustar los filtros o volvé más tarde."
      />

      {hasPreview ? <PreviewBridge /> : null}
    </>
  );
}
