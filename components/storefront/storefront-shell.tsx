import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import type { StorefrontBootstrap, StorefrontNavLink } from "@/lib/storefront-api";

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

const DEBUG_ENABLED = process.env.NEXT_PUBLIC_STOREFRONT_DEBUG === "true";

function resolveStatusBadgeVariant(statusTone: ReturnType<typeof resolveStatusTone>) {
  if (statusTone === "live") return "success";
  if (statusTone === "paused") return "warning";
  return "outline";
}

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
    <main className="min-h-dvh bg-white text-foreground">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="bg-slate-950 px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
            <Badge variant={resolveStatusBadgeVariant(statusTone)}>{statusMessage}</Badge>
            <span className="truncate">{contactPhone ? `Atención: ${contactPhone}` : description}</span>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 md:grid-cols-[220px_minmax(260px,640px)_120px] md:gap-6">
          <Link className="flex min-w-0 items-center gap-3" href="/" aria-label={`Inicio de ${displayName}`}>
            <span className="grid h-10 w-24 shrink-0 place-items-center" aria-hidden="true">
              {logoUrl ? (
                <img className="h-full w-full object-contain" src={logoUrl} alt="" />
              ) : (
                <span className="font-heading text-xl font-bold">{displayName.slice(0, 2).toUpperCase()}</span>
              )}
            </span>
            <span className="hidden truncate text-sm font-black tracking-tight text-slate-950 sm:inline">
              {displayName}
            </span>
          </Link>

          <form
            className="order-3 col-span-2 grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 md:order-none md:col-span-1"
            action="/catalogo"
          >
            <Search className="size-4 text-slate-500" aria-hidden="true" />
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
            <Button className="h-8 rounded-lg px-4" type="submit">
              Buscar
            </Button>
          </form>

          <div className="flex justify-end">
            <Button asChild size="icon" variant="ghost">
              <Link href="/checkout" aria-label="Ir al checkout">
                <ShoppingCart className="size-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <Separator />

        <nav className="mx-auto flex min-h-11 max-w-7xl items-center justify-start gap-6 overflow-x-auto px-4 text-sm font-bold text-slate-600 md:justify-center md:gap-9" aria-label="Navegación pública">
          {headerLinks.map((item) => (
            <Link
              key={item.href}
              className="whitespace-nowrap transition-colors hover:text-slate-950"
              href={item.href as Route}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {DEBUG_ENABLED ? (
          <div className="border-t border-dashed border-slate-200 px-4 py-2 text-center text-xs text-slate-500">
            <span className="font-mono">{host}</span>
            {contactEmail ? <span className="ml-3">{contactEmail}</span> : null}
          </div>
        ) : null}
      </header>

      {DEBUG_ENABLED && issues.length > 0 ? (
        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-5 md:grid-cols-[1fr_1fr]" aria-label="Estado técnico del tenant">
          <div>
            <strong>Integración parcial</strong>
            <p className="mt-1 text-sm text-muted">
              La shell está conectada al tenant por host, pero todavía hay respuestas faltantes
              o incompletas del backend actual.
            </p>
          </div>
          <ul className="grid gap-2">
            {issues.map((issue, index) => (
              <li className="rounded-lg border border-dashed border-slate-300 p-3 text-sm" key={`${issue.surface}-${issue.code ?? "na"}-${index}`}>
                <span className="font-mono">{issue.surface}</span>
                <span className="ml-2">{issue.message}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:py-10">{children}</div>

      {footerColumns.length > 0 ? (
        <footer className="border-t border-slate-200 bg-slate-50" aria-label="Pie de página">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-2">
            {footerColumns.map((column) => (
              <div key={column.title} className="grid content-start gap-3">
                <strong>{column.title}</strong>
                <ul className="grid gap-2 text-sm text-muted">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="hover:text-foreground"
                        href={link.href as Route}
                        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
