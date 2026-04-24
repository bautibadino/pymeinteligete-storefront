import Link from "next/link";
import type { Route } from "next";
import { Search, ShoppingCart, User } from "lucide-react";

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
    showAccount = false,
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

      {/* Main row: search left | logo center | cart right */}
      <div className="mx-auto max-w-content px-4">
        <div className="grid grid-cols-3 items-center py-4">
          {/* Left: search placeholder */}
          <div className="flex items-center justify-start">
            {showSearch ? (
              <button
                type="button"
                aria-label={searchPlaceholder}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-panel hover:text-foreground"
              >
                <Search className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{searchPlaceholder}</span>
              </button>
            ) : null}
          </div>

          {/* Center: logo */}
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

          {/* Right: account + cart */}
          <div className="flex items-center justify-end gap-1">
            {showAccount ? (
              <button
                type="button"
                aria-label="Mi cuenta"
                className="rounded-md p-2 text-muted transition-colors hover:bg-panel hover:text-foreground"
              >
                <User className="size-5" aria-hidden="true" />
              </button>
            ) : null}
            {showCart ? (
              <button
                type="button"
                aria-label="Carrito (0 items)"
                className="relative rounded-md p-2 text-muted transition-colors hover:bg-panel hover:text-foreground"
              >
                <ShoppingCart className="size-5" aria-hidden="true" />
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-pill bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  0
                </span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Navigation row */}
        {navLinks.length > 0 ? (
          <nav aria-label="Navegación principal">
            <ul className="flex items-center justify-center gap-1 border-t border-border py-2">
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
