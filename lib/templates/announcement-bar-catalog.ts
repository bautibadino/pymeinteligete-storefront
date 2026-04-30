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
  "rotating",
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

const announcementBarAppearanceSchema = z.object({
  surface: z.enum(["solid", "gradient"]).optional(),
  backgroundColor: z.string().min(1).optional(),
  textColor: z.string().min(1).optional(),
  accentColor: z.string().min(1).optional(),
  borderColor: z.string().min(1).optional(),
  gradientFrom: z.string().min(1).optional(),
  gradientVia: z.string().min(1).optional(),
  gradientTo: z.string().min(1).optional(),
});

export const ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS: Record<
  AnnouncementBarTemplateId,
  AnnouncementBarTemplateDescriptor
> = {
  static: {
    id: "static",
    label: "Mensaje fijo",
    description:
      "Una sola línea centrada con CTA opcional. Ideal para comunicar una promo o aviso principal sin ruido visual.",
    bestFor: ["envío gratis", "promoción vigente", "aviso principal", "lanzamientos"],
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
      appearance: announcementBarAppearanceSchema.optional(),
    }),
  },

  rotating: {
    id: "rotating",
    label: "Rotating",
    description:
      "Mensajes que rotan de a uno, centrados y sin chips. Sirve cuando necesitás varias promos en el mismo espacio.",
    bestFor: ["múltiples promos", "mensajes secuenciales", "novedades", "top bar dinámica"],
    thumbnailUrl: "/template-thumbnails/announcement-bar-rotating.svg",
    contentSchema: z.object({
      variant: z.literal("rotating"),
      messages: z
        .array(z.string().min(1))
        .min(1, "Se requiere al menos un mensaje")
        .max(6, "Máximo 6 mensajes"),
      speed: z.enum(["slow", "normal", "fast"]).optional(),
      motion: z
        .object({
          rotationIntervalMs: z.number().int().positive().max(20000).optional(),
        })
        .optional(),
      appearance: announcementBarAppearanceSchema.optional(),
    }),
  },

  scroll: {
    id: "scroll",
    label: "Ticker horizontal",
    description:
      "Marquee continuo con mensajes en línea y separador plano. Mantiene el movimiento sin recurrir a pills o chips.",
    bestFor: ["múltiples promos", "cuotas + descuento + envíos", "top bar dinámica"],
    thumbnailUrl: "/template-thumbnails/announcement-bar-scroll.svg",
    contentSchema: z.object({
      variant: z.literal("scroll"),
      messages: z
        .array(z.string().min(1))
        .min(1, "Se requiere al menos un mensaje"),
      separator: z.string().min(1).max(3).optional(),
      speed: z.enum(["slow", "normal", "fast"]).optional(),
      pauseOnHover: z.boolean().optional(),
      appearance: announcementBarAppearanceSchema.optional(),
    }),
  },

  countdown: {
    id: "countdown",
    label: "Countdown",
    description:
      "Cuenta regresiva en línea, centrada y limpia, con CTA sutil para desktop.",
    bestFor: ["oferta por tiempo limitado", "flash sale", "promoción con vencimiento"],
    thumbnailUrl: "/template-thumbnails/announcement-bar-countdown.svg",
    contentSchema: z.object({
      variant: z.literal("countdown"),
      message: z.string().min(1, "El mensaje es obligatorio"),
      endsAt: z.string().datetime("La fecha de fin debe estar en formato ISO"),
      completedMessage: z.string().optional(),
      cta: z
        .object({
          label: z.string().min(1),
          href: z.string().min(1),
          variant: z.enum(["primary", "secondary", "link"]).optional(),
        })
        .optional(),
      appearance: announcementBarAppearanceSchema.optional(),
    }),
  },

  badges: {
    id: "badges",
    label: "Inline badges",
    description:
      "Fila centrada de ícono más etiqueta, sin cápsulas ni bordes por item. Pensado para beneficios clave bien arriba.",
    bestFor: ["confianza", "beneficios clave", "envío/garantía/cuotas", "diferenciales"],
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
      appearance: announcementBarAppearanceSchema.optional(),
    }),
  },
};

// ─── Contenido por defecto ──────────────────────────────────────────────────

type ContentByVariant = {
  static: Extract<AnnouncementBarModule, { variant: "static" }>;
  rotating: Extract<AnnouncementBarModule, { variant: "rotating" }>;
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
    message: "Comprá hoy con envío a todo el país y promociones activas.",
    appearance: {
      surface: "gradient",
      gradientFrom: "#111827",
      gradientVia: "#1d4ed8",
      gradientTo: "#0f172a",
      textColor: "#f8fafc",
    },
    cta: {
      label: "Ver promos",
      href: "/catalogo",
      variant: "primary",
    },
  },
  rotating: {
    variant: "rotating",
    messages: [
      "6 cuotas sin interés en productos seleccionados",
      "Envíos a todo el país con seguimiento online",
      "Retirá hoy mismo por sucursal",
    ],
    speed: "normal",
    motion: {
      rotationIntervalMs: 3200,
    },
    appearance: {
      surface: "gradient",
      gradientFrom: "#111827",
      gradientVia: "#1d4ed8",
      gradientTo: "#0f172a",
      textColor: "#f8fafc",
    },
  },
  scroll: {
    variant: "scroll",
    messages: [
      "6 cuotas sin interés con tarjetas bancarias",
      "20% de descuento pagando en efectivo",
      "Envíos a todo el país",
    ],
    speed: "normal",
    separator: "•",
    pauseOnHover: true,
    appearance: {
      surface: "gradient",
      gradientFrom: "#1f2937",
      gradientVia: "#334155",
      gradientTo: "#0f172a",
      textColor: "#f8fafc",
    },
  },
  countdown: {
    variant: "countdown",
    message: "Precios especiales hasta agotar stock.",
    endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    completedMessage: "La oferta ha finalizado.",
    cta: {
      label: "Comprar ahora",
      href: "/catalogo",
      variant: "primary",
    },
    appearance: {
      surface: "gradient",
      gradientFrom: "#431407",
      gradientVia: "#9a3412",
      gradientTo: "#1f2937",
      textColor: "#fff7ed",
    },
  },
  badges: {
    variant: "badges",
    items: [
      { icon: "truck", label: "Envío a todo el país" },
      { icon: "shield", label: "Garantía oficial" },
      { icon: "credit-card", label: "6 cuotas sin interés" },
    ],
    appearance: {
      surface: "solid",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
      borderColor: "#cbd5e1",
      accentColor: "rgba(15, 23, 42, 0.06)",
    },
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
