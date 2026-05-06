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
        eyebrow="Confirmación de compra"
        title={`No encontramos tu enlace de confirmación en ${displayName}`}
        description="Para ver el estado real de una orden necesitás abrir la confirmación firmada que se genera al terminar el checkout."
        aside={
          <div className="stat-stack">
            <div className="stat-box">
              <span>Tienda</span>
              <strong>{displayName}</strong>
            </div>
            <div className="stat-box">
              <span>Estado</span>
              <strong>{experience.bootstrap?.tenant.status ?? "sin resolver"}</strong>
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
        title="Cómo retomarlo"
        description="La forma correcta de volver a una compra es usando el enlace firmado que deja el checkout o el que te comparta el comercio."
      >
        <ol className="timeline-list">
          <li>Volvé al checkout si todavía no generaste la orden.</li>
          <li>Usá el link de confirmación recibido después de crearla.</li>
          <li>Si no lo tenés, contactá al comercio para recuperar el estado del pedido.</li>
        </ol>
      </SplitPanel>
    </>
  );
}
