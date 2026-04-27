import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, CreditCard, Search, Shield, Star, Truck, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HeroBadge, HeroModule } from "@/lib/modules";

/**
 * Hero Commerce — imagen full-bleed con overlay configurable.
 * Paridad BYM: título + subtítulo + fila de badges de confianza
 * (ícono + texto) + CTA primario + CTA secundario + búsqueda a catálogo.
 *
 * El overlay usa `rgba()` sobre la imagen — única excepción permitida
 * al uso de colores literales en templates (necesario para opacidad
 * variable definida por el tenant via `overlayOpacity`).
 *
 * Todos los demás colores, fuentes y efectos usan tokens CSS.
 */
export function HeroCommerce({ module }: { module: HeroModule }) {
  const {
    title,
    subtitle,
    description,
    image,
    overlayOpacity = 45,
    badges,
    primaryAction,
    secondaryAction,
    searchPlaceholder,
    enableSearch,
  } = module;

  const overlayAlpha = Math.min(100, Math.max(0, overlayOpacity)) / 100;

  return (
    <section
      aria-labelledby={`hero-${module.id}-title`}
      className="relative overflow-hidden rounded-xl shadow-tenant"
      data-template="hero-commerce"
    >
      <div className="relative min-h-[520px] md:min-h-[600px]">
        {/* Imagen de fondo */}
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-primary to-accent"
          />
        )}

        {/*
          Overlay con opacidad variable definida por el tenant.
          rgba() permitido aquí (único caso de color literal en templates):
          es opacidad dinámica sobre imagen, no un color semántico del theme.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayAlpha})` }}
        />

        {/* Contenido principal */}
        <div className="relative flex min-h-[520px] flex-col justify-end p-8 md:min-h-[600px] md:p-12 lg:p-16">
          <div className="flex max-w-2xl flex-col gap-5 text-white">
            {/* Título */}
            <h2
              id={`hero-${module.id}-title`}
              className="font-heading text-4xl font-bold leading-[1.05] md:text-6xl"
            >
              {title}
            </h2>

            {/* Subtítulo (subtitle tiene prioridad, cae a description si falta) */}
            {(subtitle ?? description) ? (
              <p className="max-w-prose text-lg leading-relaxed opacity-90 md:text-xl">
                {subtitle ?? description}
              </p>
            ) : null}

            {/* Fila de badges de confianza */}
            {badges && badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, idx) => (
                  <HeroBadgeItem key={idx} badge={badge} />
                ))}
              </div>
            ) : null}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              {primaryAction ? (
                <Button asChild size="lg">
                  <Link href={primaryAction.href as Route}>
                    {primaryAction.label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              {secondaryAction ? (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link href={secondaryAction.href as Route}>{secondaryAction.label}</Link>
                </Button>
              ) : null}
            </div>

            {/* Buscador conectado al catálogo público del tenant. */}
            {enableSearch ? (
              <form
                action="/catalogo"
                role="search"
                className="mt-2 flex max-w-md items-center gap-2 rounded-lg bg-white/15 px-4 py-3 backdrop-blur-sm"
              >
                <Search
                  className="size-5 shrink-0 text-white/70"
                  aria-hidden="true"
                />
                <input
                  name="search"
                  type="search"
                  placeholder={searchPlaceholder ?? "Buscá tu producto..."}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Badge individual — íconos lucide mapeados por nombre
// ---------------------------------------------------------------------------

const BADGE_ICONS: Record<
  NonNullable<HeroBadge["icon"]>,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  truck: Truck,
  shield: Shield,
  "credit-card": CreditCard,
  star: Star,
  clock: Clock,
};

function HeroBadgeItem({ badge }: { badge: HeroBadge }) {
  const Icon = badge.icon ? BADGE_ICONS[badge.icon] : null;

  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1.5 bg-white/15 text-white hover:bg-white/20"
    >
      {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden="true" /> : null}
      <span>{badge.label}</span>
    </Badge>
  );
}
