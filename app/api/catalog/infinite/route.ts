import { NextResponse } from "next/server";

import { mapCatalogProductsToCardData } from "@/components/presentation/render-context";
import { parseCatalogSearchParams } from "@/lib/presentation/catalog-routing";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import { getCatalog, getCategories } from "@/lib/storefront-api";

function toSearchParamsRecord(searchParams: URLSearchParams): Record<string, string | undefined> {
  const record: Record<string, string | undefined> = {};

  for (const [key, value] of searchParams.entries()) {
    record[key] = value;
  }

  return record;
}

export async function GET(request: Request) {
  const runtime = await getStorefrontRuntimeSnapshot();
  const url = new URL(request.url);
  const routeCategorySlug = url.searchParams.get("routeCategorySlug") ?? undefined;
  const searchParamsRecord = toSearchParamsRecord(url.searchParams);
  const shouldResolveCategories = Boolean(
    routeCategorySlug ??
      searchParamsRecord.categoryId ??
      searchParamsRecord.category,
  );

  try {
    const categories = shouldResolveCategories
      ? await getCategories(runtime.context)
      : [];
    const resolution = parseCatalogSearchParams(
      searchParamsRecord,
      categories,
      routeCategorySlug,
    );
    const catalog = await getCatalog(runtime.context, resolution.query);

    return NextResponse.json({
      products: mapCatalogProductsToCardData(
        catalog.products,
        catalog.products.length,
      ),
      pagination: catalog.pagination,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo cargar la siguiente página del catálogo.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
