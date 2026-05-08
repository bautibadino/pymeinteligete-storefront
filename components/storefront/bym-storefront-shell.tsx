import type { ReactNode } from "react";

import { BymHeader } from "@/components/storefront/bym-header";
import type { FetchIssue } from "@/app/(storefront)/_lib/storefront-shell-data";
import type { StorefrontBootstrap, StorefrontCategory, StorefrontNavLink } from "@/lib/storefront-api";

type BymStorefrontShellProps = {
  bootstrap: StorefrontBootstrap | null;
  categories?: StorefrontCategory[];
  children: ReactNode;
  host: string;
  issues: FetchIssue[];
};

const FALLBACK_LINKS: StorefrontNavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

function resolveDisplayName(bootstrap: StorefrontBootstrap | null, host: string): string {
  return bootstrap?.branding?.storeName ?? bootstrap?.tenant?.tenantSlug ?? host;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readTextLikeValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return readString(value);
  }

  if (!isRecord(value)) {
    return undefined;
  }

  return readString(value.text) ?? readString(value.label) ?? readString(value.title) ?? readString(value.message);
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(readTextLikeValue).filter((entry): entry is string => Boolean(entry));
}

function readCta(value: unknown): { label: string; href: string } | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const label = readString(value.label);
  const href = readString(value.href);
  return label && href ? { label, href } : undefined;
}

function resolveAnnouncement(bootstrap: StorefrontBootstrap | null) {
  const bar = bootstrap?.presentation?.globals.announcementBar;
  if (!bar?.enabled || !isRecord(bar.content)) {
    return undefined;
  }

  const content = bar.content;
  const explicitMessages = [
    ...readStringArray(content.messages),
    ...readStringArray(content.rotatingMessages),
  ];
  const fallbackMessage = readString(content.message);
  const itemMessages = readStringArray(content.items);
  const resolvedMessages =
    explicitMessages.length > 0
      ? explicitMessages
      : fallbackMessage
        ? [fallbackMessage]
        : itemMessages;

  const cta = readCta(content.cta);

  return resolvedMessages.length > 0
    ? {
        messages: Array.from(new Set(resolvedMessages)),
        ...(cta ? { cta } : {}),
      }
    : undefined;
}

function BymFooterLink({ link }: { link: StorefrontNavLink }) {
  const isExternal = link.external || /^https?:\/\//.test(link.href);

  if (isExternal) {
    return (
      <a
        href={link.href}
        className="text-sm text-white/62 transition hover:text-white"
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.label}
      </a>
    );
  }

  return (
    <a href={link.href} className="text-sm text-white/62 transition hover:text-white">
      {link.label}
    </a>
  );
}

function BymFooter({
  bootstrap,
  displayName,
  host,
  links,
}: {
  bootstrap: StorefrontBootstrap | null;
  displayName: string;
  host: string;
  links: StorefrontNavLink[];
}) {
  const logoUrl = bootstrap?.branding?.logoUrl;
  const footerColumns = bootstrap?.navigation?.footerColumns ?? [];
  const contact = bootstrap?.contact;
  const columns = footerColumns.length > 0
    ? footerColumns
    : [{ title: "Navegación", links }];
  const whatsappHref = contact?.whatsapp
    ? contact.whatsapp.startsWith("http")
      ? contact.whatsapp
      : `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
    : undefined;

  return (
    <footer className="border-t border-white/10 bg-[#070707] text-white" data-bym-footer="true">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:px-8 lg:py-16">
        <div className="space-y-5">
          <a href="/" className="inline-flex items-center gap-3" aria-label={`Inicio de ${displayName}`}>
            {logoUrl ? (
              <img className="h-12 w-auto max-w-40 object-contain" src={logoUrl} alt="" />
            ) : (
              <span className="grid h-12 w-12 place-items-center border border-white/20 text-sm font-bold">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </a>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f4c542]">{displayName}</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/62">
              Tienda online y atención comercial para neumáticos, repuestos y servicios.
            </p>
          </div>
          <p className="text-xs text-white/38">{host}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">{column.title}</h2>
              <nav className="grid gap-2" aria-label={column.title}>
                {column.links.map((link) => (
                  <BymFooterLink key={`${column.title}-${link.href}-${link.label}`} link={link} />
                ))}
              </nav>
            </div>
          ))}

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Contacto</h2>
            <div className="grid gap-2">
              {contact?.email ? (
                <a className="text-sm text-white/62 transition hover:text-white" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              ) : null}
              {whatsappHref ? (
                <a className="text-sm text-white/62 transition hover:text-white" href={whatsappHref}>
                  WhatsApp
                </a>
              ) : null}
              {contact?.address ? (
                <p className="text-sm leading-6 text-white/62">{contact.address}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function BymStorefrontShell({
  bootstrap,
  categories = [],
  children,
  host,
  issues,
}: BymStorefrontShellProps) {
  const displayName = resolveDisplayName(bootstrap, host);
  const logoUrl = bootstrap?.branding?.logoUrl;
  const links = bootstrap?.navigation?.headerLinks?.length
    ? bootstrap.navigation.headerLinks
    : FALLBACK_LINKS;
  const announcement = resolveAnnouncement(bootstrap);
  const debug = process.env.NEXT_PUBLIC_STOREFRONT_DEBUG === "true";

  return (
    <main className="bym-custom-shell min-h-dvh bg-[#070707] text-white" data-storefront-mode="bym-custom-v1">
      <BymHeader
        {...(announcement ? { announcement } : {})}
        categories={categories}
        displayName={displayName}
        links={links}
        {...(logoUrl ? { logoUrl } : {})}
      />

      {debug && issues.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-3 text-xs text-white/70 sm:px-6 lg:px-8">
          {issues.map((issue, index) => (
            <p key={`${issue.surface}-${index}`}>{issue.surface}: {issue.message}</p>
          ))}
        </section>
      ) : null}

      <div className="bym-custom-shell-content">{children}</div>
      <BymFooter bootstrap={bootstrap} displayName={displayName} host={host} links={links} />
    </main>
  );
}
