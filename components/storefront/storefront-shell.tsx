import { Search, ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";

import type { StorefrontBootstrap, StorefrontNavLink } from "@/lib/storefront-api";
import {
  PresentationGlobalAnnouncementBar,
  PresentationGlobalFooter,
  PresentationGlobalHeader,
} from "@/components/presentation/PresentationRenderer";

import {
  resolveStatusMessage,
  resolveStatusTone,
  resolveTenantDescription,
  resolveTenantDisplayName,
  resolveTenantLogoUrl,
  type FetchIssue,
} from "@/app/(storefront)/_lib/storefront-shell-data";

const FALLBACK_NAVIGATION: StorefrontNavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

type StorefrontShellProps = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
  children: ReactNode;
  issues: FetchIssue[];
};

// Debug info (module chip bar, host activo) se muestra sólo con
// STOREFRONT_DEBUG=true. Así un preview Vercel en producción no
// expone información de plomería a usuarios finales.
const DEBUG_ENABLED = process.env.NEXT_PUBLIC_STOREFRONT_DEBUG === "true";

export function StorefrontShell({ bootstrap, host, children, issues }: StorefrontShellProps) {
  const presentation = bootstrap?.presentation ?? null;
  const displayName = resolveTenantDisplayName(bootstrap, host);
  const description =
    resolveTenantDescription(bootstrap) ??
    "Storefront host-driven conectado a PyMEInteligente sin replicar lógica del ERP.";
  const logoUrl = resolveTenantLogoUrl(bootstrap);
  const statusTone = resolveStatusTone(bootstrap?.tenant.status ?? null);
  const statusMessage = resolveStatusMessage(bootstrap?.tenant.status ?? null);
  const contactEmail = bootstrap?.contact?.email;
  const contactPhone = bootstrap?.contact?.phone;
  const headerLinks = bootstrap?.navigation?.headerLinks ?? FALLBACK_NAVIGATION;
  const footerColumns = bootstrap?.navigation?.footerColumns ?? [];

  if (presentation) {
    const presentationContext = { bootstrap, host };

    return (
      <main className="presentation-frame" data-storefront-mode="presentation">
        <div data-presentation-renderer="true" data-page="shell">
          <PresentationGlobalAnnouncementBar
            presentation={presentation}
            context={presentationContext}
          />
          <PresentationGlobalHeader presentation={presentation} context={presentationContext} />
          <div className="presentation-page-content">{children}</div>
          <PresentationGlobalFooter presentation={presentation} context={presentationContext} />
        </div>
      </main>
    );
  }

  return (
    <main className="storefront-frame">
      <div className="storefront-shell">
        <header className="storefront-topbar">
          <div className="storefront-announcement">
            <span className={`status-badge status-badge-${statusTone}`}>{statusMessage}</span>
            <span>{contactPhone ? `Atención: ${contactPhone}` : description}</span>
          </div>

          <div className="storefront-mainbar">
            <a className="storefront-brand" href="/" aria-label={`Inicio de ${displayName}`}>
              <span className="storefront-brandmark" aria-hidden="true">
                {logoUrl ? (
                  <img src={logoUrl} alt="" />
                ) : (
                  <span>{displayName.slice(0, 2).toUpperCase()}</span>
                )}
              </span>
              <span className="storefront-brandname">{displayName}</span>
            </a>

            <form className="storefront-search" action="/catalogo">
              <Search className="storefront-search-icon" aria-hidden="true" />
              <label className="sr-only" htmlFor="storefront-search-input">
                Buscar productos
              </label>
              <input
                id="storefront-search-input"
                name="search"
                placeholder="Buscar neumáticos, filtros, aceites..."
                type="search"
              />
              <button type="submit">Buscar</button>
            </form>

            <div className="storefront-actions">
              <a className="storefront-iconlink storefront-cartlink" href="/checkout" aria-label="Ir al checkout">
                <ShoppingCart aria-hidden="true" />
              </a>
            </div>
          </div>

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

          {DEBUG_ENABLED ? (
            <div className="storefront-debugline">
              <span className="meta-label">Host</span>
              <span className="meta-value mono">{host}</span>
              {contactEmail ? <span>{contactEmail}</span> : null}
            </div>
          ) : null}
        </header>

        {DEBUG_ENABLED && issues.length > 0 ? (
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
