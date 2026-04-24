import type { TrustBarTemplateId } from "@/lib/templates/trust-bar-catalog";

/**
 * TrustBarContent — datos de contenido de una sección trustBar.
 * Espeja el shape definido en `02-catalogo-secciones.md §4`.
 */
export interface TrustBarContent {
  items: Array<{
    icon:
      | "truck"
      | "shield"
      | "credit-card"
      | "clock"
      | "badge-check"
      | "headset"
      | "package"
      | "refresh-cw";
    title: string;
    subtitle?: string;
  }>;
  alignment?: "center" | "left";
}

/**
 * TrustBarModule — sección del builder de tipo "trustBar".
 * Sigue el contrato de `SectionInstance` definido en `01-contrato-presentation.md`.
 * Componentes reciben `{ module: TrustBarModule }` y nada más.
 */
export interface TrustBarModule {
  type: "trustBar";
  variant: TrustBarTemplateId;
  content: TrustBarContent;
  id: string;
  enabled?: boolean;
  order?: number;
}
