/**
 * Helper de WhatsApp para Sport Adventure.
 * Genera URLs de wa.me con mensaje dinámico según el contexto del producto.
 *
 * Número de contacto: 341 647-6751 (Rosario, Santa Fe)
 * Empresa: Sport Adventure / GRUPO DE SERVICIOS S.A.
 */

const SA_WHATSAPP_NUMBER = "5493416476751";
const SA_BASE_URL = "https://wa.me";

export type WhatsAppProductContext = {
  name?: string | null | undefined;
  category?: string | null | undefined;
  brand?: string | null | undefined;
  slug?: string | null | undefined;
  /** URL pública del producto (si está disponible) */
  url?: string | null | undefined;
};

/**
 * Genera un link de WhatsApp para consultar sobre un producto específico.
 */
export function buildProductWhatsAppUrl(ctx: WhatsAppProductContext): string {
  const parts: string[] = ["Hola, quiero consultar sobre un producto de Sport Adventure."];

  if (ctx.name) {
    parts.push(`*Producto:* ${ctx.name}`);
  }

  if (ctx.category) {
    parts.push(`*Categoría:* ${ctx.category}`);
  }

  if (ctx.brand) {
    parts.push(`*Marca:* ${ctx.brand}`);
  }

  if (ctx.url) {
    parts.push(`*Link:* ${ctx.url}`);
  }

  const message = parts.join("\n");
  return `${SA_BASE_URL}/${SA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Link de consulta general (sin contexto de producto específico).
 */
export function buildGeneralWhatsAppUrl(message?: string): string {
  const text = message ?? "Hola, quiero consultar sobre productos de Sport Adventure.";
  return `${SA_BASE_URL}/${SA_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
