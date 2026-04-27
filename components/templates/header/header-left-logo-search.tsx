import Link from "next/link";
import type { Route } from "next";
import { Search, ShoppingCart, User } from "lucide-react";

import type { HeaderModule } from "@/lib/modules/header";

/**
 * Header Left Logo Search — logo a la izquierda, campo de búsqueda
 * grande centrado, carrito a la derecha. Navegación completa debajo.
 *
 * Paridad BYM (bymlubricentro.com). Optimizado para tiendas con catálogos
 * grandes donde el buscador es el principal punto de entrada al producto.
 *
 * El buscador navega a `/catalogo?search=...`; la resolución real de
 * resultados sigue en el backend vía fetchers host-driven.
 */
export function HeaderLeftLogoSearch({ module }: { module: HeaderModule }) {
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
      data-template="header-left-logo-search"
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

      {/* Main row: logo | search bar | actions */}
      <div className="mx-auto max-w-content px-4">
        <div className="flex items-center gap-4 py-4">
          {/* Logo */}
          <Link href={logoHref as Route} aria-label="Inicio" className="shrink-0">
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

          {/* Search bar — ocupa el espacio central */}
          {showSearch ? (
            <form action="/catalogo" className="flex flex-1 items-center">
              <label className="flex w-full items-center gap-3 rounded-md border border-border bg-panel px-4 py-2.5 text-sm text-muted shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="size-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">{searchPlaceholder}</span>
                <input
                  name="search"
                  type="search"
                  placeholder={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted focus:outline-none"
                />
              </label>
            </form>
          ) : (
            <div className="flex-1" />
          )}

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
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
            <ul className="flex items-center gap-1 border-t border-border py-2">
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
