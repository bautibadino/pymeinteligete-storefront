import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";

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

  const { messages, speed = "normal" } = module;
  const duration = SPEED_DURATION[speed];

  if (messages.length === 0) return null;

  return (
    <div
      role="marquee"
      aria-label="Anuncios en desplazamiento"
      data-template="announcement-bar-scroll"
      className="overflow-hidden bg-accent py-2 text-sm font-medium text-background"
    >
      <div
        className="flex w-max"
        style={{
          animation: `ab-marquee ${duration} linear infinite`,
          willChange: "transform",
        }}
        aria-hidden="true"
      >
        {[...messages, ...messages].map((msg, idx) => (
          <span key={idx} className="flex items-center px-8 before:mr-8 before:content-['·']">
            {msg}
          </span>
        ))}
      </div>

      <ul className="sr-only">
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
