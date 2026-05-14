import { Search } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import {
  resolveStatusMessage,
  resolveStatusTone,
  resolveTenantDescription,
  resolveTenantDisplayName,
  resolveTenantLogoUrl,
  type FetchIssue,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import {
  PresentationGlobalAnnouncementBar,
  PresentationGlobalFooter,
  PresentationGlobalHeader,
} from "@/components/presentation/PresentationRenderer";
import { BymStorefrontShell } from "@/components/storefront/bym-storefront-shell";
import { HeaderCartButton } from "@/components/storefront/cart/header-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { isBymCustomExperience } from "@/lib/experiences/storefront-experience";
import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";
import type {
  StorefrontBootstrap,
  StorefrontCategory,
  StorefrontNavLink,
} from "@/lib/storefront-api";

const FALLBACK_NAVIGATION: StorefrontNavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

type StorefrontShellProps = {
  bootstrap: StorefrontBootstrap | null;
  categories?: StorefrontCategory[];
  host: string;
  children: ReactNode;
  issues: FetchIssue[];
};

const DEBUG_ENABLED = process.env.NEXT_PUBLIC_STOREFRONT_DEBUG === "true";

function resolveStatusBadgeVariant(
  statusTone: ReturnType<typeof resolveStatusTone>,
) {
  if (statusTone === "live") return "success";
  if (statusTone === "paused") return "warning";
  return "outline";
}

export function StorefrontShell({
  bootstrap,
  categories = [],
  host,
  children,
  issues,
}: StorefrontShellProps) {
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
  const headerLinks =
    bootstrap?.navigation?.headerLinks ?? FALLBACK_NAVIGATION;
  const footerColumns = bootstrap?.navigation?.footerColumns ?? [];

  if (isBymCustomExperience(bootstrap)) {
    return (
      <BymStorefrontShell
        bootstrap={bootstrap}
        categories={categories}
        host={host}
        issues={issues}
      >
        {children}
      </BymStorefrontShell>
    );
  }

  if (presentation) {
    const presentationContext = { bootstrap, host };

    return (
      <main className="presentation-shell" data-storefront-mode="presentation">
        <div
          className="sticky top-0 z-50 bg-paper/84 shadow-sm backdrop-blur-xl"
          data-presentation-chrome="sticky-stack"
        >
          <PresentationGlobalAnnouncementBar
            presentation={presentation}
            context={presentationContext}
          />
          <PresentationGlobalHeader
            presentation={presentation}
            context={presentationContext}
          />
        </div>
        <div className="presentation-shell-content">{children}</div>
        <PresentationGlobalFooter
          presentation={presentation}
          context={presentationContext}
        />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur-xl">
        <div className="bg-secondary px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-secondary-foreground">
          <div className="mx-auto flex max-w-content items-center justify-center gap-3">
            <Badge variant={resolveStatusBadgeVariant(statusTone)}>
              {statusMessage}
            </Badge>
            <span className="truncate">
              {contactPhone ? `Atención: ${contactPhone}` : description}
            </span>
          </div>
        </div>

        <div className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 md:grid-cols-[220px_minmax(260px,640px)_120px] md:gap-6">
          <Link
            className="flex min-w-0 items-center gap-3"
            href="/"
            aria-label={`Inicio de ${displayName}`}
          >
            <span className="grid h-10 w-24 shrink-0 place-items-center" aria-hidden="true">
              {logoUrl ? (
                <img className="h-full w-full object-contain" src={logoUrl} alt="" />
              ) : (
                <span className="font-heading text-xl font-bold">
                  {displayName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </span>
            <span className="hidden truncate text-sm font-black tracking-tight text-foreground sm:inline">
              {displayName}
            </span>
          </Link>

          <form
            className="order-3 col-span-2 grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border bg-panel px-3 py-1.5 md:order-none md:col-span-1"
            action="/catalogo"
          >
            <Search className="size-4 text-muted" aria-hidden="true" />
            <label className="sr-only" htmlFor="storefront-search-input">
              Buscar productos
            </label>
            <Input
              id="storefront-search-input"
              className="h-8 border-0 bg-transparent px-0 py-0 shadow-none ring-offset-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              name="search"
              placeholder="Buscar neumáticos, filtros, aceites..."
              type="search"
            />
            <Button className="h-8 rounded-md px-4" type="submit">
              Buscar
            </Button>
          </form>

          <div className="flex justify-end">
            <HeaderCartButton className="rounded-lg" />
          </div>
        </div>

        <Separator />

        <nav
          className="mx-auto flex min-h-11 max-w-content items-center justify-start gap-6 overflow-x-auto px-4 text-sm font-bold text-muted md:justify-center md:gap-9"
          aria-label="Navegación pública"
        >
          {headerLinks.map((item) => (
            <Link
              key={item.href}
              className="whitespace-nowrap transition-colors hover:text-foreground"
              href={item.href as Route}
              prefetch={shouldPrefetchStorefrontLink(item.href)}
              {...(item.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {DEBUG_ENABLED ? (
          <div className="border-t border-dashed border-border px-4 py-2 text-center text-xs text-muted">
            <span className="font-mono">{host}</span>
            {contactEmail ? <span className="ml-3">{contactEmail}</span> : null}
          </div>
        ) : null}
      </header>

      {DEBUG_ENABLED && issues.length > 0 ? (
        <section
          className="mx-auto grid max-w-content gap-4 px-4 py-5 md:grid-cols-[1fr_1fr]"
          aria-label="Estado técnico del tenant"
        >
          <div>
            <strong>Integración parcial</strong>
            <p className="mt-1 text-sm text-muted">
              La shell está conectada al tenant por host, pero todavía hay respuestas faltantes
              o incompletas del backend actual.
            </p>
          </div>
          <ul className="grid gap-2">
            {issues.map((issue, index) => (
              <li
                className="rounded-lg border border-dashed border-border p-3 text-sm"
                key={`${issue.surface}-${issue.code ?? "na"}-${index}`}
              >
                <span className="font-mono">{issue.surface}</span>
                <span className="ml-2">{issue.message}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mx-auto grid max-w-content gap-6 px-4 py-8 md:py-10">
        {children}
      </div>

      {footerColumns.length > 0 ? (
        <footer className="border-t border-border bg-panel" aria-label="Pie de página">
          <div className="mx-auto grid max-w-content gap-6 px-4 py-8 md:grid-cols-2">
            {footerColumns.map((column) => (
              <div key={column.title} className="grid content-start gap-3">
                <strong>{column.title}</strong>
                <ul className="grid gap-2 text-sm text-muted">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="hover:text-foreground"
                        href={link.href as Route}
                        prefetch={shouldPrefetchStorefrontLink(link.href)}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </footer>
      ) : null}
    </main>
  );
}
