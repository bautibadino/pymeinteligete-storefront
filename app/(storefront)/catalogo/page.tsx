import type { Metadata } from "next";

import { loadCatalogExperience, resolveTenantDisplayName } from "@/app/(storefront)/_lib/storefront-shell-data";
import { CatalogGrid } from "@/components/storefront/catalog-grid";
import { PageIntro, SplitPanel } from "@/components/storefront/page-sections";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
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
  const activeFilters = Object.entries(query).filter(([, value]) => value !== undefined);

  return (
    <>
      <PageIntro
        eyebrow="Superficie pública"
        title={`Catálogo de ${displayName}`}
        description="La página ya consume bootstrap y catálogo por host, y solo navega cuando `shopStatus` permite exponer productos públicamente."
        aside={
          <div className="stat-stack">
            <div className="stat-box">
              <span>Host</span>
              <strong className="mono">{host}</strong>
            </div>
            <div className="stat-box">
              <span>Resultados</span>
              <strong>{experience.catalog?.items.length ?? 0}</strong>
            </div>
          </div>
        }
      />

      <SurfaceStateCard
        shopStatus={experience.bootstrap?.shopStatus ?? null}
        surface="catalog"
        title="El catálogo no está habilitado para este estado de tienda."
      />

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

      <SplitPanel
        title="Productos públicos"
        description="Los ítems mostrados salen del endpoint real `GET /api/storefront/v1/catalog` y no de mocks locales."
      >
        <CatalogGrid
          products={experience.catalog?.items ?? []}
          emptyTitle="Sin productos para mostrar"
          emptyDescription="La tienda actual no devolvió productos públicos para la consulta activa o el backend todavía no expone el payload final esperado."
        />
      </SplitPanel>
    </>
  );
}
