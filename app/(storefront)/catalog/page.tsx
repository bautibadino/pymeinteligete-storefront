import type { Route } from "next";
import { permanentRedirect } from "next/navigation";

import {
  buildCatalogAliasRedirectHref,
  type CatalogAliasSearchParams,
} from "@/app/(storefront)/catalog/_lib/catalog-alias";

type CatalogAliasPageProps = {
  searchParams: Promise<CatalogAliasSearchParams>;
};

export default async function CatalogAliasPage({ searchParams }: CatalogAliasPageProps) {
  permanentRedirect(
    buildCatalogAliasRedirectHref("/catalogo", await searchParams) as Route,
  );
}
