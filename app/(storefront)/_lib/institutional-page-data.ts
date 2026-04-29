import {
  loadBootstrapExperience,
  resolveTenantDisplayName,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import type {
  StorefrontBootstrap,
  StorefrontContact,
  StorefrontNavLink,
  StorefrontPage,
} from "@/lib/storefront-api";

export type ContactEntry = {
  label: string;
  value: string;
  href?: string;
};

export type InstitutionalPageData = {
  bootstrap: StorefrontBootstrap | null;
  displayName: string;
  host: string;
  contactEntries: ContactEntry[];
  footerLinks: StorefrontNavLink[];
  matchingPage: StorefrontPage | null;
  visiblePaymentMethods: string[];
};

export function buildContactEntries(contact?: StorefrontContact): ContactEntry[] {
  if (!contact) {
    return [];
  }

  return [
    contact.email
      ? { label: "Email", value: contact.email, href: `mailto:${contact.email}` }
      : null,
    contact.phone
      ? { label: "Teléfono", value: contact.phone, href: `tel:${contact.phone}` }
      : null,
    contact.whatsapp
      ? {
          label: "WhatsApp",
          value: contact.whatsapp,
          href: `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`,
        }
      : null,
    contact.address ? { label: "Dirección", value: contact.address } : null,
  ].filter((entry): entry is ContactEntry => Boolean(entry));
}

export function flattenFooterLinks(
  bootstrap: Pick<StorefrontBootstrap, "navigation"> | null,
): StorefrontNavLink[] {
  const seen = new Set<string>();
  const links: StorefrontNavLink[] = [];

  for (const column of bootstrap?.navigation.footerColumns ?? []) {
    for (const link of column.links ?? []) {
      const key = `${link.href}:${link.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push(link);
    }
  }

  return links;
}

export function humanizePaymentMethod(methodId: string): string {
  return methodId
    .split(/[_-]/g)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function resolveMatchingPage(
  pages: StorefrontPage[],
  pathname: string,
): StorefrontPage | null {
  const slug = pathname.replace(/^\//, "");

  return pages.find((page) => page.slug === slug) ?? null;
}

export async function loadInstitutionalPageData(
  pathname: string,
): Promise<InstitutionalPageData> {
  const experience = await loadBootstrapExperience();
  const host = experience.runtime.context.host;
  const bootstrap = experience.bootstrap;

  return {
    bootstrap,
    displayName: resolveTenantDisplayName(bootstrap, host),
    host,
    contactEntries: buildContactEntries(bootstrap?.contact),
    footerLinks: flattenFooterLinks(bootstrap),
    matchingPage: resolveMatchingPage(bootstrap?.pages ?? [], pathname),
    visiblePaymentMethods: bootstrap?.commerce.payment.visibleMethods ?? [],
  };
}
