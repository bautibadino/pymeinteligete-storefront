import type { ComponentType } from "react";

import { HeroEditorial } from "@/components/templates/hero/hero-editorial";
import { HeroSplit } from "@/components/templates/hero/hero-split";
import { HeroWorkshop } from "@/components/templates/hero/hero-workshop";
import type { HeroModule } from "@/lib/modules";
import { resolveHeroTemplateId, type HeroTemplateId } from "@/lib/templates/hero-catalog";

/**
 * Template Registry — núcleo del sistema multi-template.
 *
 * Cada tipo de módulo tiene un conjunto de templates posibles.
 * Un template es un componente React que consume exclusivamente
 * la data del módulo (sin conocer el tenant). Gracias a los
 * design tokens (CSS vars), cambia de estética por tenant sin
 * ramificar código.
 *
 * Cómo se agrega un template nuevo:
 *   1. Crear el componente en `components/templates/<moduleType>/`.
 *   2. Registrar su id en `lib/templates/<moduleType>-catalog.ts`.
 *   3. Sumarlo al pool correspondiente de este archivo.
 *
 * El tenant elige qué template usar desde `/ecommerce` del ERP;
 * la selección viaja por el bootstrap v1 (`module.variant`).
 *
 * Para descubrir los ids/descriptores sin cargar los componentes
 * (útil en tests unitarios y en endpoints de metadata), importar
 * desde `lib/templates/hero-catalog.ts`.
 */

export type HeroTemplateComponent = ComponentType<{ module: HeroModule }>;

export const HERO_TEMPLATES: Record<HeroTemplateId, HeroTemplateComponent> = {
  split: HeroSplit,
  workshop: HeroWorkshop,
  editorial: HeroEditorial,
};

/**
 * Resuelve el componente hero a renderizar a partir de un input
 * opaco (suele ser `module.variant` del bootstrap). Nunca falla:
 * degrada al template default si no matchea.
 */
export function resolveHeroTemplate(templateId: unknown): HeroTemplateComponent {
  return HERO_TEMPLATES[resolveHeroTemplateId(templateId)];
}
