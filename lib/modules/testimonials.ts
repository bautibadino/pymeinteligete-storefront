/**
 * TestimonialsModule — tipo del módulo de testimonios.
 *
 * Archivo autónomo; no modifica `lib/modules/index.ts` (invariante de la Ola 2).
 * Los componentes y el catalog importan desde este archivo directamente.
 */

export type TestimonialsTemplateId = "carousel" | "grid" | "masonry" | "single-quote";

export type TestimonialsItem = {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  /** Puntuación 1–5. El componente degrada graciosamente si está ausente. */
  rating?: number;
};

export type TestimonialsModule = {
  id: string;
  type: "testimonials";
  variant: TestimonialsTemplateId;
  title?: string;
  subtitle?: string;
  items: TestimonialsItem[];
};
