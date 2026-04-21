import Link from "next/link";
import type { ReactNode } from "react";

import type { StorefrontBootstrap } from "@/lib/storefront-api";

import {
  resolveModules,
  resolveStatusMessage,
  resolveStatusTone,
  resolveTenantDescription,
  resolveTenantDisplayName,
  resolveTenantLogoUrl,
  type FetchIssue,
} from "@/app/(storefront)/_lib/storefront-shell-data";

type StorefrontShellProps = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
  children: ReactNode;
  issues: FetchIssue[];
};

const NAVIGATION_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/checkout", label: "Checkout" },
] as const;

export function StorefrontShell({ bootstrap, host, children, issues }: StorefrontShellProps) {
  const displayName = resolveTenantDisplayName(bootstrap, host);
  const description =
    resolveTenantDescription(bootstrap) ??
    "Storefront host-driven conectado a PyMEInteligente sin replicar lógica del ERP.";
  const logoUrl = resolveTenantLogoUrl(bootstrap);
  const statusTone = resolveStatusTone(bootstrap?.shopStatus ?? null);
  const statusMessage = resolveStatusMessage(bootstrap?.shopStatus ?? null);
  const modules = resolveModules(bootstrap);
  const contactEmail = bootstrap?.contact?.email;
  const contactPhone = bootstrap?.contact?.phone;

  return (
    <main className="storefront-frame">
      <div className="storefront-shell">
        <header className="storefront-topbar">
          <div className="storefront-brand">
            <div className="storefront-brandmark" aria-hidden="true">
              {logoUrl ? (
                <img src={logoUrl} alt="" />
              ) : (
                <span>{displayName.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div className="storefront-brandcopy">
              <span className="storefront-kicker">PyMEInteligente storefront</span>
              <h1 className="storefront-title">{displayName}</h1>
              <p className="storefront-subtitle">{description}</p>
            </div>
          </div>

          <div className="storefront-meta">
            <nav className="storefront-nav" aria-label="Navegación pública">
              {NAVIGATION_ITEMS.map((item) => (
                <Link key={item.href} className="storefront-navlink" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="storefront-contact">
              <span className={`status-badge status-badge-${statusTone}`}>{statusMessage}</span>
              <div className="storefront-contactline">
                <span className="meta-label">Host</span>
                <span className="meta-value mono">{host}</span>
              </div>
              {contactEmail ? (
                <div className="storefront-contactline">
                  <span className="meta-label">Contacto</span>
                  <span className="meta-value">{contactEmail}</span>
                </div>
              ) : null}
              {contactPhone ? (
                <div className="storefront-contactline">
                  <span className="meta-label">Teléfono</span>
                  <span className="meta-value">{contactPhone}</span>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {issues.length > 0 ? (
          <section className="storefront-alertband" aria-label="Estado técnico del tenant">
            <div className="storefront-alertcopy">
              <strong>Integración parcial</strong>
              <p>
                La shell está conectada al tenant por `host`, pero todavía hay respuestas faltantes
                o incompletas del backend actual.
              </p>
            </div>
            <ul className="storefront-alertlist">
              {issues.map((issue, index) => (
                <li key={`${issue.surface}-${issue.code ?? "na"}-${index}`}>
                  <span className="mono">{issue.surface}</span>
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {modules.length > 0 ? (
          <section className="storefront-modulebar" aria-label="Módulos expuestos por bootstrap">
            {modules.slice(0, 4).map((module, index) => (
              <article key={module.id ?? module.title ?? `module-${index}`} className="module-chip">
                <span className="module-chip-type">{module.type ?? "modulo"}</span>
                <strong>{module.title ?? "Contenido configurable"}</strong>
              </article>
            ))}
          </section>
        ) : null}

        <div className="storefront-content">{children}</div>
      </div>
    </main>
  );
}
