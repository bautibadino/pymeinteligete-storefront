/**
 * Catálogo de variantes de Header — metadata pura, sin JSX.
 *
 * Seguro de importar en tests unitarios (Vitest corre en Node sin React) y
 * en server code que sólo necesite saber qué templates existen
 * (endpoints de descubrimiento, validación del bootstrap, editor del ERP).
 *
 * Los componentes React viven en:
 *   components/templates/header/header-<variant>.tsx
 *
 * El tipo HeaderModule vive en:
 *   lib/modules/header.ts
 */

import { z } from "zod";
import type { HeaderTemplateVariant } from "@/lib/modules/header";

// ---------------------------------------------------------------------------
// Template IDs
// ---------------------------------------------------------------------------

export type HeaderTemplateId = HeaderTemplateVariant;

export const HEADER_TEMPLATE_IDS: readonly HeaderTemplateId[] = [
  "centered-logo",
  "left-logo-search",
  "sticky-compact",
  "minimal",
];

export const DEFAULT_HEADER_TEMPLATE_ID: HeaderTemplateId = "centered-logo";

// ---------------------------------------------------------------------------
// Descriptors (para el editor / endpoints de descubrimiento)
// ---------------------------------------------------------------------------

export type HeaderTemplateDescriptor = {
  id: HeaderTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
};

export const HEADER_TEMPLATE_DESCRIPTORS: Record<
  HeaderTemplateId,
  HeaderTemplateDescriptor
> = {
  "centered-logo": {
    id: "centered-logo",
    label: "Logo Centrado",
    description:
      "Logo centrado en la primera fila, navegación debajo, carrito y búsqueda en los extremos.",
    bestFor: ["boutique", "marcas premium", "tiendas editoriales", "lifestyle"],
    thumbnailUrl: "/template-thumbnails/header-centered-logo.svg",
  },
  "left-logo-search": {
    id: "left-logo-search",
    label: "Logo + Búsqueda",
    description:
      "Logo a la izquierda, buscador grande centrado, carrito a la derecha y navegación debajo. Paridad BYM.",
    bestFor: [
      "tiendas mayoristas",
      "lubricentros",
      "ferreterías",
      "catálogos grandes",
    ],
    thumbnailUrl: "/template-thumbnails/header-left-logo-search.svg",
  },
  "sticky-compact": {
    id: "sticky-compact",
    label: "Sticky Compacto",
    description:
      "Header compacto que se pega al top al hacer scroll. Logo + búsqueda inline + carrito.",
    bestFor: ["mobile-first", "tiendas con catálogo largo", "experiencia fluida"],
    thumbnailUrl: "/template-thumbnails/header-sticky-compact.svg",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    description:
      "Solo logo y carrito. Sin navegación ni buscador. Ultra-limpio.",
    bestFor: ["landing pages", "marcas de autor", "one-product stores"],
    thumbnailUrl: "/template-thumbnails/header-minimal.svg",
  },
};

// ---------------------------------------------------------------------------
// Type guard y resolver
// ---------------------------------------------------------------------------

export function isHeaderTemplateId(value: unknown): value is HeaderTemplateId {
  return (
    typeof value === "string" &&
    (HEADER_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `HeaderTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined ni lanza.
 */
export function resolveHeaderTemplateId(value: unknown): HeaderTemplateId {
  return isHeaderTemplateId(value) ? value : DEFAULT_HEADER_TEMPLATE_ID;
}

// ---------------------------------------------------------------------------
// Zod content schemas (validados desde SectionInstance.content)
// ---------------------------------------------------------------------------

const CtaSchema = z.object({
  label: z.string(),
  href: z.string(),
  variant: z.enum(["primary", "secondary", "link"]).optional(),
});

const NavLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  children: z
    .array(z.object({ label: z.string(), href: z.string() }))
    .optional(),
});

const TopBarLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

/**
 * Schema base compartido por todas las variantes.
 * Los campos son opcionales para soportar contenido incompleto durante edición.
 */
const HeaderBaseSchema = z.object({
  logoUrl: z.string().optional(),
  logoHref: z.string().optional(),
  logoAlt: z.string().optional(),
  navLinks: z.array(NavLinkSchema).optional(),
  showSearch: z.boolean().optional(),
  searchPlaceholder: z.string().optional(),
  showCart: z.boolean().optional(),
  showAccount: z.boolean().optional(),
  topBarLinks: z.array(TopBarLinkSchema).optional(),
});

export const HEADER_CONTENT_SCHEMAS: Record<HeaderTemplateId, z.ZodTypeAny> = {
  "centered-logo": HeaderBaseSchema,
  "left-logo-search": HeaderBaseSchema,
  "sticky-compact": HeaderBaseSchema,
  minimal: HeaderBaseSchema,
};

/** Tipo inferido del schema base (contenido del SectionInstance). */
export type HeaderContent = z.infer<typeof HeaderBaseSchema>;

// Reexportar para evitar que consumers tengan que importar desde zod
export { CtaSchema, NavLinkSchema, TopBarLinkSchema, HeaderBaseSchema };
