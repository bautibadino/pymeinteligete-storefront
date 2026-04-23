import { z } from "zod";

/**
 * Definición de tipos e interfaces para el módulo PromoBand del builder.
 *
 * Este archivo es la fuente de verdad de tipos y schemas Zod para el
 * sistema de plantillas (Ola 2). El renderer de módulos legacy (ModuleRenderer)
 * sigue usando `PromoBandModule` de `module-schema.ts`.
 *
 * Separación explícita de variantes del builder vs variantes legacy:
 *  - Legacy: "solid" | "split" (en module-schema.ts)
 *  - Builder: "split-cta" | "solid-bg" | "countdown" | "image-overlay"
 */

export const CtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z.enum(["primary", "secondary", "link"]).optional(),
});

export type Cta = z.infer<typeof CtaSchema>;

export const PromoBandContentSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  bgColor: z.string().optional(),
  cta: CtaSchema.optional(),
  endsAt: z.string().optional(),
});

export type PromoBandContent = z.infer<typeof PromoBandContentSchema>;

export type PromoBandVariant = "split-cta" | "solid-bg" | "countdown" | "image-overlay";

export const PROMO_BAND_VARIANTS: readonly PromoBandVariant[] = [
  "split-cta",
  "solid-bg",
  "countdown",
  "image-overlay",
] as const;

export interface PromoBandBuilderModule {
  id: string;
  type: "promoBand";
  variant: PromoBandVariant;
  content: PromoBandContent;
}
