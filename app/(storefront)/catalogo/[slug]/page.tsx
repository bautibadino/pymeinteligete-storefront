import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { loadCatalogRouteData, resolveCatalogRoute } from "@/app/(storefront)/catalogo/_lib/catalog-data";
import { CatalogPageContent } from "@/components/storefront/catalog-page";
import { buildTenantMetadata, getTenantSeoRequestContext, resolveTenantSeoSnapshotByRequest } from "@/lib/seo";

type CatalogCategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function shouldIndexCatalogQuery(
  query: Awaited<ReturnType<typeof resolveCatalogRoute>>["query"],
): boolean {
  return (
    (query.page ?? 1) <= 1 &&
    !query.search &&
    !query.brand &&
    !query.family &&
    !query.sortBy &&
    !query.sortOrder
  );
}

async function resolveCategoryMetadata(
  slug: string,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const requestContext = await getTenantSeoRequestContext();
  const snapshot = await resolveTenantSeoSnapshotByRequest(requestContext);
  const resolution = await resolveCatalogRoute(searchParams, slug);

  return { snapshot, resolution };
}

export async function generateMetadata({
  params,
  searchParams,
}: CatalogCategoryPageProps): Promise<Metadata> {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const { snapshot, resolution } = await resolveCategoryMetadata(slug, resolvedSearchParams);
  const title = resolution.selectedCategory
    ? `${resolution.selectedCategory.name} | ${snapshot.title}`
    : `${snapshot.title} | Catalogo`;

  return buildTenantMetadata(snapshot, {
    pathname: resolution.pathname,
    title,
    noIndex:
      (!resolution.selectedCategory && !resolution.categoryLookupFailed) ||
      !shouldIndexCatalogQuery(resolution.query),
  });
}

export default async function CatalogCategoryPage({
  params,
  searchParams,
}: CatalogCategoryPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const routeData = await loadCatalogRouteData(resolvedSearchParams, slug);

  if (!routeData.selectedCategory && !routeData.categoryLookupFailed) {
    notFound();
  }

  return (
    <CatalogPageContent
      bootstrap={routeData.experience.bootstrap}
      categories={routeData.categories}
      facets={routeData.experience.catalog?.facets}
      host={routeData.experience.runtime.context.host}
      pagination={routeData.experience.catalog?.pagination}
      previewToken={routeData.experience.runtime.context.previewToken}
      products={routeData.experience.catalog?.products ?? []}
      query={routeData.query}
      selectedCategory={routeData.selectedCategory}
    />
  );
}
