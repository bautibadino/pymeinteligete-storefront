import type { ReactNode } from "react";

import type { StorefrontBootstrap, StorefrontNavLink } from "@/lib/storefront-api";

import {
  resolveModules,
  resolveStatusMessage,
  resolveStatusTone,
  resolveTenantDescription,
  resolveTenantDisplayName,
  resolveTenantLogoUrl,
  type FetchIssue,
} from "@/app/(storefront)/_lib/storefront-shell-data";

const FALLBACK_NAVIGATION: StorefrontNavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/checkout", label: "Checkout" },
];

type StorefrontShellProps = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
  children: ReactNode;
  issues: FetchIssue[];
};

export function StorefrontShell({ bootstrap, host, children, issues }: StorefrontShellProps) {
  const displayName = resolveTenantDisplayName(bootstrap, host);
  const description =
    resolveTenantDescription(bootstrap) ??
    "Storefront host-driven conectado a PyMEInteligente sin replicar lógica del ERP.";
  const logoUrl = resolveTenantLogoUrl(bootstrap);
  const statusTone = resolveStatusTone(bootstrap?.tenant.status ?? null);
  const statusMessage = resolveStatusMessage(bootstrap?.tenant.status ?? null);
  const modules = resolveModules(bootstrap);
  const contactEmail = bootstrap?.contact?.email;
  const contactPhone = bootstrap?.contact?.phone;
  const headerLinks = bootstrap?.navigation?.headerLinks ?? FALLBACK_NAVIGATION;
  const footerColumns = bootstrap?.navigation?.footerColumns ?? [];

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
              {headerLinks.map((item) => (
                <a
                  key={item.href}
                  className="storefront-navlink"
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {item.label}
                </a>
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
            {modules.slice(0, 4).map((module, index) => {
              const payloadTitle =
                typeof module.payload === "object" && module.payload !== null && "title" in module.payload
                  ? String((module.payload as Record<string, unknown>).title)
                  : undefined;

              return (
                <article key={module.id ?? `module-${index}`} className="module-chip">
                  <span className="module-chip-type">{module.type ?? "modulo"}</span>
                  <strong>{payloadTitle ?? "Contenido configurable"}</strong>
                </article>
              );
            })}
          </section>
        ) : null}

        <div className="storefront-content">{children}</div>

        {footerColumns.length > 0 ? (
          <footer className="storefront-footer" aria-label="Pie de página">
            <div className="footer-columns">
              {footerColumns.map((column) => (
                <div key={column.title} className="footer-column">
                  <strong>{column.title}</strong>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </footer>
        ) : null}
      </div>
    </main>
  );
}
