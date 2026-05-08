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
  const phone = bootstrap?.contact?.phone ?? bootstrap?.contact?.whatsapp;
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
        {...(phone ? { phone } : {})}
      />

      {debug && issues.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-3 text-xs text-white/70 sm:px-6 lg:px-8">
          {issues.map((issue, index) => (
            <p key={`${issue.surface}-${index}`}>{issue.surface}: {issue.message}</p>
          ))}
        </section>
      ) : null}

      <div className="bym-custom-shell-content">{children}</div>
    </main>
  );
}
