import { z } from "zod";

/**
 * Catálogo de variantes de trustBar — metadata pura, sin imports JSX.
 * Seguro de importar en tests unitarios y en server code.
 * Los componentes React viven en `components/templates/trust-bar/`.
 */

// ---------------------------------------------------------------------------
// IDs y tipos
// ---------------------------------------------------------------------------

export type TrustBarTemplateId = "inline" | "stacked-cards" | "rail-dense" | "compact-strip";

export const TRUST_BAR_TEMPLATE_IDS: readonly TrustBarTemplateId[] = [
  "inline",
  "stacked-cards",
  "rail-dense",
  "compact-strip",
];

export const DEFAULT_TRUST_BAR_TEMPLATE_ID: TrustBarTemplateId = "inline";

// ---------------------------------------------------------------------------
// Descriptores
// ---------------------------------------------------------------------------

export type TemplateDescriptor = {
  id: TrustBarTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
};

export const TRUST_BAR_TEMPLATE_DESCRIPTORS: Record<TrustBarTemplateId, TemplateDescriptor> = {
  inline: {
    id: "inline",
    label: "Inline",
    description:
      "3-4 items en fila horizontal con ícono, título y subtítulo sobre fondo claro. Layout clásico e-commerce.",
    bestFor: [
      "home principal",
      "después del hero",
      "tiendas que priorizan claridad",
      "múltiples propuestas de valor",
    ],
    thumbnailUrl: "/template-thumbnails/trust-bar-inline.svg",
  },
  "stacked-cards": {
    id: "stacked-cards",
    label: "Stacked Cards",
    description: "3 cards con sombra y más presencia visual. Destaca cada ventaja como un módulo.",
    bestFor: [
      "tiendas premium",
      "servicios con garantías importantes",
      "cuando cada ventaja merece protagonismo",
    ],
    thumbnailUrl: "/template-thumbnails/trust-bar-stacked-cards.svg",
  },
  "rail-dense": {
    id: "rail-dense",
    label: "Rail Denso",
    description:
      "Rail horizontal scrolleable en mobile, grid en desktop. Permite mostrar 4-6 ventajas sin colapsar el layout.",
    bestFor: [
      "muchos puntos de confianza",
      "mobile-first",
      "catálogos con múltiples propuestas",
    ],
    thumbnailUrl: "/template-thumbnails/trust-bar-rail-dense.svg",
  },
  "compact-strip": {
    id: "compact-strip",
    label: "Compact Strip",
    description:
      "Strip compacto con ícono inline y separadores verticales. Ocupa poco espacio, ideal bajo el header.",
    bestFor: [
      "espacio reducido",
      "bajo el header o announcement bar",
      "tiendas que prefieren discreción",
    ],
    thumbnailUrl: "/template-thumbnails/trust-bar-compact-strip.svg",
  },
};

// ---------------------------------------------------------------------------
// Schema Zod
// ---------------------------------------------------------------------------

export const TrustBarIconSchema = z.enum([
  "truck",
  "shield",
  "credit-card",
  "clock",
  "badge-check",
  "headset",
  "package",
  "refresh-cw",
]);

export type TrustBarIcon = z.infer<typeof TrustBarIconSchema>;

export const TrustBarItemSchema = z.object({
  icon: TrustBarIconSchema,
  title: z.string().min(1),
  subtitle: z.string().optional(),
});

export const TrustBarContentSchema = z.object({
  items: z.array(TrustBarItemSchema).min(1).max(8),
  alignment: z.enum(["center", "left"]).optional(),
});

export type TrustBarContent = z.infer<typeof TrustBarContentSchema>;

// ---------------------------------------------------------------------------
// Contenido por defecto
// ---------------------------------------------------------------------------

export const defaultTrustBarContent: TrustBarContent = {
  items: [
    {
      icon: "truck",
      title: "Envíos a todo el país",
      subtitle: "Despacho en 24-48hs hábiles",
    },
    {
      icon: "shield",
      title: "Compra protegida",
      subtitle: "Garantía de satisfacción",
    },
    {
      icon: "credit-card",
      title: "6 cuotas sin interés",
      subtitle: "Con todas las tarjetas bancarias",
    },
  ],
  alignment: "center",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isTrustBarTemplateId(value: unknown): value is TrustBarTemplateId {
  return (
    typeof value === "string" && (TRUST_BAR_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `TrustBarTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined.
 */
export function resolveTrustBarTemplateId(value: unknown): TrustBarTemplateId {
  return isTrustBarTemplateId(value) ? value : DEFAULT_TRUST_BAR_TEMPLATE_ID;
}
