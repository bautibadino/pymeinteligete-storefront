/**
 * AnnouncementBarModule — tipo base para el bloque global de anuncios.
 *
 * Sigue el contrato de SectionInstance<"announcementBar"> pero
 * tipado de forma directa para consumo en componentes React.
 * El campo `variant` actúa como discriminante de la unión.
 */

import type { SectionInstance } from "@/lib/types/presentation";

export type AnnouncementBarVariant = "static" | "scroll" | "countdown" | "badges";

export type AnnouncementBarCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "link" | undefined;
};

export type AnnouncementBarAppearance = {
  surface?: "solid" | "gradient" | undefined;
  backgroundColor?: string | undefined;
  textColor?: string | undefined;
  accentColor?: string | undefined;
  borderColor?: string | undefined;
  gradientFrom?: string | undefined;
  gradientVia?: string | undefined;
  gradientTo?: string | undefined;
};

export type AnnouncementBarMotion = {
  rotationIntervalMs?: number | undefined;
};

export type AnnouncementBarBadgeItem = {
  icon: string;
  label: string;
  description?: string | undefined;
};

type AnnouncementBarBase = {
  id: string;
  type: "announcementBar";
  enabled: boolean;
  order: number;
  appearance?: AnnouncementBarAppearance | undefined;
};

export type AnnouncementBarStaticModule = AnnouncementBarBase & {
  variant: "static";
  message: string;
  eyebrow?: string | undefined;
  detail?: string | undefined;
  rotatingMessages?: string[] | undefined;
  motion?: AnnouncementBarMotion | undefined;
  cta?: AnnouncementBarCta | undefined;
};

export type AnnouncementBarScrollModule = AnnouncementBarBase & {
  variant: "scroll";
  messages: string[];
  eyebrow?: string | undefined;
  separator?: string | undefined;
  speed?: "slow" | "normal" | "fast" | undefined;
  pauseOnHover?: boolean | undefined;
};

export type AnnouncementBarCountdownModule = AnnouncementBarBase & {
  variant: "countdown";
  message: string;
  label?: string | undefined;
  /** ISO 8601 — fecha de fin del countdown */
  endsAt: string;
  completedMessage?: string | undefined;
  cta?: AnnouncementBarCta | undefined;
};

export type AnnouncementBarBadgesModule = AnnouncementBarBase & {
  variant: "badges";
  heading?: string | undefined;
  detail?: string | undefined;
  items: AnnouncementBarBadgeItem[];
};

export type AnnouncementBarModule =
  | AnnouncementBarStaticModule
  | AnnouncementBarScrollModule
  | AnnouncementBarCountdownModule
  | AnnouncementBarBadgesModule;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readTextLikeValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return readString(value);
  }

  if (!isRecord(value)) {
    return undefined;
  }

  return (
    readString(value.text) ??
    readString(value.label) ??
    readString(value.title) ??
    readString(value.message)
  );
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .map((item) => readTextLikeValue(item))
    .filter((item): item is string => Boolean(item));

  return items.length > 0 ? items : undefined;
}

function readPositiveInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const rounded = Math.round(value);
  return rounded > 0 ? rounded : undefined;
}

function withDefinedProperties<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Partial<T>;
}

function normalizeCta(value: unknown): AnnouncementBarCta | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const label = readString(value.label);
  const href = readString(value.href);
  if (!label || !href) {
    return undefined;
  }

  const variant = value.variant;

  return {
    label,
    href,
    ...withDefinedProperties({
      variant:
        variant === "primary" || variant === "secondary" || variant === "link"
          ? variant
          : undefined,
    }),
  };
}

function normalizeAppearance(value: unknown): AnnouncementBarAppearance | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const surface = value.surface === "solid" || value.surface === "gradient"
    ? value.surface
    : undefined;
  const backgroundColor = readString(value.backgroundColor);
  const textColor = readString(value.textColor);
  const accentColor = readString(value.accentColor);
  const borderColor = readString(value.borderColor);
  const gradientFrom = readString(value.gradientFrom);
  const gradientVia = readString(value.gradientVia);
  const gradientTo = readString(value.gradientTo);

  if (
    !surface &&
    !backgroundColor &&
    !textColor &&
    !accentColor &&
    !borderColor &&
    !gradientFrom &&
    !gradientVia &&
    !gradientTo
  ) {
    return undefined;
  }

  return withDefinedProperties({
    surface:
      surface ??
      (gradientFrom || gradientVia || gradientTo ? "gradient" : undefined),
    backgroundColor,
    textColor,
    accentColor,
    borderColor,
    gradientFrom,
    gradientVia,
    gradientTo,
  });
}

function normalizeMotion(value: unknown): AnnouncementBarMotion | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const rotationIntervalMs = readPositiveInteger(value.rotationIntervalMs);
  if (!rotationIntervalMs) {
    return undefined;
  }

  return { rotationIntervalMs };
}

function normalizeBadgeItems(value: unknown): AnnouncementBarBadgeItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const icon = readString(item.icon);
      const label = readString(item.label) ?? readString(item.title) ?? readString(item.text);
      if (!label) {
        return null;
      }

      return {
        icon: icon ?? "badge-check",
        label,
        ...withDefinedProperties({
          description: readString(item.description) ?? readString(item.subtitle),
        }),
      } satisfies AnnouncementBarBadgeItem;
    })
    .filter((item): item is AnnouncementBarBadgeItem => item !== null);
}

export function normalizeAnnouncementBarModule(
  section: SectionInstance<"announcementBar">,
): AnnouncementBarModule {
  const content = isRecord(section.content) ? section.content : {};
  const scrollSpeed: "slow" | "normal" | "fast" | undefined =
    content.speed === "slow" || content.speed === "normal" || content.speed === "fast"
      ? content.speed
      : undefined;
  const base = {
    id: section.id,
    type: "announcementBar" as const,
    enabled: section.enabled,
    order: section.order,
    ...withDefinedProperties({
      appearance: normalizeAppearance(content.appearance),
    }),
  };

  switch (section.variant) {
    case "scroll":
      return {
        ...base,
        variant: "scroll",
        messages:
          readStringArray(content.messages) ??
          (readString(content.message) ? [readString(content.message) as string] : []),
        ...withDefinedProperties({
          eyebrow: readString(content.eyebrow),
          separator: readString(content.separator),
          speed: scrollSpeed,
        }),
        pauseOnHover: typeof content.pauseOnHover === "boolean" ? content.pauseOnHover : true,
      };

    case "countdown":
      return {
        ...base,
        variant: "countdown",
        message: readString(content.message) ?? "Oferta por tiempo limitado",
        endsAt: readString(content.endsAt) ?? new Date(Date.now() + 3600_000).toISOString(),
        ...withDefinedProperties({
          label: readString(content.label),
          completedMessage: readString(content.completedMessage),
          cta: normalizeCta(content.cta),
        }),
      };

    case "badges":
      return {
        ...base,
        variant: "badges",
        items: normalizeBadgeItems(content.items),
        ...withDefinedProperties({
          heading: readString(content.heading),
          detail: readString(content.detail),
        }),
      };

    case "static":
    default:
      return {
        ...base,
        variant: "static",
        message:
          readString(content.message) ??
          readStringArray(content.messages)?.[0] ??
          "Descubrí beneficios exclusivos en nuestra tienda.",
        ...withDefinedProperties({
          eyebrow: readString(content.eyebrow),
          detail: readString(content.detail),
          rotatingMessages:
            readStringArray(content.rotatingMessages) ?? readStringArray(content.messages),
          motion: normalizeMotion(content.motion),
          cta: normalizeCta(content.cta),
        }),
      };
  }
}
