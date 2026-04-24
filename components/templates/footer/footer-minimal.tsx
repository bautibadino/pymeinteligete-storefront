import Link from "next/link";
import type { Route } from "next";
import {
  AtSign,
  Camera,
  Globe,
  MessageCircle,
  Music2,
  Play,
} from "lucide-react";

import type { FooterModule, SocialPlatform } from "@/lib/modules/footer";

/**
 * Footer Minimal — una sola fila con logo, tagline, íconos sociales y copyright.
 * Ocupa el mínimo espacio posible. Ideal para marcas premium o portfolios.
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

export function FooterMinimal({ module }: { module: FooterModule }) {
  const { content } = module;
  const { logoUrl, tagline, socialLinks = [], copyright } = content;

  return (
    <footer
      className="border-t border-border bg-panel"
      data-template="footer-minimal"
    >
      <div className="mx-auto max-w-[var(--content-width)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Link href={"/" as Route} aria-label="Ir al inicio">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-7 w-auto object-contain"
                  loading="lazy"
                />
              </Link>
            ) : null}
            {tagline ? (
              <span className="text-sm text-muted">{tagline}</span>
            ) : null}
          </div>

          {/* Social icons */}
          {socialLinks.length > 0 ? (
            <nav aria-label="Redes sociales" className="flex items-center gap-2">
              {socialLinks.map((sl) => {
                const Icon = SOCIAL_ICONS[sl.platform];
                return (
                  <a
                    key={sl.platform}
                    href={sl.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[sl.platform]}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </nav>
          ) : null}

          {/* Copyright */}
          {copyright ? (
            <p className="text-xs text-muted">{copyright}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
