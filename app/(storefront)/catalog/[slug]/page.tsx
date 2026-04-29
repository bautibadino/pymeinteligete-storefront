import type { Route } from "next";
import { permanentRedirect } from "next/navigation";

import {
  buildCatalogAliasRedirectHref,
  type CatalogAliasSearchParams,
} from "@/app/(storefront)/catalog/_lib/catalog-alias";

type CatalogAliasCategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogAliasSearchParams>;
};

export default async function CatalogAliasCategoryPage({
  params,
  searchParams,
}: CatalogAliasCategoryPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  permanentRedirect(
    buildCatalogAliasRedirectHref(
      `/catalogo/${encodeURIComponent(slug)}`,
      resolvedSearchParams,
    ) as Route,
  );
}
