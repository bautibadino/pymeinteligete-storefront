import type { Metadata } from "next";

import { loadCatalogRouteData } from "@/app/(storefront)/catalogo/_lib/catalog-data";
import { SportAdventureCatalogExperience } from "@/components/experiences/sportadventure";
import { CatalogPageContent } from "@/components/storefront/catalog-page";
import { resolveCustomExperienceKey } from "@/lib/experiences";
import { parseCatalogSearchParams } from "@/lib/presentation/catalog-routing";
import {
  buildTenantMetadata,
  getTenantSeoRequestContext,
  resolveTenantSeoSnapshotByRequest,
} from "@/lib/seo";
import { getCategories } from "@/lib/storefront-api";
import type { StorefrontPagination } from "@/lib/types/storefront";

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function shouldIndexCatalogQuery(
  query: ReturnType<typeof parseCatalogSearchParams>["query"],
): boolean {
  return (
    (query.page ?? 1) <= 1 &&
    !query.search &&
    !query.brand &&
    !query.family &&
    query.minPrice === undefined &&
    query.maxPrice === undefined &&
    query.onlyImmediate === undefined &&
    !query.sortBy &&
    !query.sortOrder
  );
}

async function resolveCatalogMetadataPath(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<ReturnType<typeof parseCatalogSearchParams>> {
  const requestContext = await getTenantSeoRequestContext();
  const storefrontInput = requestContext.tenantSlug
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

export async function generateMetadata({
  searchParams,
}: CatalogPageProps): Promise<Metadata> {
  const [resolvedSearchParams, requestContext] = await Promise.all([
    searchParams,
    getTenantSeoRequestContext(),
  ]);
  const [snapshot, resolution] = await Promise.all([
    resolveTenantSeoSnapshotByRequest(requestContext),
    resolveCatalogMetadataPath(resolvedSearchParams),
  ]);
  const title = resolution.selectedCategory
    ? `${resolution.selectedCategory.name} | ${snapshot.title}`
    : `${snapshot.title} | Catalogo`;

  return buildTenantMetadata(snapshot, {
    pathname: resolution.pathname,
    title,
    noIndex: !shouldIndexCatalogQuery(resolution.query),
  });
}

export default async function CatalogoPage({
  searchParams,
}: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;
  const routeData = await loadCatalogRouteData(resolvedSearchParams);
  const pagination: StorefrontPagination | undefined =
    routeData.experience.catalog?.pagination;
  const customExperienceKey = resolveCustomExperienceKey(
    routeData.experience.bootstrap,
  );

  if (customExperienceKey === "sportadventure-custom-v1") {
    return (
      <SportAdventureCatalogExperience
        bootstrap={routeData.experience.bootstrap}
        host={routeData.experience.runtime.context.host}
        catalog={routeData.experience.catalog}
        categories={routeData.categories}
        query={routeData.query}
      />
    );
  }

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
