import type { PromoBandVariant } from "@/lib/modules/promo-band";
import { PROMO_BAND_VARIANTS } from "@/lib/modules/promo-band";

/**
 * Catálogo de plantillas PromoBand — metadatos puros sin importar JSX.
 *
 * Seguro de importar en tests unitarios, endpoints de descubrimiento
 * y el editor del ERP. Los componentes React viven en
 * `components/templates/promo-band/` y se registran en `registry.ts`.
 *
 * Cómo agregar una variante:
 *   1. Agregar el id a `PromoBandVariant` en `lib/modules/promo-band.ts`.
 *   2. Agregar el descriptor aquí.
 *   3. Crear el componente en `components/templates/promo-band/`.
 *   4. Registrarlo en `lib/templates/registry.ts`.
 *   5. Agregar el SVG thumbnail en `public/template-thumbnails/`.
 */

export type PromoBandTemplateId = PromoBandVariant;

export const PROMO_BAND_TEMPLATE_IDS: readonly PromoBandTemplateId[] = PROMO_BAND_VARIANTS;

export const DEFAULT_PROMO_BAND_TEMPLATE_ID: PromoBandTemplateId = "split-cta";

export type PromoBandTemplateDescriptor = {
  id: PromoBandTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
};

function buildThumbnailUrl(variant: PromoBandTemplateId): string {
  return `/template-thumbnails/promo-band-${variant}.svg`;
}

export const PROMO_BAND_TEMPLATE_DESCRIPTORS: Record<
  PromoBandTemplateId,
  PromoBandTemplateDescriptor
> = {
  "split-cta": {
    id: "split-cta",
    label: "Split CTA",
    description:
      "Imagen a la izquierda y texto con CTA a la derecha. Layout 50/50 de alto impacto.",
    bestFor: ["promociones temporales", "lanzamientos de producto", "campañas con imagen fuerte"],
    thumbnailUrl: buildThumbnailUrl("split-cta"),
  },
  "solid-bg": {
    id: "solid-bg",
    label: "Fondo sólido",
    description:
      "Fondo de color plano (accent token o override del tenant) con texto y CTA centrado.",
    bestFor: ["anuncios directos", "destacar un mensaje corto", "marcas con identidad de color"],
    thumbnailUrl: buildThumbnailUrl("solid-bg"),
  },
  countdown: {
    id: "countdown",
    label: "Countdown",
    description: "Cuenta regresiva visible + mensaje urgente + CTA. Para ofertas con límite de tiempo.",
    bestFor: ["ventas flash", "ofertas por tiempo limitado", "lanzamientos con fecha programada"],
    thumbnailUrl: buildThumbnailUrl("countdown"),
  },
  "image-overlay": {
    id: "image-overlay",
    label: "Image Overlay",
    description: "Imagen de fondo a pantalla completa con overlay semitransparente + texto + CTA.",
    bestFor: ["campañas visuales de impacto", "categorías con imagen fuerte", "heroes de promo"],
    thumbnailUrl: buildThumbnailUrl("image-overlay"),
  },
};

export function isPromoBandTemplateId(value: unknown): value is PromoBandTemplateId {
  return (
    typeof value === "string" &&
    (PROMO_BAND_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `PromoBandTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined.
 */
export function resolvePromoBandTemplateId(value: unknown): PromoBandTemplateId {
  return isPromoBandTemplateId(value) ? value : DEFAULT_PROMO_BAND_TEMPLATE_ID;
}
