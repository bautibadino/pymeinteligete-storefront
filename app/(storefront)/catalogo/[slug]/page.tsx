import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { loadCatalogRouteData, resolveCatalogRoute } from "@/app/(storefront)/catalogo/_lib/catalog-data";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { CatalogPageContent } from "@/components/storefront/catalog-page";
import { buildTenantMetadata, getTenantSeoRequestContext, resolveTenantSeoSnapshotByRequest } from "@/lib/seo";
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from "@/lib/seo/json-ld";

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
    query.minPrice === undefined &&
    query.maxPrice === undefined &&
    query.onlyImmediate === undefined &&
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
  const description = resolution.selectedCategory?.description
    ?? (resolution.selectedCategory
      ? `Explorá ${resolution.selectedCategory.name.toLowerCase()} disponibles en ${snapshot.title}. Envíos a todo el país.`
      : null);

  return buildTenantMetadata(snapshot, {
    pathname: resolution.pathname,
    title,
    description,
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

  const host = routeData.experience.runtime.context.host;
  const canonicalBase = `https://${host}`;
  const products = routeData.experience.catalog?.products ?? [];
  const itemListJsonLd = products.length > 0
    ? buildItemListJsonLd(
        products.map((p) => ({ slug: p.slug, name: p.name })),
        canonicalBase,
      )
    : null;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: `${canonicalBase}/` },
    { name: "Catálogo", url: `${canonicalBase}/catalogo` },
    ...(routeData.selectedCategory
      ? [{ name: routeData.selectedCategory.name, url: `${canonicalBase}/catalogo/${encodeURIComponent(slug)}` }]
      : []),
  ]);

  return (
    <Fragment>
      {itemListJsonLd && <JsonLdScript data={itemListJsonLd} />}
      <JsonLdScript data={breadcrumbJsonLd} />
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
    </Fragment>
  );
}
