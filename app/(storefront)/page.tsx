import type { Metadata } from "next";
import { headers } from "next/headers";

import { loadHomeExperience } from "@/app/(storefront)/_lib/storefront-shell-data";
import { PymeStoreLanding } from "@/components/marketing/pyme-store-landing";
import { ModuleRenderer } from "@/components/modules/ModuleRenderer";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import { PreviewBridge } from "@/components/presentation/PreviewBridge";
import { BymHomePage } from "@/components/storefront/bym-home-page";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { isBymCustomExperience } from "@/lib/experiences/storefront-experience";
import { isPymeStoreMarketingHost } from "@/lib/marketing/pyme-store-host";
import { buildPymeStoreMetadata } from "@/lib/marketing/pyme-store-seo";
import { normalizeModules } from "@/lib/modules";
import { shouldUsePresentation } from "@/lib/presentation/render-utils";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";
import { resolveRequestHostFromHeaders } from "@/lib/tenancy/resolve-request-host";
import { applyTemplateOverrides } from "@/lib/templates/apply-overrides";
import { resolveEffectiveTenantTheme } from "@/lib/theme";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const host = resolveRequestHostFromHeaders(await headers());

  if (isPymeStoreMarketingHost(host)) {
    return buildPymeStoreMetadata();
  }

  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/",
  });
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const requestHost = resolveRequestHostFromHeaders(await headers());

  if (isPymeStoreMarketingHost(requestHost)) {
    return <PymeStoreLanding />;
  }

  const [experience, resolvedSearchParams] = await Promise.all([
    loadHomeExperience(),
    searchParams,
  ]);
  const host = experience.runtime.context.host;
  const theme = resolveEffectiveTenantTheme(experience.bootstrap);
  const hasPreview = Boolean(experience.runtime.context.previewToken);
  const usePresentation = shouldUsePresentation(experience.bootstrap?.presentation, "home");

  if (isBymCustomExperience(experience.bootstrap)) {
    return (
      <>
        {hasPreview ? <PreviewBridge /> : null}
        <BymHomePage
          bootstrap={experience.bootstrap}
          categories={experience.categories}
          products={experience.catalog?.products ?? []}
        />
      </>
    );
  }

  if (usePresentation) {
    const presentationContext = {
      bootstrap: experience.bootstrap,
      host,
      products: experience.catalog?.products ?? [],
      categories: experience.categories,
      paymentMethods: experience.paymentMethods?.paymentMethods ?? [],
    };

    return (
      <>
        {hasPreview ? <PreviewBridge /> : null}
        <PresentationRenderer
          presentation={experience.bootstrap!.presentation!}
          page="home"
          includeGlobals={false}
          context={presentationContext}
        />
      </>
    );
  }

  const baseModules = normalizeModules({
    bootstrap: experience.bootstrap,
    theme,
    host,
  });
  // Permite previsualizar templates desde la URL (`?hero=workshop`)
  // sin mutar la configuración persistida del tenant. El editor del
  // ERP usará el mismo mecanismo para el preview iframe (Fase 4).
  const modules = applyTemplateOverrides(baseModules, resolvedSearchParams);

  return (
    <>
      <SurfaceStateCard
        shopStatus={experience.bootstrap?.tenant.status ?? null}
        surface="home"
        title="La tienda todavía no está abierta al tráfico público normal."
        description="El bootstrap existe como contrato base, pero el `shopStatus` actual no habilita una home comercial completa."
      />

      <ModuleRenderer
        modules={modules}
        bootstrap={experience.bootstrap}
        theme={theme}
        host={host}
        products={experience.catalog?.products ?? []}
        categories={experience.categories}
        paymentMethods={experience.paymentMethods?.paymentMethods ?? []}
      />

      {hasPreview ? <PreviewBridge /> : null}
    </>
  );
}
