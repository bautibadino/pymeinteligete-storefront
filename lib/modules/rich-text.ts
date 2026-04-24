/**
 * Builder-style RichText module type — Ola 2 / A9.
 *
 * Coexiste con el `RichTextModule` legacy (module-schema.ts) hasta que
 * el agente de consolidación unifique ambos tipos. NO importar desde
 * lib/modules/index.ts hasta esa consolidación.
 *
 * Variantes: full-width-prose | two-column | image-left-text-right | image-right-text-left
 */

export type RichTextVariant =
  | "full-width-prose"
  | "two-column"
  | "image-left-text-right"
  | "image-right-text-left";

export type RichTextCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "link";
};

export type RichTextContent = {
  eyebrow?: string;
  title?: string;
  /** Markdown o HTML básico. Sanitización fuerte prevista para V2. */
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  cta?: RichTextCta;
};

export type RichTextBuilderModule = {
  id: string;
  type: "richText";
  variant: RichTextVariant;
  content: RichTextContent;
};
