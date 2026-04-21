import type { Metadata } from "next";

import { loadCatalogExperience, loadCheckoutExperience, resolveTenantDisplayName } from "@/app/(storefront)/_lib/storefront-shell-data";
import { CatalogGrid } from "@/components/storefront/catalog-grid";
import { HomeHero, ModuleDeck, PaymentMethodsPanel } from "@/components/storefront/commerce-panels";
import { PageIntro, SplitPanel } from "@/components/storefront/page-sections";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/",
  });
}

export default async function HomePage() {
  const [catalogExperience, checkoutExperience] = await Promise.all([
    loadCatalogExperience({ pageSize: 6 }),
    loadCheckoutExperience(),
  ]);
  const host = catalogExperience.runtime.context.host;
  const displayName = resolveTenantDisplayName(catalogExperience.bootstrap, host);

  return (
    <>
      <HomeHero bootstrap={catalogExperience.bootstrap} host={host} />

      <SurfaceStateCard
        shopStatus={catalogExperience.bootstrap?.shopStatus ?? null}
        surface="home"
        title="La tienda todavía no está abierta al tráfico público normal."
        description="El bootstrap existe como contrato base, pero el `shopStatus` actual no habilita una home comercial completa."
      />

      <PageIntro
        eyebrow="Home del tenant"
        title={`Base storefront para ${displayName}`}
        description="La portada ya consume bootstrap real por host, reacciona al estado de la tienda y expone una shell lista para sumar módulos comerciales específicos."
        aside={
          <div className="stat-stack">
            <div className="stat-box">
              <span>Version storefront</span>
              <strong className="mono">{catalogExperience.runtime.context.storefrontVersion}</strong>
            </div>
            <div className="stat-box">
              <span>Request ID</span>
              <strong className="mono">{catalogExperience.runtime.context.requestId}</strong>
            </div>
          </div>
        }
      />

      <SplitPanel
        title="Composición base del tenant"
        description="Los módulos visibles salen del bootstrap y no de una configuración global del deploy."
      >
        <ModuleDeck bootstrap={catalogExperience.bootstrap} />
      </SplitPanel>

      <SplitPanel
        title="Selección pública inicial"
        description="Si el estado de tienda lo permite, la home ya consume una primera página de catálogo por host."
      >
        <CatalogGrid
          products={catalogExperience.catalog?.items ?? []}
          emptyTitle="Catálogo todavía no expuesto"
          emptyDescription="La shell ya quedó conectada al fetcher real, pero esta tienda no devolvió productos públicos en la respuesta actual."
        />
      </SplitPanel>

      <SplitPanel
        title="Checkout parcial"
        description="La experiencia comercial completa queda para la siguiente fase, pero los métodos visibles ya pueden representarse sin duplicar reglas del ERP."
      >
        <PaymentMethodsPanel paymentMethods={checkoutExperience.paymentMethods} />
      </SplitPanel>
    </>
  );
}
