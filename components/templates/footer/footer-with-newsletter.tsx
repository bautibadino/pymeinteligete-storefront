import Link from "next/link";
import type { Route } from "next";
import {
  AtSign,
  Camera,
  Globe,
  MessageCircle,
  Music2,
  Play,
  Mail,
  ArrowRight,
} from "lucide-react";

import type { FooterModule, SocialPlatform } from "@/lib/modules/footer";

/**
 * Footer With Newsletter — banner de suscripción en el top + 3 columnas + social.
 *
 * El formulario es completamente inerte en V1 (action="#", sin handler JS).
 * La integración real con el proveedor de email marketing queda fuera de alcance V1.
 */

const SOCIAL_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  instagram: Camera,
  facebook: Globe,
  youtube: Play,
  x: AtSign,
  whatsapp: MessageCircle,
  tiktok: Music2,
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  x: "X (Twitter)",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
};

export function FooterWithNewsletter({ module }: { module: FooterModule }) {
  const { content } = module;
  const {
    logoUrl,
    tagline,
    columns = [],
    socialLinks = [],
    newsletter,
    legal = [],
    copyright,
  } = content;

  const showNewsletter = newsletter?.enabled !== false;

  return (
    <footer
      className="border-t border-border bg-panel"
      data-template="footer-with-newsletter"
    >
      {/* Newsletter banner */}
      {showNewsletter ? (
        <div className="bg-primary">
          <div className="mx-auto max-w-[var(--content-width)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-3 text-primary-foreground">
                <Mail className="size-6 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold leading-tight">
                    {newsletter?.title ?? "Suscribite a nuestras novedades"}
                  </p>
                  <p className="mt-0.5 text-sm opacity-80">
                    Ofertas exclusivas y novedades directo a tu casilla.
                  </p>
                </div>
              </div>

              {/* Formulario inerte — V1 visual only */}
              <form
                action="#"
                onSubmit={(e) => e.preventDefault()}
                className="flex w-full max-w-md gap-2"
                aria-label="Formulario de suscripción al newsletter"
              >
                <input
                  type="email"
                  name="email"
                  placeholder={newsletter?.placeholder ?? "Tu email"}
                  required
                  className="flex-1 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Email para suscripción"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-md bg-paper px-4 py-2 text-sm font-medium text-primary transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Suscribirse
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* Body: logo + columnas */}
      <div className="mx-auto max-w-[var(--content-width)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Columna marca */}
          <div>
            {logoUrl ? (
              <Link href={"/" as Route} aria-label="Ir al inicio">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-8 w-auto object-contain"
                  loading="lazy"
                />
              </Link>
            ) : null}

            {tagline ? (
              <p className="mt-3 text-sm leading-relaxed text-muted">{tagline}</p>
            ) : null}

            {socialLinks.length > 0 ? (
              <nav aria-label="Redes sociales" className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((sl) => {
                  const Icon = SOCIAL_ICONS[sl.platform];
                  return (
                    <a
                      key={sl.platform}
                      href={sl.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABELS[sl.platform]}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </nav>
            ) : null}
          </div>

          {/* Columnas de links — máx 3 */}
          {columns.slice(0, 3).map((col, i) => (
            <div key={i}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href as Route}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          {legal.length > 0 ? (
            <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
              {legal.map((item, i) => (
                <Link
                  key={i}
                  href={item.href as Route}
                  className="text-xs text-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          {copyright ? (
            <p className="text-xs text-muted">{copyright}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
