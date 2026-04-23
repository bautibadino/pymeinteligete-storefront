import type { HeroModule } from "@/lib/modules";

/**
 * Metadata del catálogo de heros — sin importar componentes JSX.
 * Este módulo es seguro de importar en tests unitarios (vitest
 * corre en Node sin plugin de React) y en server code que sólo
 * necesite saber qué templates existen (endpoints de descubrimiento,
 * validación del bootstrap, editor del ERP en Fase 4).
 *
 * Los componentes React viven en `lib/templates/registry.ts`.
 */

export type HeroTemplateId = HeroModule["variant"];

export const HERO_TEMPLATE_IDS: readonly HeroTemplateId[] = ["split", "workshop", "editorial"];

export const DEFAULT_HERO_TEMPLATE_ID: HeroTemplateId = "split";

export type TemplateDescriptor = {
  id: string;
  label: string;
  description: string;
  bestFor: string[];
};

export const HERO_TEMPLATE_DESCRIPTORS: Record<HeroTemplateId, TemplateDescriptor> = {
  split: {
    id: "split",
    label: "Split",
    description: "Texto a la izquierda, imagen a la derecha. Layout clásico e-commerce.",
    bestFor: ["catálogo general", "tiendas mayoristas", "presentación de producto destacado"],
  },
  workshop: {
    id: "workshop",
    label: "Workshop",
    description: "Imagen full-bleed con overlay oscuro y tipografía potente sobre foto.",
    bestFor: ["lubricentros", "talleres", "industriales", "imagen dominante"],
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    description: "Sólo tipografía centrada, acento tipográfico fuerte, sin imagen.",
    bestFor: ["boutique", "marcas premium", "servicios profesionales"],
  },
};

export function isHeroTemplateId(value: unknown): value is HeroTemplateId {
  return typeof value === "string" && (HERO_TEMPLATE_IDS as readonly string[]).includes(value);
}

/**
 * Devuelve un `HeroTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined — el
 * renderer no tiene que hacer fallback adicional.
 */
export function resolveHeroTemplateId(value: unknown): HeroTemplateId {
  return isHeroTemplateId(value) ? value : DEFAULT_HERO_TEMPLATE_ID;
}
