import Link from "next/link";
import type { Route } from "next";
import { Search } from "lucide-react";

import { HeaderCartButton } from "@/components/storefront/cart/header-cart-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HeaderModule } from "@/lib/modules/header";
import { themeTypographyStyles } from "@/lib/theme/typography";

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
    topBarLinks = [],
  } = module;

  return (
    <header
      aria-label="Encabezado del sitio"
      className="relative z-20 isolate w-full border-b border-border bg-paper"
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

      <div className="mx-auto max-w-content px-4">
        <div className="py-3 sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href={logoHref as Route} aria-label="Inicio" className="shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <span
                  className={themeTypographyStyles.brand("text-lg font-bold text-foreground")}
                >
                  {logoAlt}
                </span>
              )}
            </Link>

            {showCart ? (
              <div className="flex shrink-0 items-center">
                <HeaderCartButton />
              </div>
            ) : null}
          </div>

          {showSearch ? (
            <form
              action="/catalogo"
              role="search"
              className="pointer-events-auto relative z-10 mt-3 flex items-center"
            >
              <label className="sr-only" htmlFor={`${id}-search-mobile`}>
                {searchPlaceholder}
              </label>
              <div className="flex w-full items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
                <Input
                  id={`${id}-search-mobile`}
                  name="search"
                  type="search"
                  placeholder={searchPlaceholder}
                  enterKeyHint="search"
                  className={themeTypographyStyles.label("pointer-events-auto h-9 min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-sm text-foreground shadow-none ring-offset-transparent placeholder:text-muted focus-visible:ring-0 focus-visible:ring-offset-0 normal-case tracking-[0.02em]")}
                />
                <Button type="submit" size="sm" className="shrink-0 pointer-events-auto">
                  Buscar
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="hidden items-center gap-4 py-4 sm:flex">
          <Link href={logoHref as Route} aria-label="Inicio" className="shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className={themeTypographyStyles.brand("text-xl font-bold text-foreground")}>
                {logoAlt}
              </span>
            )}
          </Link>

          {showSearch ? (
            <form
              action="/catalogo"
              role="search"
              className="pointer-events-auto relative z-10 flex flex-1 items-center"
            >
              <label className="sr-only" htmlFor={`${id}-search-desktop`}>
                {searchPlaceholder}
              </label>
              <div className="flex w-full items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
                <Input
                  id={`${id}-search-desktop`}
                  name="search"
                  type="search"
                  placeholder={searchPlaceholder}
                  enterKeyHint="search"
                  className={themeTypographyStyles.label("pointer-events-auto h-9 min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-foreground shadow-none ring-offset-transparent placeholder:text-muted focus-visible:ring-0 focus-visible:ring-offset-0 normal-case tracking-[0.02em]")}
                />
                <Button type="submit" size="sm" className="shrink-0 pointer-events-auto">
                  Buscar
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex-1" />
          )}

          {showCart ? (
            <div className="flex shrink-0 items-center gap-1">
              <HeaderCartButton />
            </div>
          ) : null}
        </div>

        {navLinks.length > 0 ? (
          <nav aria-label="Navegación principal" className="border-t border-border">
            <ul className="flex items-center gap-1 overflow-x-auto py-2 whitespace-nowrap">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as Route}
                    className={themeTypographyStyles.label("rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-panel hover:text-foreground")}
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
