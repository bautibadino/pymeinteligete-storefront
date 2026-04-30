import Link from "next/link";
import type { Route } from "next";

import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { cn } from "@/lib/utils/cn";

import { AnnouncementBarFrame, resolveAnnouncementBarPalette } from "@/components/templates/announcement-bar/announcement-bar-frame";

/**
 * AnnouncementBarStatic — mensaje fijo, centrado y sin elementos laterales.
 */
export function AnnouncementBarStatic({ module }: { module: AnnouncementBarModule }) {
  if (module.variant !== "static") return null;

  const { message, cta, appearance } = module;
  const palette = resolveAnnouncementBarPalette(appearance);

  return (
    <AnnouncementBarFrame
      appearance={appearance}
      role="region"
      ariaLabel="Anuncio destacado"
      dataTemplate="announcement-bar-static"
      contentClassName="justify-center gap-3 text-center sm:pr-28"
    >
      <span className="max-w-3xl text-sm font-medium leading-tight sm:text-[0.95rem]">
        {message}
      </span>

      {cta ? (
        <Link
          href={cta.href as Route}
          className={cn(
            "inline-flex min-h-9 shrink-0 items-center justify-center px-2 py-1 text-xs font-semibold underline-offset-4 transition-opacity duration-200 hover:underline hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:absolute sm:right-5 sm:top-1/2 sm:-translate-y-1/2",
            cta.variant === "link" ? "underline-offset-4 hover:underline" : undefined,
          )}
          style={
            cta.variant === "secondary"
              ? palette.ctaSecondary
              : cta.variant === "link"
                ? palette.ctaLink
                : palette.ctaPrimary
          }
        >
          {cta.label}
        </Link>
      ) : null}
    </AnnouncementBarFrame>
  );
}
