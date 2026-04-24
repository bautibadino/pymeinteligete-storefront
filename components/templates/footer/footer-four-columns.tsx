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
  Phone,
  MapPin,
} from "lucide-react";

import type { FooterModule, SocialPlatform } from "@/lib/modules/footer";

/**
 * Footer Four Columns — 4 columnas de links + social + contacto + copyright.
 * Paridad BYM. Layout referencia: empresa / productos / ayuda / legal.
 * Sin hex literals. Sólo design tokens (CSS vars via Tailwind).
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

export function FooterFourColumns({ module }: { module: FooterModule }) {
  const { content } = module;
  const {
    logoUrl,
    tagline,
    columns = [],
    socialLinks = [],
    contact,
    legal = [],
    copyright,
  } = content;

  return (
    <footer
      className="border-t border-border bg-panel"
      data-template="footer-four-columns"
    >
      <div className="mx-auto max-w-[var(--content-width)] px-4 py-12 sm:px-6 lg:px-8">
        {/* Top: logo + columnas */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Columna marca */}
          <div className="lg:col-span-1">
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

            {/* Redes sociales */}
            {socialLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-3">
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
              </div>
            ) : null}

            {/* Contacto */}
            {contact ? (
              <div className="mt-5 flex flex-col gap-2 text-sm text-muted">
                {contact.address ? (
                  <span className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {contact.address}
                  </span>
                ) : null}
                {contact.phone ? (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    {contact.phone}
                  </a>
                ) : null}
                {contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    {contact.email}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Columnas de links */}
          {columns.map((col, i) => (
            <div key={i} className="lg:col-span-1">
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

        {/* Bottom: legal + copyright */}
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
