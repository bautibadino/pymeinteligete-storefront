import type { Metadata } from "next";
import { cookies } from "next/headers";

import { loadHomeExperience } from "@/app/(storefront)/_lib/storefront-shell-data";
import { ModuleRenderer } from "@/components/modules/ModuleRenderer";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import { PreviewBridge } from "@/components/presentation/PreviewBridge";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { normalizeModules } from "@/lib/modules";
import { shouldUsePresentation } from "@/lib/presentation/render-utils";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";
import { applyTemplateOverrides } from "@/lib/templates/apply-overrides";
import { resolveTenantTheme } from "@/lib/theme";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/",
  });
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [experience, resolvedSearchParams] = await Promise.all([
    loadHomeExperience(),
    searchParams,
  ]);
  const host = experience.runtime.context.host;
  const theme = resolveTenantTheme(experience.bootstrap);
  const cookieStore = await cookies();
  const hasPreview = cookieStore.has("__preview_token");

  const usePresentation = shouldUsePresentation(experience.bootstrap?.presentation, "home");

  if (usePresentation) {
    return (
      <>
        {hasPreview ? <PreviewBridge /> : null}
        <PresentationRenderer
          presentation={experience.bootstrap!.presentation!}
          page="home"
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
