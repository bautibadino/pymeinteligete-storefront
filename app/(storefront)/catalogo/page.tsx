import type { Metadata } from "next";
import { loadCatalogExperience, resolveTenantDisplayName } from "@/app/(storefront)/_lib/storefront-shell-data";
import { Card, CardContent } from "@/components/ui/card";
import { CatalogGrid } from "@/components/storefront/catalog-grid";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import { PreviewBridge } from "@/components/presentation/PreviewBridge";
import { mapCatalogProductsToCardData } from "@/components/presentation/render-context";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { shouldUsePresentation } from "@/lib/presentation/render-utils";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseCatalogQuery(searchParams: Record<string, string | string[] | undefined>) {
  const rawPage = getSingleValue(searchParams.page);
  const rawPageSize = getSingleValue(searchParams.pageSize);
  const rawSearch = getSingleValue(searchParams.search);
  const rawSort = getSingleValue(searchParams.sort);
  const rawCategory = getSingleValue(searchParams.category);
  const rawBrand = getSingleValue(searchParams.brand);
  const rawAvailability = getSingleValue(searchParams.availability);
  const page = Number(rawPage);
  const pageSize = Number(rawPageSize);

  return {
    ...(Number.isFinite(page) && page > 0 ? { page } : {}),
    ...(Number.isFinite(pageSize) && pageSize > 0 ? { pageSize } : {}),
    ...(rawSearch ? { search: rawSearch } : {}),
    ...(rawSort ? { sort: rawSort } : {}),
    ...(rawCategory ? { category: rawCategory } : {}),
    ...(rawBrand ? { brand: rawBrand } : {}),
    ...(rawAvailability ? { availability: rawAvailability } : {}),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/catalogo",
    title: `${snapshot.title} | Catalogo`,
  });
}

export default async function CatalogoPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = parseCatalogQuery(resolvedSearchParams);
  const experience = await loadCatalogExperience(query);
  const host = experience.runtime.context.host;
  const displayName = resolveTenantDisplayName(experience.bootstrap, host);
  const products = experience.catalog?.products ?? [];
  const renderedProductsCount = mapCatalogProductsToCardData(products, products.length).length;
  const activeFilters = Object.entries(query).filter(([, value]) => value !== undefined);
  const hasPreview = Boolean(experience.runtime.context.previewToken);

  const usePresentation = shouldUsePresentation(experience.bootstrap?.presentation, "catalog");

  if (usePresentation) {
    const presentationContext = {
      bootstrap: experience.bootstrap,
      host,
      products,
    };

    return (
      <>
        {hasPreview ? <PreviewBridge /> : null}
        <PresentationRenderer
          presentation={experience.bootstrap!.presentation!}
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
        shopStatus={experience.bootstrap?.tenant.status ?? null}
        surface="catalog"
        title="El catálogo no está habilitado para este estado de tienda."
      />

      <Card className="rounded-xl border-border bg-panel shadow-tenant">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-10">
          <div className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Catálogo online</span>
            <h1 className="font-heading text-4xl font-black leading-none tracking-[-0.06em] text-foreground md:text-7xl">
              {displayName}
            </h1>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              Explorá productos disponibles, precios actualizados y condiciones comerciales de la tienda.
            </p>
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
          {activeFilters.map(([key, value]) => (
            <span key={key} className="filter-chip">
              <strong>{key}</strong>
              <span>{String(value)}</span>
            </span>
          ))}
        </section>
      ) : null}

      <CatalogGrid
        products={products}
        emptyTitle="Sin productos para mostrar"
        emptyDescription="No encontramos productos para la búsqueda actual. Probá ajustar los filtros o volvé más tarde."
      />

      {hasPreview ? <PreviewBridge /> : null}
    </>
  );
}
