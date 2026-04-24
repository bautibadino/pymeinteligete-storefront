/**
 * Tipos del módulo FAQ — sistema builder (Ola 2).
 *
 * Este archivo define la forma del dato que reciben los componentes
 * de template de FAQ. Es independiente del sistema legacy de módulos
 * (`module-schema.ts`) y corresponde al contrato de `SectionType = "faq"`
 * de la Capa C (presentation).
 *
 * No importar desde `@/lib/modules/index.ts` — ese barrel es legacy.
 * Importar directamente desde `@/lib/modules/faq`.
 */

export type FaqItem = {
  question: string;
  answer: string;
  category?: string;
};

export type FaqVariant = "accordion" | "two-column" | "search" | "categories";

export type FaqModule = {
  id: string;
  type: "faq";
  variant: FaqVariant;
  title?: string;
  subtitle?: string;
  items: FaqItem[];
};
