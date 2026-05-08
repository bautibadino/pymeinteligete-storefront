"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import { HeaderCartButton } from "@/components/storefront/cart/header-cart-button";
import { cn } from "@/lib/utils/cn";
import type { StorefrontNavLink } from "@/lib/storefront-api";

type BymAnnouncement = {
  messages: string[];
  cta?: {
    label: string;
    href: string;
  };
};

type BymHeaderProps = {
  announcement?: BymAnnouncement;
  displayName: string;
  links: StorefrontNavLink[];
  logoUrl?: string;
  phone?: string;
};

export function BymHeader({
  announcement,
  displayName,
  links,
  logoUrl,
  phone,
}: BymHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

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
        scrolled
          ? "border-white/10 bg-[#070707]/88 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl"
          : "border-white/10 bg-white/[0.03] backdrop-blur-md",
      )}
      data-bym-header-state={scrolled ? "scrolled" : "top"}
    >
      {announcement ? (
        <div
          className={cn(
            "overflow-hidden border-b px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] transition duration-300 sm:px-6 lg:px-8",
            scrolled
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

      <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`Inicio de ${displayName}`}>
          {logoUrl ? (
            <img className="h-10 w-auto max-w-32 object-contain brightness-0 invert" src={logoUrl} alt="" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-sm font-bold">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="hidden truncate text-sm font-semibold uppercase tracking-[0.16em] sm:block">
            {displayName}
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-7 text-xs font-semibold uppercase tracking-[0.14em] text-white/76 md:flex" aria-label="Navegación principal">
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

        <div className="flex items-center justify-end gap-2">
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
        </div>
      </div>
    </header>
  );
}
