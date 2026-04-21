import type { Metadata } from "next";

import { loadBootstrapExperience, resolveTenantDisplayName } from "@/app/(storefront)/_lib/storefront-shell-data";
import { ConfirmationSummary } from "@/components/storefront/checkout/confirmation-summary";
import { PageIntro, SplitPanel } from "@/components/storefront/page-sections";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";
import { StorefrontApiError, getOrderByToken, type StorefrontOrderByTokenResult } from "@/lib/storefront-api";

type ConfirmationTokenPageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/checkout/confirmacion",
    title: `${snapshot.title} | Confirmacion`,
    noIndex: true,
  });
}

async function resolveOrderByToken(
  context: Awaited<ReturnType<typeof loadBootstrapExperience>>["runtime"]["context"],
  token: string,
): Promise<{
  order: StorefrontOrderByTokenResult | null;
  issue?: string;
}> {
  if (!token) {
    return {
      order: null,
      issue: "Falta el token firmado del pedido.",
    };
  }

  try {
    return {
      order: await getOrderByToken(context, token),
    };
  } catch (error) {
    if (error instanceof StorefrontApiError) {
      return {
        order: null,
        issue: error.message,
      };
    }

    return {
      order: null,
      issue: "No se pudo consultar el estado del pedido con el token firmado.",
    };
  }
}

export default async function CheckoutConfirmationTokenPage({
  params,
}: ConfirmationTokenPageProps) {
  const [{ token }, experience] = await Promise.all([params, loadBootstrapExperience()]);
  const host = experience.runtime.context.host;
  const displayName = resolveTenantDisplayName(experience.bootstrap, host);
  const { order, issue } = await resolveOrderByToken(experience.runtime.context, token);

  return (
    <>
      <PageIntro
        eyebrow="Confirmación por token"
        title={`Resultado de orden en ${displayName}`}
        description="La confirmación consulta el pedido con un token firmado y mantiene la URL libre de identificadores internos o totales transicionales."
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

      <ConfirmationSummary order={order} issue={issue} />

      <SplitPanel
        title="Contrato usado"
        description="La vista se resuelve por `GET /api/storefront/v1/orders/:token`; el backend conserva la validación del recurso y del tenant."
      >
        <ol className="timeline-list">
          <li>El token viene de `postCheckout()`.</li>
          <li>La consulta usa el `host` actual como contexto público.</li>
          <li>La ruta se mantiene no indexable.</li>
        </ol>
      </SplitPanel>
    </>
  );
}
