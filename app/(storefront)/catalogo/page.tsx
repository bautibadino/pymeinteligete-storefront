import type { Metadata } from "next";
import { loadCatalogRouteData } from "@/app/(storefront)/catalogo/_lib/catalog-data";
import { CatalogPageContent } from "@/components/storefront/catalog-page";
import { buildTenantMetadata, getTenantSeoRequestContext, resolveTenantSeoSnapshotByRequest } from "@/lib/seo";
import { parseCatalogSearchParams } from "@/lib/presentation/catalog-routing";
import { getCategories } from "@/lib/storefront-api";
import type { StorefrontPagination } from "@/lib/types/storefront";

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function resolveCatalogMetadataPath(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<ReturnType<typeof parseCatalogSearchParams>> {
  const requestContext = await getTenantSeoRequestContext();
  const storefrontInput =
    requestContext.tenantSlug
      ? {
          host: requestContext.resolvedHost,
          requestId: `seo-${requestContext.tenantSlug}-categories`,
          storefrontVersion: "seo",
          tenantSlug: requestContext.tenantSlug,
        }
      : requestContext.resolvedHost;

  try {
    const categories = await getCategories(storefrontInput);

    return parseCatalogSearchParams(searchParams, categories);
  } catch {
    return parseCatalogSearchParams(searchParams);
  }
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const [resolvedSearchParams, requestContext] = await Promise.all([searchParams, getTenantSeoRequestContext()]);
  const [snapshot, resolution] = await Promise.all([
    resolveTenantSeoSnapshotByRequest(requestContext),
    resolveCatalogMetadataPath(resolvedSearchParams),
  ]);
  const currentPage = resolution.query.page ?? 1;
  const title = resolution.selectedCategory
    ? `${resolution.selectedCategory.name} | ${snapshot.title}`
    : `${snapshot.title} | Catalogo`;

  return buildTenantMetadata(snapshot, {
    pathname: resolution.pathname,
    title,
    noIndex: currentPage > 1,
  });
}

export default async function CatalogoPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;
  const routeData = await loadCatalogRouteData(resolvedSearchParams);
  const pagination: StorefrontPagination | undefined = routeData.experience.catalog?.pagination;

  return (
    <CatalogPageContent
      bootstrap={routeData.experience.bootstrap}
      categories={routeData.categories}
      facets={routeData.experience.catalog?.facets}
      host={routeData.experience.runtime.context.host}
      pagination={pagination}
      previewToken={routeData.experience.runtime.context.previewToken}
      products={routeData.experience.catalog?.products ?? []}
      query={routeData.query}
      selectedCategory={routeData.selectedCategory}
    />
  );
}
