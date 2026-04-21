import type { Metadata } from "next";

import {
  canAccessCheckout,
  loadCheckoutExperience,
  resolveTenantDisplayName,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { CheckoutForm } from "@/components/storefront/checkout/checkout-form";
import { PageIntro, SplitPanel } from "@/components/storefront/page-sections";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseInitialItems(searchParams: Record<string, string | string[] | undefined>) {
  const productId = getSingleValue(searchParams.productId);
  const quantityValue = Number(getSingleValue(searchParams.quantity));
  const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;

  if (!productId) {
    return [];
  }

  return [
    {
      productId,
      quantity,
    },
  ];
}

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/checkout",
    title: `${snapshot.title} | Checkout`,
    noIndex: true,
  });
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = await searchParams;
  const experience = await loadCheckoutExperience();
  const host = experience.runtime.context.host;
  const displayName = resolveTenantDisplayName(experience.bootstrap, host);
  const initialItems = parseInitialItems(resolvedSearchParams);
  const canCheckout = canAccessCheckout(experience.bootstrap?.shopStatus ?? null);
  const visibleMethods = experience.paymentMethods?.items.length ?? 0;

  return (
    <>
      <PageIntro
        eyebrow="Checkout host-driven"
        title={`Checkout de ${displayName}`}
        description="La orden ya se crea con `POST /api/storefront/v1/checkout`, usando host, bootstrap y disponibilidad pública reales del tenant actual. El pago automático queda pendiente hasta cerrar el payload seguro del proveedor."
        aside={
          <div className="stat-stack">
            <div className="stat-box">
              <span>Host</span>
              <strong className="mono">{host}</strong>
            </div>
            <div className="stat-box">
              <span>Métodos visibles</span>
              <strong>{visibleMethods}</strong>
            </div>
          </div>
        }
      />

      <SurfaceStateCard
        shopStatus={experience.bootstrap?.shopStatus ?? null}
        surface="checkout"
        title="El checkout sólo está habilitado cuando la tienda está activa."
        description="La política documentada bloquea esta superficie para `paused`, `draft` y `disabled`. La UI ya refleja esa restricción sin recalcular negocio."
      />

      {canCheckout ? (
        <SplitPanel
          title="Crear orden oficial"
          description="La superficie envía cliente, dirección e items explícitos al backend. No replica reglas del ERP ni construye pagos inventados del lado del frontend."
        >
          <CheckoutForm paymentMethods={experience.paymentMethods} initialItems={initialItems} />
        </SplitPanel>
      ) : null}

      <SplitPanel
        title="Estado de integración"
        description="El checkout ya crea órdenes oficiales. La siguiente fase puede acoplar el procesamiento de pago y la confirmación por token sin rehacer la superficie."
      >
        <ol className="timeline-list">
          <li>`getPaymentMethods(host)` ya alimenta la superficie visible del tenant.</li>
          <li>`postCheckout(host, payload)` ya crea la orden desde una action server-side.</li>
          <li>`processPayment()` queda pendiente hasta cerrar el `paymentData` real del proveedor.</li>
          <li>La navegación final debería migrar a una confirmación basada en `orderToken` firmado.</li>
        </ol>
      </SplitPanel>
    </>
  );
}
