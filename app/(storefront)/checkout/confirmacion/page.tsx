import type { Metadata } from "next";

import { loadBootstrapExperience, resolveTenantDisplayName } from "@/app/(storefront)/_lib/storefront-shell-data";
import { ConfirmationSummary } from "@/components/storefront/checkout/confirmation-summary";
import { PageIntro, SplitPanel } from "@/components/storefront/page-sections";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/checkout/confirmacion",
    title: `${snapshot.title} | Confirmacion`,
    noIndex: true,
  });
}

export default async function CheckoutConfirmationPage() {
  const experience = await loadBootstrapExperience();
  const host = experience.runtime.context.host;
  const displayName = resolveTenantDisplayName(experience.bootstrap, host);

  return (
    <>
      <PageIntro
        eyebrow="Confirmación por token"
        title={`Resultado de orden en ${displayName}`}
        description="La confirmación requiere un token firmado de pedido para consultar el estado real en PyMEInteligente."
        aside={
          <div className="stat-stack">
            <div className="stat-box">
              <span>Host</span>
              <strong className="mono">{host}</strong>
            </div>
            <div className="stat-box">
              <span>Estado tienda</span>
              <strong>{experience.bootstrap?.shopStatus ?? "sin resolver"}</strong>
            </div>
          </div>
        }
      />

      <ConfirmationSummary
        order={null}
        issue="Falta el token firmado del pedido. Volvé al checkout o usá el enlace de confirmación recibido después de crear la orden."
        orderToken=""
        paymentMethods={[]}
      />

      <SplitPanel
        title="Consulta segura de pedido"
        description="Esta superficie no lee identificadores de orden desde query string. La ruta válida es `/checkout/confirmacion/[token]`."
      >
        <ol className="timeline-list">
          <li>Consumir `GET /api/storefront/v1/orders/:token`.</li>
          <li>Mantener checkout y confirmación fuera de indexación.</li>
          <li>Exponer pago manual sólo con token firmado y payload documentado.</li>
        </ol>
      </SplitPanel>
    </>
  );
}
