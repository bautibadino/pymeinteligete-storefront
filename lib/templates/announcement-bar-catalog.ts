import { z } from "zod";

import type {
  AnnouncementBarModule,
  AnnouncementBarVariant,
} from "@/lib/modules/announcement-bar";

/**
 * Catálogo de templates de AnnouncementBar.
 *
 * Este módulo es seguro de importar en tests unitarios (sin JSX)
 * y en endpoints de descubrimiento del ERP.
 *
 * Los componentes React viven en:
 *   `components/templates/announcement-bar/announcement-bar-<variant>.tsx`
 */

// ─── Template IDs ──────────────────────────────────────────────────────────

export type AnnouncementBarTemplateId = AnnouncementBarVariant;

export const ANNOUNCEMENT_BAR_TEMPLATE_IDS: readonly AnnouncementBarTemplateId[] = [
  "static",
  "scroll",
  "countdown",
  "badges",
];

export const DEFAULT_ANNOUNCEMENT_BAR_TEMPLATE_ID: AnnouncementBarTemplateId = "static";

// ─── Helpers de identidad ───────────────────────────────────────────────────

export function isAnnouncementBarTemplateId(
  value: unknown,
): value is AnnouncementBarTemplateId {
  return (
    typeof value === "string" &&
    (ANNOUNCEMENT_BAR_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `AnnouncementBarTemplateId` válido desde cualquier input.
 * Nunca falla — degrada al default si no matchea.
 */
export function resolveAnnouncementBarTemplateId(
  value: unknown,
): AnnouncementBarTemplateId {
  return isAnnouncementBarTemplateId(value) ? value : DEFAULT_ANNOUNCEMENT_BAR_TEMPLATE_ID;
}

// ─── Descriptores ───────────────────────────────────────────────────────────

export type AnnouncementBarTemplateDescriptor = {
  id: AnnouncementBarTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
  contentSchema: z.ZodTypeAny;
};

export const ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS: Record<
  AnnouncementBarTemplateId,
  AnnouncementBarTemplateDescriptor
> = {
  static: {
    id: "static",
    label: "Estático",
    description: "Mensaje fijo con CTA opcional. Ideal para promos permanentes.",
    bestFor: ["envío gratis", "promoción vigente", "aviso importante"],
    thumbnailUrl: "/template-thumbnails/announcement-bar-static.svg",
    contentSchema: z.object({
      variant: z.literal("static"),
      message: z.string().min(1, "El mensaje es obligatorio"),
      cta: z
        .object({
          label: z.string().min(1),
          href: z.string().min(1),
          variant: z.enum(["primary", "secondary", "link"]).optional(),
        })
        .optional(),
    }),
  },

  scroll: {
    id: "scroll",
    label: "Desplazamiento",
    description:
      "Marquee automático con múltiples mensajes. Paridad BYM — ideal para varias promos.",
    bestFor: ["múltiples promos", "cuotas + descuento + envíos", "tiendas activas"],
    thumbnailUrl: "/template-thumbnails/announcement-bar-scroll.svg",
    contentSchema: z.object({
      variant: z.literal("scroll"),
      messages: z
        .array(z.string().min(1))
        .min(1, "Se requiere al menos un mensaje"),
      speed: z.enum(["slow", "normal", "fast"]).optional(),
    }),
  },

  countdown: {
    id: "countdown",
    label: "Countdown",
    description:
      "Cuenta regresiva hasta una fecha límite. Genera urgencia de compra.",
    bestFor: ["oferta por tiempo limitado", "flash sale", "promoción con vencimiento"],
    thumbnailUrl: "/template-thumbnails/announcement-bar-countdown.svg",
    contentSchema: z.object({
      variant: z.literal("countdown"),
      message: z.string().min(1, "El mensaje es obligatorio"),
      endsAt: z.string().min(1, "La fecha de fin es obligatoria"),
      completedMessage: z.string().optional(),
    }),
  },

  badges: {
    id: "badges",
    label: "Badges",
    description:
      "3–5 íconos con texto corto (envío / pago / garantía). Transmite confianza de un vistazo.",
    bestFor: ["confianza", "beneficios clave", "envío/garantía/cuotas"],
    thumbnailUrl: "/template-thumbnails/announcement-bar-badges.svg",
    contentSchema: z.object({
      variant: z.literal("badges"),
      items: z
        .array(
          z.object({
            icon: z.string().min(1),
            label: z.string().min(1),
          }),
        )
        .min(1, "Se requiere al menos un badge")
        .max(5, "Máximo 5 badges"),
    }),
  },
};

// ─── Contenido por defecto ──────────────────────────────────────────────────

type ContentByVariant = {
  static: Extract<AnnouncementBarModule, { variant: "static" }>;
  scroll: Extract<AnnouncementBarModule, { variant: "scroll" }>;
  countdown: Extract<AnnouncementBarModule, { variant: "countdown" }>;
  badges: Extract<AnnouncementBarModule, { variant: "badges" }>;
};

type DefaultContentMap = {
  [K in AnnouncementBarTemplateId]: Omit<ContentByVariant[K], "id" | "type" | "enabled" | "order">;
};

const DEFAULT_CONTENT: DefaultContentMap = {
  static: {
    variant: "static",
    message: "¡Bienvenidos! Consultá nuestras promociones.",
  },
  scroll: {
    variant: "scroll",
    messages: [
      "6 cuotas sin interés con tarjetas bancarias",
      "20% de descuento pagando en efectivo",
      "Envíos a todo el país",
    ],
    speed: "normal",
  },
  countdown: {
    variant: "countdown",
    message: "¡Oferta por tiempo limitado!",
    endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    completedMessage: "La oferta ha finalizado.",
  },
  badges: {
    variant: "badges",
    items: [
      { icon: "truck", label: "Envío a todo el país" },
      { icon: "shield", label: "Garantía oficial" },
      { icon: "credit-card", label: "6 cuotas sin interés" },
    ],
  },
};

/**
 * Devuelve el contenido default para una variante dada.
 * Util para inicializar una sección nueva desde el editor.
 */
export function defaultAnnouncementBarContent<T extends AnnouncementBarTemplateId>(
  variant: T,
): DefaultContentMap[T] {
  return DEFAULT_CONTENT[variant];
}
