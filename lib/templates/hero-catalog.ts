import { z } from "zod";

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

export const HERO_TEMPLATE_IDS: readonly HeroTemplateId[] = [
  "split",
  "workshop",
  "editorial",
  "commerce",
];

export const DEFAULT_HERO_TEMPLATE_ID: HeroTemplateId = "split";

export type TemplateDescriptor = {
  id: string;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
};

export const HERO_TEMPLATE_DESCRIPTORS: Record<HeroTemplateId, TemplateDescriptor> = {
  split: {
    id: "split",
    label: "Split",
    description: "Texto a la izquierda, imagen a la derecha. Layout clásico e-commerce.",
    bestFor: ["catálogo general", "tiendas mayoristas", "presentación de producto destacado"],
    thumbnailUrl: "/template-thumbnails/hero-split.svg",
  },
  workshop: {
    id: "workshop",
    label: "Workshop",
    description: "Imagen full-bleed con overlay oscuro y tipografía potente sobre foto.",
    bestFor: ["lubricentros", "talleres", "industriales", "imagen dominante"],
    thumbnailUrl: "/template-thumbnails/hero-workshop.svg",
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    description: "Sólo tipografía centrada, acento tipográfico fuerte, sin imagen.",
    bestFor: ["boutique", "marcas premium", "servicios profesionales"],
    thumbnailUrl: "/template-thumbnails/hero-editorial.svg",
  },
  commerce: {
    id: "commerce",
    label: "Commerce",
    description:
      "Imagen full-bleed + overlay + título + subtítulo + badges de confianza + CTA + buscador visual. Paridad BYM.",
    bestFor: [
      "lubricentros",
      "mayoristas",
      "comercios con múltiples beneficios de confianza",
      "tiendas con buscador de productos",
    ],
    thumbnailUrl: "/template-thumbnails/hero-commerce.svg",
  },
};

const CtaSchema = z.object({
  label: z.string(),
  href: z.string(),
  variant: z.enum(["primary", "secondary", "link"]).optional(),
});

export const HERO_CONTENT_SCHEMAS = {
  split: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    imageAlt: z.string().optional(),
    primaryCta: CtaSchema.optional(),
    secondaryCta: CtaSchema.optional(),
    alignment: z.enum(["left", "right"]).optional(),
  }),
  workshop: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    imageUrl: z.string(),
    overlayOpacity: z.number().min(0).max(100).optional().default(55),
    primaryCta: CtaSchema.optional(),
  }),
  editorial: z.object({
    eyebrow: z.string().optional(),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    backgroundImageUrl: z.string().optional(),
    primaryCta: CtaSchema.optional(),
    secondaryCta: CtaSchema.optional(),
  }),
  commerce: z.object({
    imageUrl: z.string(),
    imageAlt: z.string().optional(),
    overlayOpacity: z.number().min(0).max(100).optional().default(45),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    badges: z
      .array(
        z.object({
          icon: z.enum(["truck", "shield", "credit-card", "star", "clock"]).optional(),
          label: z.string(),
        }),
      )
      .optional(),
    primaryCta: CtaSchema.optional(),
    secondaryCta: CtaSchema.optional(),
    searchPlaceholder: z.string().optional(),
    enableSearch: z.boolean().optional(),
  }),
} as const;

export type HeroContentSchemas = typeof HERO_CONTENT_SCHEMAS;
export type HeroCommerceContent = z.infer<HeroContentSchemas["commerce"]>;
export type HeroSplitContent = z.infer<HeroContentSchemas["split"]>;
export type HeroWorkshopContent = z.infer<HeroContentSchemas["workshop"]>;
export type HeroEditorialContent = z.infer<HeroContentSchemas["editorial"]>;

type DefaultContent<T extends HeroTemplateId> = z.infer<HeroContentSchemas[T]>;

export function defaultHeroContent(variant: "split"): DefaultContent<"split">;
export function defaultHeroContent(variant: "workshop"): DefaultContent<"workshop">;
export function defaultHeroContent(variant: "editorial"): DefaultContent<"editorial">;
export function defaultHeroContent(variant: "commerce"): DefaultContent<"commerce">;
export function defaultHeroContent(
  variant: HeroTemplateId,
): DefaultContent<"split"> | DefaultContent<"workshop"> | DefaultContent<"editorial"> | DefaultContent<"commerce"> {
  switch (variant) {
    case "split":
      return {
        title: "Bienvenido a nuestra tienda",
        subtitle: undefined,
        description: undefined,
        imageUrl: undefined,
        imageAlt: undefined,
        primaryCta: { label: "Ver catálogo", href: "/catalog" },
        secondaryCta: undefined,
        alignment: undefined,
      };
    case "workshop":
      return {
        title: "Profesionales al servicio de tu vehículo",
        subtitle: undefined,
        imageUrl: "",
        overlayOpacity: 55,
        primaryCta: { label: "Ver catálogo", href: "/catalog" },
      };
    case "editorial":
      return {
        eyebrow: undefined,
        title: "Calidad que habla por sí sola",
        subtitle: undefined,
        backgroundImageUrl: undefined,
        primaryCta: { label: "Explorar", href: "/catalog" },
        secondaryCta: undefined,
      };
    case "commerce":
      return {
        imageUrl: "",
        imageAlt: "Portada de la tienda",
        overlayOpacity: 45,
        title: "Neumáticos y servicios profesionales",
        subtitle: "Hasta 6 cuotas sin interés",
        badges: [
          { icon: "truck", label: "Envío a todo el país" },
          { icon: "shield", label: "Garantía oficial" },
          { icon: "credit-card", label: "Todos los medios de pago" },
        ],
        primaryCta: { label: "Ver catálogo", href: "/catalog" },
        secondaryCta: { label: "Contactar", href: "/contacto" },
        searchPlaceholder: "Buscá tu producto...",
        enableSearch: false,
      };
  }
}

export function isHeroTemplateId(value: unknown): value is HeroTemplateId {
  return typeof value === "string" && (HERO_TEMPLATE_IDS as readonly string[]).includes(value);
}

/**
 * Devuelve un HeroTemplateId válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined.
 */
export function resolveHeroTemplateId(value: unknown): HeroTemplateId {
  return isHeroTemplateId(value) ? value : DEFAULT_HERO_TEMPLATE_ID;
}
