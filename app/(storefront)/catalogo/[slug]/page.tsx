import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { loadCatalogRouteData } from "@/app/(storefront)/catalogo/_lib/catalog-data";
import { CatalogPageContent } from "@/components/storefront/catalog-page";
import { buildTenantMetadata, getTenantSeoRequestContext, resolveTenantSeoSnapshotByRequest } from "@/lib/seo";
import { parseCatalogSearchParams } from "@/lib/presentation/catalog-routing";
import { getCategories } from "@/lib/storefront-api";

type CatalogCategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function resolveCategoryMetadata(
  slug: string,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const requestContext = await getTenantSeoRequestContext();
  const snapshot = await resolveTenantSeoSnapshotByRequest(requestContext);

  try {
    const categories = await getCategories(requestContext.resolvedHost);
    const resolution = parseCatalogSearchParams(searchParams, categories, slug);

    return { snapshot, resolution };
  } catch {
    return {
      snapshot,
      resolution: parseCatalogSearchParams(searchParams, [], slug),
    };
  }
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
    noIndex: !resolution.selectedCategory,
  });
}

export default async function CatalogCategoryPage({
  params,
  searchParams,
}: CatalogCategoryPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const routeData = await loadCatalogRouteData(resolvedSearchParams, slug);

  if (!routeData.selectedCategory) {
    notFound();
  }

  return (
    <CatalogPageContent
      bootstrap={routeData.experience.bootstrap}
      categories={routeData.categories}
      host={routeData.experience.runtime.context.host}
      previewToken={routeData.experience.runtime.context.previewToken}
      products={routeData.experience.catalog?.products ?? []}
      query={routeData.query}
      selectedCategory={routeData.selectedCategory}
    />
  );
}
