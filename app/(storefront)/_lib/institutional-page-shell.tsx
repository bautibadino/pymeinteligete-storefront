import type { ReactNode } from "react";
import type { Metadata } from "next";

import type {
  ContactEntry,
  InstitutionalPageData,
} from "@/app/(storefront)/_lib/institutional-page-data";
import {
  humanizePaymentMethod,
  loadInstitutionalPageData,
} from "@/app/(storefront)/_lib/institutional-page-data";
import { PageIntro } from "@/components/storefront/page-sections";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";

type InstitutionalPageShellProps = {
  pathname: string;
  title: string;
  description?: string;
  children?: ReactNode;
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

function renderLinkList(links: Array<{ href: string; label: string }>) {
  if (links.length === 0) {
    return <p>No hay enlaces públicos adicionales publicados en el footer de esta tienda.</p>;
  }

  return (
    <ul className="timeline-list">
      {links.map((link) => (
        <li key={`${link.href}:${link.label}`}>
          <a href={link.href}>{link.label}</a>
        </li>
      ))}
    </ul>
  );
}

function renderContactEntries(entries: ContactEntry[]) {
  if (entries.length === 0) {
    return <p>La tienda todavía no publicó canales de contacto directos en el bootstrap actual.</p>;
  }

  return (
    <ul className="timeline-list">
      {entries.map((entry) => (
        <li key={`${entry.label}:${entry.value}`}>
          <strong>{entry.label}:</strong>{" "}
          {entry.href ? <a href={entry.href}>{entry.value}</a> : entry.value}
        </li>
      ))}
    </ul>
  );
}

function renderInstitutionalFallback(
  pathname: string,
  data: InstitutionalPageData,
) {
  const relatedLinks = data.footerLinks.filter((link) => link.href !== pathname).slice(0, 6);
  const paymentMethods = data.visiblePaymentMethods.map(humanizePaymentMethod);
  const pageExcerpt = data.matchingPage?.excerpt;

  const sections: Array<{ title: string; body: ReactNode }> = [
    {
      title: "Resumen público",
      body: pageExcerpt ? (
        <p>{pageExcerpt}</p>
      ) : (
        <p>
          {data.displayName} publica esta sección para centralizar información útil del tenant usando
          el bootstrap real disponible hoy.
        </p>
      ),
    },
  ];

  switch (pathname) {
    case "/contacto":
      sections.push({
        title: "Canales disponibles",
        body: renderContactEntries(data.contactEntries),
      });
      break;
    case "/medios-de-pago":
      sections.push({
        title: "Métodos visibles",
        body:
          paymentMethods.length > 0 ? (
            <ul className="timeline-list">
              {paymentMethods.map((method) => (
                <li key={method}>{method}</li>
              ))}
            </ul>
          ) : (
            <p>La tienda todavía no expone métodos visibles en el bootstrap actual.</p>
          ),
      });
      break;
    case "/envios-y-entregas":
    case "/garantia":
    case "/mayoristas":
    case "/trabajos":
      sections.push({
        title: "Cómo continuar",
        body: (
          <>
            <p>
              Esta superficie usa información pública del tenant. Para confirmar cobertura, garantías,
              condiciones comerciales o postulaciones, seguí los canales ya publicados por la tienda.
            </p>
            {renderContactEntries(data.contactEntries)}
          </>
        ),
      });
      break;
    case "/privacidad":
    case "/terminos":
      sections.push({
        title: "Identidad del sitio",
        body: (
          <ul className="timeline-list">
            <li>
              <strong>Tienda:</strong> {data.displayName}
            </li>
            <li>
              <strong>Host:</strong> {data.host}
            </li>
            <li>
              <strong>Estado:</strong> {data.bootstrap?.tenant.status ?? "sin resolver"}
            </li>
          </ul>
        ),
      });
      break;
    case "/sucursales":
      sections.push({
        title: "Punto de atención publicado",
        body: renderContactEntries(
          data.contactEntries.filter((entry) => entry.label === "Dirección"),
        ),
      });
      break;
    case "/preguntas-frecuentes":
      sections.push({
        title: "Preguntas frecuentes rápidas",
        body: (
          <ul className="timeline-list">
            <li>
              <strong>¿La tienda está operativa?</strong> {data.bootstrap?.tenant.status ?? "sin resolver"}.
            </li>
            <li>
              <strong>¿Qué medios de pago se muestran?</strong>{" "}
              {paymentMethods.length > 0 ? paymentMethods.join(", ") : "Todavía no publicados"}.
            </li>
            <li>
              <strong>¿Cómo contacto al tenant?</strong>{" "}
              {data.contactEntries.length > 0 ? "Desde los canales publicados abajo." : "Sin canales públicos aún."}
            </li>
          </ul>
        ),
      });
      break;
    default:
      sections.push({
        title: "Canales útiles",
        body: renderContactEntries(data.contactEntries),
      });
      break;
  }

  sections.push({
    title: "Enlaces relacionados",
    body: renderLinkList(relatedLinks),
  });

  return (
    <div className="fallback-content">
      {sections.map((section) => (
        <article key={section.title} className="empty-state-card">
          <h3>{section.title}</h3>
          {section.body}
        </article>
      ))}
    </div>
  );
}

export async function InstitutionalPageShell({
  pathname,
  title,
  description,
  children,
}: InstitutionalPageShellProps) {
  const data = await loadInstitutionalPageData(pathname);

  return (
    <>
      <PageIntro
        eyebrow="Información institucional"
        title={`${title} · ${data.displayName}`}
        description={
          description ??
          "Esta superficie usa el bootstrap público del tenant para mostrar información útil y verificable sin depender de placeholders hardcodeados."
        }
        aside={
          <div className="stat-stack">
            <div className="stat-box">
              <span>Host</span>
              <strong className="mono">{data.host}</strong>
            </div>
            <div className="stat-box">
              <span>Estado tienda</span>
              <strong>{data.bootstrap?.tenant.status ?? "sin resolver"}</strong>
            </div>
          </div>
        }
      />

      <SurfaceStateCard
        shopStatus={data.bootstrap?.tenant.status ?? null}
        surface="home"
        title="La tienda todavía no está abierta al tráfico público normal."
        description="El storefront respeta el `shopStatus` del tenant también para sus superficies institucionales."
      />

      <section className="institutional-content">
        {children ?? renderInstitutionalFallback(pathname, data)}
      </section>
    </>
  );
}
