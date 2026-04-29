import { Sparkles } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { cn } from "@/lib/utils/cn";

import { AnnouncementBarFrame, resolveAnnouncementBarPalette } from "@/components/templates/announcement-bar/announcement-bar-frame";
import { AnnouncementBarRotatingChip } from "@/components/templates/announcement-bar/announcement-bar-rotating-chip";

/**
 * AnnouncementBarStatic — mensaje fijo con CTA opcional y acentos rotativos.
 */
export function AnnouncementBarStatic({ module }: { module: AnnouncementBarModule }) {
  if (module.variant !== "static") return null;

  const {
    message,
    eyebrow,
    detail,
    rotatingMessages = [],
    motion,
    cta,
    appearance,
  } = module;
  const palette = resolveAnnouncementBarPalette(appearance);
  const rotationIntervalMs = motion?.rotationIntervalMs ?? 3200;

  return (
    <AnnouncementBarFrame
      appearance={appearance}
      role="region"
      ariaLabel="Anuncio destacado"
      dataTemplate="announcement-bar-static"
      contentClassName="gap-3 sm:gap-4"
    >
      {eyebrow ? (
        <span
          className="hidden shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] sm:inline-flex"
          style={palette.chip}
        >
          <Sparkles className="size-3" aria-hidden="true" />
          {eyebrow}
        </span>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center sm:justify-start sm:text-left">
        <span className="text-sm font-semibold tracking-[0.01em] sm:text-[0.95rem]">{message}</span>
        {detail ? (
          <span
            className="hidden text-xs font-medium tracking-[0.12em] uppercase md:inline"
            style={palette.mutedText}
          >
            {detail}
          </span>
        ) : null}
      </div>

      {rotatingMessages.length > 0 ? (
        <AnnouncementBarRotatingChip
          intervalMs={rotationIntervalMs}
          items={rotatingMessages}
          style={palette.chipSoft}
        />
      ) : null}

      {cta ? (
        <Link
          href={cta.href as Route}
          className={cn(
            "inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
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
