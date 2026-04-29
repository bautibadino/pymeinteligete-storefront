import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { cn } from "@/lib/utils/cn";

import { AnnouncementBarFrame, resolveAnnouncementBarPalette } from "@/components/templates/announcement-bar/announcement-bar-frame";

const SPEED_DURATION: Record<"slow" | "normal" | "fast", string> = {
  slow: "40s",
  normal: "25s",
  fast: "14s",
};

/**
 * AnnouncementBarScroll — marquee horizontal con múltiples mensajes.
 *
 * Usa el keyframe `@keyframes ab-marquee` de `app/globals.css`.
 * Los mensajes se duplican para el loop continuo sin corte visual.
 */
export function AnnouncementBarScroll({ module }: { module: AnnouncementBarModule }) {
  if (module.variant !== "scroll") return null;

  const {
    messages,
    speed = "normal",
    eyebrow,
    separator = "•",
    pauseOnHover = true,
    appearance,
  } = module;
  const duration = SPEED_DURATION[speed];
  const palette = resolveAnnouncementBarPalette(appearance);

  if (messages.length === 0) return null;

  return (
    <AnnouncementBarFrame
      appearance={appearance}
      role="region"
      ariaLabel="Anuncios en desplazamiento"
      dataTemplate="announcement-bar-scroll"
      contentClassName="gap-3 pr-0"
    >
      {eyebrow ? (
        <span
          className="hidden shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] lg:inline-flex"
          style={palette.chip}
        >
          {eyebrow}
        </span>
      ) : null}

      <div className="group/announcement-rail relative min-w-0 flex-1 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10"
          style={{ background: `linear-gradient(90deg, ${palette.railFade.background}, transparent)` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10"
          style={{ background: `linear-gradient(270deg, ${palette.railFade.background}, transparent)` }}
        />

        <div
          className={cn(
            "flex w-max motion-reduce:[animation-play-state:paused]",
            pauseOnHover ? "group-hover/announcement-rail:[animation-play-state:paused]" : undefined,
          )}
          style={{
            animation: `ab-marquee ${duration} linear infinite`,
            willChange: "transform",
          }}
          aria-hidden="true"
        >
          {[...messages, ...messages].map((msg, idx) => (
            <span key={idx} className="flex items-center px-2.5 py-0.5">
              <span
                className="inline-flex items-center gap-3 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] sm:text-[11px]"
                style={palette.chipSoft}
              >
                {msg}
                <span className="text-sm leading-none" style={palette.separator}>
                  {separator}
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>

      <ul className="sr-only">
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </AnnouncementBarFrame>
  );
}
