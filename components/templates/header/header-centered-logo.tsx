import Link from "next/link";
import type { Route } from "next";
import { Search } from "lucide-react";

import { HeaderCartButton } from "@/components/storefront/cart/header-cart-button";
import type { HeaderModule } from "@/lib/modules/header";

/**
 * Header Centered Logo — logo centrado, navegación principal debajo,
 * búsqueda y carrito en los extremos superiores.
 *
 * Ideal para boutique, marcas premium o tiendas editoriales donde el
 * logo es el elemento de identidad principal.
 *
 * Search + cart son placeholders visuales V1 (no funcionales).
 */
export function HeaderCenteredLogo({ module }: { module: HeaderModule }) {
  const {
    id,
    logoUrl,
    logoHref = "/",
    logoAlt = "Logo",
    navLinks = [],
    showSearch = true,
    searchPlaceholder = "Buscar productos...",
    showCart = true,
    topBarLinks = [],
  } = module;

  return (
    <header
      aria-label="Encabezado del sitio"
      className="w-full border-b border-border bg-paper"
      data-template="header-centered-logo"
      data-module-id={id}
    >
      {/* Top bar */}
      {topBarLinks.length > 0 ? (
        <div className="border-b border-border bg-panel px-4">
          <div className="mx-auto flex max-w-content items-center justify-end gap-4 py-1.5">
            {topBarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as Route}
                className="text-xs text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-content px-4">
        <div className="flex items-center justify-between gap-3 py-3 sm:hidden">
          <div className="flex min-w-0 flex-1 items-center justify-start">
            {showSearch ? (
              <button
                type="button"
                aria-label={searchPlaceholder}
                className="flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-panel hover:text-foreground"
              >
                <Search className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Buscar</span>
              </button>
            ) : null}
          </div>

          <div className="flex items-center justify-center">
            <Link
              href={logoHref as Route}
              aria-label="Inicio"
              className="block"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span className="font-heading text-xl font-bold text-foreground">
                  {logoAlt}
                </span>
              )}
            </Link>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            {showCart ? (
              <HeaderCartButton />
            ) : null}
          </div>
        </div>

        <div className="hidden grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center py-4 sm:grid">
          <div className="flex min-w-0 items-center justify-start">
            {showSearch ? (
              <button
                type="button"
                aria-label={searchPlaceholder}
                className="flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-panel hover:text-foreground"
              >
                <Search className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{searchPlaceholder}</span>
              </button>
            ) : null}
          </div>

          <div className="flex items-center justify-center">
            <Link href={logoHref as Route} aria-label="Inicio" className="block">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span className="font-heading text-xl font-bold text-foreground">
                  {logoAlt}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center justify-end gap-1">
            {showCart ? <HeaderCartButton /> : null}
          </div>
        </div>

        {navLinks.length > 0 ? (
          <nav aria-label="Navegación principal" className="border-t border-border">
            <ul className="flex items-center justify-start gap-1 overflow-x-auto py-2 whitespace-nowrap sm:justify-center">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as Route}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-panel hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
