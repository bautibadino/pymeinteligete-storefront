import type { Metadata } from "next";

import {
  loadBootstrapExperience,
  resolveTenantDisplayName,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { PageIntro, SplitPanel } from "@/components/storefront/page-sections";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";

type CheckoutErrorPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

const ERROR_COPY: Record<string, { title: string; description: string }> = {
  payment_failed: {
    title: "El pago no pudo procesarse",
    description:
      "Hubo un problema al procesar el pago. Podés volver al checkout e intentar otra vez con el mismo pedido o elegir otro método.",
  },
  stock: {
    title: "La disponibilidad cambió durante el checkout",
    description:
      "La composición del pedido ya no coincide con el stock actual. Revisá el checkout o consultá el catálogo antes de reintentar.",
  },
  expired: {
    title: "La sesión del checkout expiró",
    description:
      "La sesión pública del checkout venció antes de completar la operación. Reiniciá el flujo desde el checkout para obtener un estado válido.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/checkout/error",
    title: `${snapshot.title} | Error de checkout`,
    noIndex: true,
  });
}

export default async function CheckoutErrorPage({ searchParams }: CheckoutErrorPageProps) {
  const [{ reason }, experience] = await Promise.all([searchParams, loadBootstrapExperience()]);
  const copy = ERROR_COPY[reason ?? ""] ?? {
    title: "No pudimos completar el checkout",
    description:
      "Hubo un error inesperado durante el flujo de compra. Podés volver al checkout o revisar los canales públicos del tenant para seguir.",
  };
  const host = experience.runtime.context.host;
  const displayName = resolveTenantDisplayName(experience.bootstrap, host);

  return (
    <>
      <PageIntro
        eyebrow="Error de checkout"
        title={`${copy.title} · ${displayName}`}
        description={copy.description}
        aside={
          <div className="stat-stack">
            <div className="stat-box">
              <span>Host</span>
              <strong className="mono">{host}</strong>
            </div>
            <div className="stat-box">
              <span>Estado tienda</span>
              <strong>{experience.bootstrap?.tenant.status ?? "sin resolver"}</strong>
            </div>
          </div>
        }
      />

      <SplitPanel
        title="Cómo retomar el flujo"
        description="El storefront externo no recrea estados intermedios del ERP. Reutilizá las superficies públicas vigentes para continuar."
      >
        <ul className="timeline-list">
          <li>
            Volvé a <a href="/checkout">/checkout</a> para reiniciar el intento con el estado público actual.
          </li>
          <li>
            Si el problema fue de stock, revisá <a href="/catalogo">/catalogo</a> antes de volver a intentar.
          </li>
          <li>
            Si ya existe una orden, usá el enlace firmado de confirmación o consultá <a href="/contacto">/contacto</a>.
          </li>
        </ul>
      </SplitPanel>
    </>
  );
}
