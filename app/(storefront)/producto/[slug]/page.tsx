import { Fragment } from "react";
import type { Metadata } from "next";
import {
  canBrowseCatalog,
  loadProductExperience,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { ProductDetailPanel } from "@/components/storefront/commerce-panels";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import { PreviewBridge } from "@/components/presentation/PreviewBridge";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { mapCatalogProductToCardData } from "@/components/presentation/render-context";
import { buildProductPresentationContext } from "@/app/(storefront)/producto/_lib/presentation-context";
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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const [{ slug }, requestContext] = await Promise.all([params, getTenantSeoRequestContext()]);
  const snapshot = await resolveTenantSeoSnapshotByRequest(requestContext);

  if (!canBrowseCatalog(snapshot.shopStatus)) {
    return buildTenantMetadata(snapshot, {
      pathname: `/producto/${slug}`,
      title: `${snapshot.title} | Producto`,
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
      title: product.name ? `${product.name} | ${snapshot.title}` : `${snapshot.title} | Producto`,
      description: product.description ?? snapshot.description,
      imageUrl: productCard?.imageUrl ?? snapshot.ogImageUrl,
      noIndex: !productCard?.slug,
    });
  } catch (error) {
    const noIndex = error instanceof StorefrontApiError && error.status === 404;

    return buildTenantMetadata(snapshot, {
      pathname: `/producto/${slug}`,
      title: `${snapshot.title} | Producto`,
      noIndex,
    });
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const experience = await loadProductExperience(slug);
  const hasPreview = Boolean(experience.runtime.context.previewToken);

  const usePresentation = shouldUsePresentation(experience.bootstrap?.presentation, "product");

  if (usePresentation) {
    return (
      <Fragment>
        {hasPreview ? <PreviewBridge /> : null}
        <PresentationRenderer
          presentation={experience.bootstrap!.presentation!}
          page="product"
          includeGlobals={false}
          context={buildProductPresentationContext(experience)}
        />
      </Fragment>
    );
  }

  return (
    <Fragment>
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
