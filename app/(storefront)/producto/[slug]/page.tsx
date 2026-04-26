import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  canBrowseCatalog,
  loadProductExperience,
  resolveTenantDisplayName,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { ProductDetailPanel } from "@/components/storefront/commerce-panels";
import { PageIntro, SplitPanel } from "@/components/storefront/page-sections";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import { PreviewBridge } from "@/components/presentation/PreviewBridge";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
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
    const product = await getProduct(requestContext.resolvedHost, slug);

    return buildTenantMetadata(snapshot, {
      pathname: `/producto/${slug}`,
      title: product.name ? `${product.name} | ${snapshot.title}` : `${snapshot.title} | Producto`,
      description: product.description ?? snapshot.description,
      imageUrl: product.images?.[0] ?? snapshot.ogImageUrl,
      noIndex: !product.slug,
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
  const host = experience.runtime.context.host;
  const displayName = resolveTenantDisplayName(experience.bootstrap, host);
  const cookieStore = await cookies();
  const hasPreview = cookieStore.has("__preview_token");

  const usePresentation = shouldUsePresentation(experience.bootstrap?.presentation, "product");

  if (usePresentation) {
    return (
      <>
        {hasPreview ? <PreviewBridge /> : null}
        <PresentationRenderer
          presentation={experience.bootstrap!.presentation!}
          page="product"
          includeGlobals={false}
        />
      </>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="Detalle de producto"
        title={experience.product?.name ?? `Producto ${slug}`}
        description={`La vista usa el tenant ${displayName} y resuelve el detalle por host + slug, sin depender de IDs globales en el frontend.`}
        aside={
          <div className="stat-stack">
            <div className="stat-box">
              <span>Slug</span>
              <strong className="mono">{slug}</strong>
            </div>
            <div className="stat-box">
              <span>Host</span>
              <strong className="mono">{host}</strong>
            </div>
          </div>
        }
      />

      <SurfaceStateCard
        shopStatus={experience.bootstrap?.tenant.status ?? null}
        surface="product"
        title="El detalle de producto no está disponible para este estado de tienda."
      />

      <SplitPanel
        title="Ficha pública"
        description="La superficie ya usa `GET /api/storefront/v1/products/:slug` cuando el estado de tienda habilita exponer productos."
      >
        <ProductDetailPanel product={experience.product} />
      </SplitPanel>

      {hasPreview ? <PreviewBridge /> : null}
    </>
  );
}
