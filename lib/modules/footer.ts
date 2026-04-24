/**
 * FooterModule — tipo del bloque global footer para el builder.
 *
 * Este módulo define las interfaces que los componentes de template
 * de footer consumen. No forma parte del sistema legacy de módulos
 * (`module-schema.ts`); pertenece al sistema de presentation builder
 * (Ola 2) que usa `globals.footer` del contrato de presentation v1.
 *
 * Los componentes reciben `{ module: FooterModule }` y nunca conocen
 * el tenant ni el host.
 */

// ---------------------------------------------------------------------------
// Template IDs
// ---------------------------------------------------------------------------

export type FooterTemplateId =
  | "four-columns"
  | "minimal"
  | "with-newsletter"
  | "corporate";

// ---------------------------------------------------------------------------
// Sub-types reutilizables
// ---------------------------------------------------------------------------

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "x"
  | "whatsapp";

export interface FooterSocialLink {
  platform: SocialPlatform;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface FooterContact {
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface FooterNewsletter {
  enabled: boolean;
  title?: string;
  placeholder?: string;
  successMessage?: string;
}

export interface FooterLegalLink {
  label: string;
  href: string;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface FooterContent {
  logoUrl?: string;
  tagline?: string;
  columns?: FooterColumn[];
  socialLinks?: FooterSocialLink[];
  contact?: FooterContact;
  newsletter?: FooterNewsletter;
  legal?: FooterLegalLink[];
  copyright?: string;
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export interface FooterModule {
  id: string;
  type: "footer";
  variant: FooterTemplateId;
  enabled: boolean;
  order: number;
  content: FooterContent;
}
