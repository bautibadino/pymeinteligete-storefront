/**
 * AnnouncementBarModule — tipo base para el bloque global de anuncios.
 *
 * Sigue el contrato de SectionInstance<"announcementBar"> pero
 * tipado de forma directa para consumo en componentes React.
 * El campo `variant` actúa como discriminante de la unión.
 */

export type AnnouncementBarVariant = "static" | "scroll" | "countdown" | "badges";

export type AnnouncementBarCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "link";
};

export type AnnouncementBarBadgeItem = {
  icon: string;
  label: string;
};

type AnnouncementBarBase = {
  id: string;
  type: "announcementBar";
  enabled: boolean;
  order: number;
};

export type AnnouncementBarStaticModule = AnnouncementBarBase & {
  variant: "static";
  message: string;
  cta?: AnnouncementBarCta;
};

export type AnnouncementBarScrollModule = AnnouncementBarBase & {
  variant: "scroll";
  messages: string[];
  speed?: "slow" | "normal" | "fast";
};

export type AnnouncementBarCountdownModule = AnnouncementBarBase & {
  variant: "countdown";
  message: string;
  /** ISO 8601 — fecha de fin del countdown */
  endsAt: string;
  completedMessage?: string;
};

export type AnnouncementBarBadgesModule = AnnouncementBarBase & {
  variant: "badges";
  items: AnnouncementBarBadgeItem[];
};

export type AnnouncementBarModule =
  | AnnouncementBarStaticModule
  | AnnouncementBarScrollModule
  | AnnouncementBarCountdownModule
  | AnnouncementBarBadgesModule;
