import type { ShopStatus, StorefrontBootstrap } from "@/lib/storefront-api";

export type NotFoundPolicy = {
  statusLabel: string;
  title: string;
  description: string;
};

export function resolveNotFoundPolicy(
  host: string,
  bootstrap: StorefrontBootstrap | null,
  fetchError: boolean,
): NotFoundPolicy {
  if (fetchError) {
    return {
      statusLabel: "Sin resolver",
      title: "No pudimos contactar la plataforma",
      description: `El host ${host} no devolvió un tenant válido o la plataforma no respondió. Verificá la URL o volvé más tarde.`,
    };
  }

  if (!bootstrap) {
    return {
      statusLabel: "Sin resolver",
      title: "Tienda no encontrada",
      description: `No existe un storefront configurado para el host ${host}.`,
    };
  }

  switch (bootstrap.shopStatus) {
    case "disabled":
      return {
        statusLabel: "No disponible",
        title: "Tienda deshabilitada",
        description:
          "Este storefront está deshabilitado públicamente. Contactá al administrador del tenant para más información.",
      };
    case "draft":
      return {
        statusLabel: "En preparación",
        title: "Tienda en borrador",
        description:
          "Este storefront está en modo borrador. Solo está disponible para preview controlado.",
      };
    case "paused":
      return {
        statusLabel: "Pausada",
        title: "Tienda pausada",
        description: "Este storefront está temporalmente pausado. Volvé a intentar más tarde.",
      };
    default:
      return {
        statusLabel: "No encontrada",
        title: "Página no encontrada",
        description: "La URL solicitada no existe en este storefront.",
      };
  }
}
