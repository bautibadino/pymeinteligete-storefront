import Link from "next/link";
import type { Route } from "next";

import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";

/**
 * AnnouncementBarStatic — mensaje fijo con CTA opcional.
 */
export function AnnouncementBarStatic({ module }: { module: AnnouncementBarModule }) {
  if (module.variant !== "static") return null;
  const { message, cta } = module;
  return (
    <div
      role="banner"
      aria-label="Anuncio"
      data-template="announcement-bar-static"
      className="flex min-h-9 items-center justify-center gap-4 bg-accent px-4 py-2 text-sm font-medium text-background"
    >
      <span>{message}</span>
      {cta ? (
        <Link
          href={cta.href as Route}
          className="inline-flex items-center gap-1 rounded-pill border border-current px-3 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
