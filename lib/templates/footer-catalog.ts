import { z } from "zod";

/**
 * Catálogo de variantes de footer — metadata pura, sin imports JSX.
 * Seguro de importar en tests unitarios y en server code.
 * Los componentes React viven en `components/templates/footer/`.
 *
 * Variantes:
 *   - four-columns  → 4 columnas (empresa/productos/contacto/legal). Paridad BYM.
 *   - minimal       → Una fila: logo + copy + social.
 *   - with-newsletter → 3 columnas + banner newsletter al top.
 *   - corporate     → 5 columnas + trust bar integrada + social.
 */

// ---------------------------------------------------------------------------
// IDs y tipos
// ---------------------------------------------------------------------------

export type FooterTemplateId =
  | "four-columns"
  | "minimal"
  | "with-newsletter"
  | "corporate";

export const FOOTER_TEMPLATE_IDS: readonly FooterTemplateId[] = [
  "four-columns",
  "minimal",
  "with-newsletter",
  "corporate",
];

export const DEFAULT_FOOTER_TEMPLATE_ID: FooterTemplateId = "four-columns";

// ---------------------------------------------------------------------------
// Descriptores
// ---------------------------------------------------------------------------

export type FooterTemplateDescriptor = {
  id: FooterTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
};

export const FOOTER_TEMPLATE_DESCRIPTORS: Record<
  FooterTemplateId,
  FooterTemplateDescriptor
> = {
  "four-columns": {
    id: "four-columns",
    label: "Cuatro Columnas",
    description:
      "Layout clásico con 4 columnas (empresa, productos, contacto, legal), redes sociales y copyright. Paridad BYM.",
    bestFor: [
      "lubricentros",
      "mayoristas",
      "tiendas con catálogo extenso",
      "negocios que necesitan mucho espacio informativo",
    ],
    thumbnailUrl: "/template-thumbnails/footer-four-columns.svg",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    description:
      "Una fila con logo, tagline, íconos de redes sociales y copyright. Máxima sobriedad.",
    bestFor: [
      "boutique",
      "marcas premium",
      "portfolios",
      "landing pages minimalistas",
    ],
    thumbnailUrl: "/template-thumbnails/footer-minimal.svg",
  },
  "with-newsletter": {
    id: "with-newsletter",
    label: "Con Newsletter",
    description:
      "Banner de suscripción al newsletter destacado en el top, seguido de 3 columnas de links y social.",
    bestFor: [
      "e-commerce con estrategia de email marketing",
      "tiendas con ofertas periódicas",
      "negocios que quieren crecer su base de suscriptores",
    ],
    thumbnailUrl: "/template-thumbnails/footer-with-newsletter.svg",
  },
  corporate: {
    id: "corporate",
    label: "Corporativo",
    description:
      "5 columnas + strip de confianza integrado (íconos + texto) + redes sociales. Máxima presencia informativa.",
    bestFor: [
      "empresas grandes",
      "distribuidoras",
      "marcas con múltiples líneas de productos",
      "negocios B2B",
    ],
    thumbnailUrl: "/template-thumbnails/footer-corporate.svg",
  },
};

// ---------------------------------------------------------------------------
// Schema Zod compartido
// ---------------------------------------------------------------------------

export const SocialPlatformSchema = z.enum([
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "x",
  "whatsapp",
]);

export type SocialPlatform = z.infer<typeof SocialPlatformSchema>;

export const FooterSocialLinkSchema = z.object({
  platform: SocialPlatformSchema,
  href: z.string().url(),
});

export const FooterColumnSchema = z.object({
  title: z.string().min(1),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      })
    )
    .min(1),
});

export const FooterContactSchema = z.object({
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional(),
});

export const FooterNewsletterSchema = z.object({
  enabled: z.boolean(),
  title: z.string().optional(),
  placeholder: z.string().optional(),
  successMessage: z.string().optional(),
});

export const FooterLegalLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

/**
 * Schema completo del content de footer. Válido para todas las variantes;
 * cada componente consume sólo los campos que le corresponden.
 */
export const FooterContentSchema = z.object({
  logoUrl: z.string().optional(),
  tagline: z.string().optional(),
  columns: z.array(FooterColumnSchema).optional(),
  socialLinks: z.array(FooterSocialLinkSchema).optional(),
  contact: FooterContactSchema.optional(),
  newsletter: FooterNewsletterSchema.optional(),
  legal: z.array(FooterLegalLinkSchema).optional(),
  copyright: z.string().optional(),
});

export type FooterContent = z.infer<typeof FooterContentSchema>;

// ---------------------------------------------------------------------------
// Contenido por defecto
// ---------------------------------------------------------------------------

export const defaultFooterContent: FooterContent = {
  logoUrl: "",
  tagline: "Tu tienda en línea",
  columns: [
    {
      title: "Empresa",
      links: [
        { label: "Sobre nosotros", href: "/sobre-nosotros" },
        { label: "Contacto", href: "/contacto" },
        { label: "Trabaja con nosotros", href: "/empleos" },
      ],
    },
    {
      title: "Productos",
      links: [
        { label: "Catálogo", href: "/catalogo" },
        { label: "Ofertas", href: "/ofertas" },
        { label: "Novedades", href: "/novedades" },
      ],
    },
    {
      title: "Ayuda",
      links: [
        { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
        { label: "Envíos y entregas", href: "/envios-y-entregas" },
        { label: "Devoluciones", href: "/devoluciones" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Términos y condiciones", href: "/terminos" },
        { label: "Política de privacidad", href: "/privacidad" },
      ],
    },
  ],
  socialLinks: [
    { platform: "instagram", href: "https://instagram.com" },
    { platform: "facebook", href: "https://facebook.com" },
  ],
  contact: {
    phone: "+54 11 0000-0000",
    email: "contacto@tienda.com",
  },
  newsletter: {
    enabled: false,
    title: "Suscribite a nuestras novedades",
    placeholder: "Tu email",
    successMessage: "¡Gracias por suscribirte!",
  },
  legal: [
    { label: "Términos y condiciones", href: "/terminos" },
    { label: "Política de privacidad", href: "/privacidad" },
  ],
  copyright: `© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.`,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isFooterTemplateId(value: unknown): value is FooterTemplateId {
  return (
    typeof value === "string" &&
    (FOOTER_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Devuelve un `FooterTemplateId` válido a partir de cualquier input.
 * Si no matchea, cae al default. Nunca devuelve undefined ni lanza.
 */
export function resolveFooterTemplateId(value: unknown): FooterTemplateId {
  return isFooterTemplateId(value) ? value : DEFAULT_FOOTER_TEMPLATE_ID;
}
