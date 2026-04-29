import type { CSSProperties, ReactNode } from "react";

import type { AnnouncementBarAppearance } from "@/lib/modules/announcement-bar";
import { cn } from "@/lib/utils/cn";

type AnnouncementBarFrameProps = {
  appearance?: AnnouncementBarAppearance | undefined;
  children: ReactNode;
  className?: string | undefined;
  contentClassName?: string | undefined;
  dataTemplate: string;
  role: "region" | "timer";
  ariaLabel: string;
};

type AnnouncementBarPalette = {
  container: CSSProperties;
  chip: CSSProperties;
  chipSoft: CSSProperties;
  mutedText: CSSProperties;
  separator: CSSProperties;
  ctaPrimary: CSSProperties;
  ctaSecondary: CSSProperties;
  ctaLink: CSSProperties;
  railFade: CSSProperties;
};

const DEFAULT_BACKGROUND =
  "linear-gradient(110deg, color-mix(in srgb, var(--ink) 94%, #111827 6%) 0%, color-mix(in srgb, var(--accent) 74%, #111827 26%) 52%, color-mix(in srgb, var(--ink) 92%, #020617 8%) 100%)";
const DEFAULT_TEXT = "var(--paper)";
const DEFAULT_BORDER = "color-mix(in srgb, var(--paper) 16%, transparent)";
const DEFAULT_ACCENT = "color-mix(in srgb, var(--paper) 14%, transparent)";

export function resolveAnnouncementBarPalette(
  appearance?: AnnouncementBarAppearance,
): AnnouncementBarPalette {
  const hasGradient =
    appearance?.surface === "gradient" ||
    Boolean(appearance?.gradientFrom || appearance?.gradientVia || appearance?.gradientTo);

  const backgroundImage = hasGradient
    ? buildGradientBackground(appearance)
    : appearance?.backgroundColor
      ? undefined
      : DEFAULT_BACKGROUND;
  const backgroundColor = hasGradient
    ? appearance?.backgroundColor
    : appearance?.backgroundColor ?? "color-mix(in srgb, var(--accent) 78%, #111827 22%)";
  const textColor = appearance?.textColor ?? DEFAULT_TEXT;
  const borderColor = appearance?.borderColor ?? DEFAULT_BORDER;
  const accentColor = appearance?.accentColor ?? DEFAULT_ACCENT;

  return {
    container: {
      color: textColor,
      borderColor,
      backgroundColor,
      backgroundImage,
    },
    chip: {
      backgroundColor: accentColor,
      borderColor: "color-mix(in srgb, currentColor 20%, transparent)",
      color: textColor,
    },
    chipSoft: {
      backgroundColor: "color-mix(in srgb, currentColor 9%, transparent)",
      borderColor: "color-mix(in srgb, currentColor 14%, transparent)",
      color: textColor,
    },
    mutedText: {
      color: "color-mix(in srgb, currentColor 74%, transparent)",
    },
    separator: {
      color: "color-mix(in srgb, currentColor 42%, transparent)",
    },
    ctaPrimary: {
      backgroundColor: textColor,
      borderColor: textColor,
      color: backgroundColor ?? "#111827",
    },
    ctaSecondary: {
      backgroundColor: "transparent",
      borderColor: "color-mix(in srgb, currentColor 24%, transparent)",
      color: textColor,
    },
    ctaLink: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      color: textColor,
    },
    railFade: {
      background:
        backgroundImage ??
        backgroundColor ??
        DEFAULT_BACKGROUND,
    },
  };
}

function buildGradientBackground(appearance?: AnnouncementBarAppearance) {
  const from = appearance?.gradientFrom ?? appearance?.backgroundColor ?? "var(--ink)";
  const via = appearance?.gradientVia ? `, ${appearance.gradientVia} 52%` : "";
  const to = appearance?.gradientTo ?? appearance?.backgroundColor ?? "var(--accent)";

  return `linear-gradient(110deg, ${from} 0%${via}, ${to} 100%)`;
}

export function AnnouncementBarFrame({
  appearance,
  children,
  className,
  contentClassName,
  dataTemplate,
  role,
  ariaLabel,
}: AnnouncementBarFrameProps) {
  const palette = resolveAnnouncementBarPalette(appearance);

  return (
    <section
      role={role}
      aria-label={ariaLabel}
      data-template={dataTemplate}
      data-announcement-topmost="true"
      className={cn(
        "relative isolate w-full overflow-hidden border-b border-solid",
        className,
      )}
      style={palette.container}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 18% 0%, color-mix(in srgb, currentColor 18%, transparent) 0%, transparent 36%), radial-gradient(circle at 82% 100%, color-mix(in srgb, currentColor 14%, transparent) 0%, transparent 34%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: "color-mix(in srgb, currentColor 32%, transparent)" }}
      />
      <div
        className={cn(
          "relative flex min-h-11 items-center px-4 py-2.5 sm:px-5",
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
