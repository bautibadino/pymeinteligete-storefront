import Link from "next/link";
import type { Route } from "next";

import { HeaderCartButton } from "@/components/storefront/cart/header-cart-button";
import type { HeaderModule } from "@/lib/modules/header";

/**
 * Header Minimal — solo logo y carrito. Sin navegación ni búsqueda.
 *
 * Ideal para landing pages, marcas de autor o tiendas de un solo producto
 * donde reducir la fricción visual es prioritario.
 *
 * El carrito es un placeholder visual V1 (no funcional, count 0).
 */
export function HeaderMinimal({ module }: { module: HeaderModule }) {
  const {
    id,
    logoUrl,
    logoHref = "/",
    logoAlt = "Logo",
    showCart = true,
    topBarLinks = [],
  } = module;

  return (
    <header
      aria-label="Encabezado del sitio"
      className="w-full border-b border-border bg-paper"
      data-template="header-minimal"
      data-module-id={id}
    >
      {/* Top bar — opcional */}
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

      {/* Main row */}
      <div className="mx-auto max-w-content px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
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

          {/* Cart only */}
          {showCart ? (
            <HeaderCartButton />
          ) : null}
        </div>
      </div>
    </header>
  );
}
