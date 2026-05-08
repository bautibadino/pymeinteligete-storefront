"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Menu, Search, X } from "lucide-react";

import { HeaderCartButton } from "@/components/storefront/cart/header-cart-button";
import { cn } from "@/lib/utils/cn";
import type { StorefrontCategory, StorefrontNavLink } from "@/lib/storefront-api";

type BymAnnouncement = {
  messages: string[];
  cta?: {
    label: string;
    href: string;
  };
};

type BymHeaderProps = {
  announcement?: BymAnnouncement;
  categories?: StorefrontCategory[];
  displayName: string;
  links: StorefrontNavLink[];
  logoUrl?: string;
  phone?: string;
};

export function BymHeader({
  announcement,
  categories = [],
  displayName,
  links,
  logoUrl,
  phone,
}: BymHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const solidHeader = scrolled || !isHome;
  const mobileNavLinks = links.length > 0
    ? links
    : [
        { href: "/", label: "Inicio" },
        { href: "/catalogo", label: "Catálogo" },
        { href: "/contacto", label: "Contacto" },
      ];

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 18);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition duration-300",
        solidHeader
          ? "border-white/10 bg-[#070707] shadow-[0_18px_60px_rgba(0,0,0,0.32)]"
          : "border-white/10 bg-white/[0.03] backdrop-blur-md",
      )}
      data-bym-header-state={solidHeader ? (scrolled ? "scrolled" : "solid") : "top"}
    >
      {announcement ? (
        <div
          className={cn(
            "overflow-hidden border-b px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] transition duration-300 sm:px-6 lg:px-8",
            !isHome
              ? "border-white/10 bg-[#070707] text-[#f4c542]"
              : scrolled
                ? "border-white/10 bg-[#f4c542] text-black"
                : "border-white/10 bg-black/18 text-white",
          )}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-4">
            <div
              className={cn(
                "bym-announcement-track flex w-max min-w-max shrink-0 items-center gap-8 whitespace-nowrap",
                announcement.messages.length > 1 && "bym-announcement-track--animated",
              )}
              {...(announcement.messages.length > 1
                ? { style: { animationDuration: `${Math.max(9, Math.min(16, announcement.messages.length * 3.2))}s` } }
                : {})}
            >
              {[...announcement.messages, ...(announcement.messages.length > 1 ? announcement.messages : [])].map(
                (message, index) => (
                  <span key={`${message}-${index}`} className="inline-flex items-center gap-8">
                    <span>{message}</span>
                    {announcement.messages.length > 1 ? <span aria-hidden="true">/</span> : null}
                  </span>
                ),
              )}
            </div>
            {announcement.cta ? (
              <Link
                href={announcement.cta.href as Route}
                className="hidden shrink-0 underline decoration-current underline-offset-4 sm:inline"
              >
                {announcement.cta.label}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_minmax(220px,320px)_auto] lg:gap-5 lg:px-8 lg:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`Inicio de ${displayName}`}>
          {logoUrl ? (
            <img className="h-10 w-auto max-w-32 object-contain brightness-0 invert" src={logoUrl} alt="" />
          ) : (
            <>
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-sm font-bold">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden truncate text-sm font-semibold uppercase tracking-[0.16em] sm:block">
                {displayName}
              </span>
            </>
          )}
        </Link>

        <nav className="hidden items-center justify-center gap-7 text-xs font-semibold uppercase tracking-[0.14em] text-white/76 lg:flex" aria-label="Navegación principal">
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href as Route}
              className="transition hover:text-white"
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          action="/catalogo"
          className="order-3 col-span-3 grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2 border border-white/18 bg-white/10 px-3 py-2 text-white backdrop-blur md:order-none md:col-span-1"
          role="search"
        >
          <Search className="size-4 text-white/62" aria-hidden="true" />
          <label className="sr-only" htmlFor="bym-header-search">
            Buscar productos
          </label>
          <input
            id="bym-header-search"
            className="h-8 min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/48"
            name="search"
            placeholder="Buscar productos"
            type="search"
          />
          <button
            className="hidden h-8 items-center px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black sm:inline-flex"
            type="submit"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center justify-end gap-2" data-bym-mobile-actions="true">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="hidden min-h-10 items-center border border-white/18 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black lg:inline-flex"
            >
              {phone}
            </a>
          ) : null}
          <Link
            href="/catalogo"
            className="hidden min-h-10 items-center border border-white/25 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black sm:inline-flex"
          >
            Comprar
          </Link>
          <HeaderCartButton className="border-white/20 bg-white text-black hover:bg-white/90" />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center border border-white/20 text-white transition hover:bg-white hover:text-black lg:hidden"
            aria-label="Abrir menú de navegación"
            aria-expanded={menuOpen}
            aria-controls="bym-mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/64 transition lg:hidden",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        id="bym-mobile-menu"
        className={cn(
          "fixed right-0 top-0 z-50 h-dvh w-[min(22rem,86vw)] border-l border-white/12 bg-[#070707] p-5 text-white shadow-2xl transition-transform duration-300 lg:hidden",
          menuOpen ? "translate-x-0" : "translate-x-full",
        )}
        data-bym-mobile-menu="true"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/62">
            Navegación
          </span>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center border border-white/18 text-white transition hover:bg-white hover:text-black"
            aria-label="Cerrar menú de navegación"
            onClick={() => setMenuOpen(false)}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="mt-8 grid gap-1 text-sm font-semibold uppercase tracking-[0.14em]" aria-label="Navegación mobile">
          {mobileNavLinks.map((link) => (
            <Link
              key={`${link.href}-${link.label}-mobile`}
              href={link.href as Route}
              className="border-b border-white/10 py-4 text-white/82 transition hover:text-white"
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {categories.length > 0 ? (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f4c542]">Categorías</p>
            <nav className="mt-3 grid gap-1 text-sm" aria-label="Categorías mobile">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.categoryId ?? category.slug ?? category.name}
                  href={`/catalogo?category=${encodeURIComponent(category.slug ?? category.categoryId ?? category.name)}` as Route}
                  className="border-b border-white/10 py-3 text-white/72 transition hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </aside>
    </header>
  );
}
