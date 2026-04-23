import type { Metadata } from "next";

import { loadHomeExperience } from "@/app/(storefront)/_lib/storefront-shell-data";
import { ModuleRenderer } from "@/components/modules/ModuleRenderer";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { normalizeModules } from "@/lib/modules";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";
import { resolveTenantTheme } from "@/lib/theme";

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/",
  });
}

export default async function HomePage() {
  const experience = await loadHomeExperience();
  const host = experience.runtime.context.host;
  const theme = resolveTenantTheme(experience.bootstrap);
  const modules = normalizeModules({
    bootstrap: experience.bootstrap,
    theme,
    host,
  });

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
    </>
  );
}
