import { Fragment } from "react";
import type { Metadata } from "next";

import {
  canBrowseCatalog,
  loadBootstrapExperience,
  loadProductExperience,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import {
  buildProductPresentationContext,
  hydrateProductPresentationWithRuntimeSignals,
} from "@/app/(storefront)/producto/_lib/presentation-context";
import { ProductViewTracker } from "@/components/analytics/storefront-commerce-analytics";
import { SportAdventureProductExperience } from "@/components/experiences/sportadventure";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import { mapCatalogProductToCardData } from "@/components/presentation/render-context";
import { PreviewBridge } from "@/components/presentation/PreviewBridge";
import { ProductDetailPanel } from "@/components/storefront/commerce-panels";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { resolveCustomExperienceKey } from "@/lib/experiences";
import { shouldUsePresentation } from "@/lib/presentation/render-utils";
import {
  buildTenantMetadata,
  getTenantSeoRequestContext,
  resolveTenantSeoSnapshotByRequest,
} from "@/lib/seo";
import { StorefrontApiError, getProduct } from "@/lib/storefront-api";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const [{ slug }, requestContext] = await Promise.all([
    params,
    getTenantSeoRequestContext(),
  ]);
  const [snapshot, experience] = await Promise.all([
    resolveTenantSeoSnapshotByRequest(requestContext),
    loadBootstrapExperience(),
  ]);
  const customExperienceKey = resolveCustomExperienceKey(experience.bootstrap);

  const tenantTitle =
    customExperienceKey === "sportadventure-custom-v1"
      ? "SportAdventure"
      : snapshot.title;

  if (!canBrowseCatalog(snapshot.shopStatus)) {
    return buildTenantMetadata(snapshot, {
      pathname: `/producto/${slug}`,
      title: `${tenantTitle} | Producto`,
      noIndex: true,
    });
  }

  try {
    const storefrontInput = requestContext.tenantSlug
      ? {
          host: requestContext.resolvedHost,
          requestId: `seo-${requestContext.tenantSlug}-product`,
          storefrontVersion: "seo",
          tenantSlug: requestContext.tenantSlug,
        }
      : requestContext.resolvedHost;
    const product = await getProduct(storefrontInput, slug);
    const productCard = mapCatalogProductToCardData(product);

    return buildTenantMetadata(snapshot, {
      pathname: `/producto/${slug}`,
      title: product.name ? `${product.name} | ${tenantTitle}` : `${tenantTitle} | Producto`,
      description: product.description ?? snapshot.description,
      imageUrl: productCard?.imageUrl ?? snapshot.ogImageUrl,
      noIndex: !productCard?.slug,
    });
  } catch (error) {
    const noIndex = error instanceof StorefrontApiError && error.status === 404;

    return buildTenantMetadata(snapshot, {
      pathname: `/producto/${slug}`,
      title: `${tenantTitle} | Producto`,
      noIndex,
    });
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const experience = await loadProductExperience(slug);
  const hasPreview = Boolean(experience.runtime.context.previewToken);
  const customExperienceKey = resolveCustomExperienceKey(experience.bootstrap);
  const hydratedPresentation = hydrateProductPresentationWithRuntimeSignals(
    experience.bootstrap?.presentation,
    experience,
  );

  const usePresentation = shouldUsePresentation(
    hydratedPresentation ?? undefined,
    "product",
  );
  const productCard = experience.product
    ? mapCatalogProductToCardData(experience.product, experience.bootstrap)
    : null;
  const analyticsProduct = productCard
    ? {
        id: productCard.id,
        name: productCard.name,
        price: productCard.price.amount,
        ...(productCard.brand ? { brand: productCard.brand } : {}),
      }
    : null;

  if (customExperienceKey === "sportadventure-custom-v1") {
    return (
      <Fragment>
        <ProductViewTracker product={analyticsProduct} />
        {hasPreview ? <PreviewBridge /> : null}
        <SportAdventureProductExperience product={experience.product} />
      </Fragment>
    );
  }

  if (usePresentation) {
    return (
      <Fragment>
        <ProductViewTracker product={analyticsProduct} />
        {hasPreview ? <PreviewBridge /> : null}
        <PresentationRenderer
          presentation={hydratedPresentation!}
          page="product"
          includeGlobals={false}
          context={buildProductPresentationContext(experience)}
        />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <ProductViewTracker product={analyticsProduct} />
      <SurfaceStateCard
        shopStatus={experience.bootstrap?.tenant.status ?? null}
        surface="product"
        title="El detalle de producto no está disponible para este estado de tienda."
      />

      <ProductDetailPanel product={experience.product} />

      {hasPreview ? <PreviewBridge /> : null}
    </Fragment>
  );
}
