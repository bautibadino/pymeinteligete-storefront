import type { ReactNode } from "react";

import {
  loadBootstrapExperience,
  resolveTenantDisplayName,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { PageIntro } from "@/components/storefront/page-sections";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";
import type { Metadata } from "next";

type InstitutionalPageShellProps = {
  pathname: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export async function generateInstitutionalMetadata(
  pathname: string,
  title: string,
): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname,
    title: `${snapshot.title} | ${title}`,
  });
}

export async function InstitutionalPageShell({
  pathname,
  title,
  description,
  children,
}: InstitutionalPageShellProps) {
  const experience = await loadBootstrapExperience();
  const host = experience.runtime.context.host;
  const displayName = resolveTenantDisplayName(experience.bootstrap, host);

  return (
    <>
      <PageIntro
        eyebrow="Información institucional"
        title={`${title} · ${displayName}`}
        description={
          description ??
          "Esta página muestra información institucional del tenant. El contenido final puede provenir del backend cuando el contrato de contenido esté disponible."
        }
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

      <SurfaceStateCard
        shopStatus={experience.bootstrap?.tenant.status ?? null}
        surface="home"
        title="La tienda todavía no está abierta al tráfico público normal."
        description="El bootstrap existe como contrato base, pero el `shopStatus` actual no habilita contenido institucional completo."
      />

      <section className="institutional-content">{children}</section>
    </>
  );
}
