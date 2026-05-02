import Link from "next/link";
import type { Route } from "next";
import { Search, Menu } from "lucide-react";

import { HeaderCartButton } from "@/components/storefront/cart/header-cart-button";
import type { HeaderModule } from "@/lib/modules/header";

/**
 * Header Sticky Compact — header compacto que se pega al top del viewport
 * mientras el usuario hace scroll. Logo + búsqueda inline + carrito,
 * todo en una sola fila. Menú hamburguesa para navegación en mobile.
 *
 * Ideal para tiendas con catálogos largos donde el usuario necesita
 * acceder rápidamente a búsqueda y carrito desde cualquier punto de la página.
 *
 * Search + cart son placeholders visuales V1 (no funcionales).
 */
export function HeaderStickyCompact({ module }: { module: HeaderModule }) {
  const {
    id,
    logoUrl,
    logoHref = "/",
    logoAlt = "Logo",
    navLinks = [],
    showSearch = true,
    searchPlaceholder = "Buscar...",
    showCart = true,
  } = module;

  return (
    <header
      aria-label="Encabezado del sitio"
      className="sticky top-0 z-40 w-full border-b border-border bg-paper/95 shadow-tenant backdrop-blur-sm"
      data-template="header-sticky-compact"
      data-module-id={id}
    >
      <div className="mx-auto max-w-content px-4">
        <div className="flex items-center gap-3 py-3">
          {/* Logo */}
          <Link href={logoHref as Route} aria-label="Inicio" className="shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="font-heading text-lg font-bold text-foreground">
                {logoAlt}
              </span>
            )}
          </Link>

          {/* Nav links — desktop only */}
          {navLinks.length > 0 ? (
            <nav aria-label="Navegación principal" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href as Route}
                      className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-panel hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {/* Search inline — ocupa espacio disponible */}
          {showSearch ? (
            <button
              type="button"
              aria-label={searchPlaceholder}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-panel px-3 py-1.5 text-sm text-muted transition-colors hover:border-primary"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{searchPlaceholder}</span>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {showCart ? (
              <HeaderCartButton className="p-1.5" />
            ) : null}
            {/* Mobile menu toggle placeholder */}
            {navLinks.length > 0 ? (
              <button
                type="button"
                aria-label="Abrir menú"
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-panel hover:text-foreground lg:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
