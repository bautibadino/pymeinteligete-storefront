import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  loadBootstrapExperience,
  resolveTenantDisplayName,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { PageIntro, SplitPanel } from "@/components/storefront/page-sections";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";

type ManualConfirmationCompatibilityPageProps = {
  searchParams: Promise<{
    order?: string;
    method?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/checkout/confirmacion-manual",
    title: `${snapshot.title} | Confirmacion manual`,
    noIndex: true,
  });
}

export default async function ManualConfirmationCompatibilityPage({
  searchParams,
}: ManualConfirmationCompatibilityPageProps) {
  const [{ order, method }, experience] = await Promise.all([
    searchParams,
    loadBootstrapExperience(),
  ]);

  if (order) {
    redirect(`/checkout/confirmacion/${encodeURIComponent(order)}`);
  }

  const host = experience.runtime.context.host;
  const displayName = resolveTenantDisplayName(experience.bootstrap, host);

  return (
    <>
      <PageIntro
        eyebrow="Compatibilidad manual"
        title={`Confirmación manual en ${displayName}`}
        description="Esta ruta existe por compatibilidad con enlaces heredados. El flujo vigente de confirmación y pago manual se resuelve por token firmado."
        aside={
          <div className="stat-stack">
            <div className="stat-box">
              <span>Host</span>
              <strong className="mono">{host}</strong>
            </div>
            <div className="stat-box">
              <span>Método</span>
              <strong>{method ?? "sin informar"}</strong>
            </div>
          </div>
        }
      />

      <SplitPanel
        title="Ruta pública vigente"
        description="El storefront externo ya no depende de un paso separado para mostrar instrucciones manuales."
      >
        <ul className="timeline-list">
          <li>Si tenés un token de orden, abrí la confirmación firmada recibida después del checkout.</li>
          <li>La vista `checkout/confirmacion/[token]` muestra el estado real del pedido y habilita pago manual si corresponde.</li>
          <li>Si no contás con el token, retomá el flujo desde <a href="/checkout">/checkout</a> o usá <a href="/contacto">/contacto</a>.</li>
        </ul>
      </SplitPanel>
    </>
  );
}
