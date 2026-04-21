import Link from "next/link";

import type { ShopStatus } from "@/lib/storefront-api";

import {
  canAccessCheckout,
  canBrowseCatalog,
  canRenderBootstrap,
  resolveStatusMessage,
  resolveStatusTone,
} from "@/app/(storefront)/_lib/storefront-shell-data";

type SurfaceStateCardProps = {
  shopStatus: ShopStatus | null;
  surface: "home" | "catalog" | "product" | "checkout" | "confirmation";
  title: string;
  description?: string;
};

function isSurfaceAvailable(shopStatus: ShopStatus | null, surface: SurfaceStateCardProps["surface"]) {
  switch (surface) {
    case "home":
      return canRenderBootstrap(shopStatus);
    case "catalog":
    case "product":
      return canBrowseCatalog(shopStatus);
    case "checkout":
      return canAccessCheckout(shopStatus);
    case "confirmation":
      return true;
    default:
      return false;
  }
}

function resolveAction(surface: SurfaceStateCardProps["surface"]) {
  if (surface === "checkout") {
    return { href: "/catalogo" as const, label: "Volver al catálogo" };
  }

  if (surface === "confirmation") {
    return { href: "/" as const, label: "Ir al inicio" };
  }

  return { href: "/" as const, label: "Ir al inicio" };
}

export function SurfaceStateCard({
  shopStatus,
  surface,
  title,
  description,
}: SurfaceStateCardProps) {
  const available = isSurfaceAvailable(shopStatus, surface);
  const action = resolveAction(surface);
  const tone = resolveStatusTone(shopStatus);

  if (available) {
    return null;
  }

  return (
    <section className="surface-state-card">
      <span className={`status-badge status-badge-${tone}`}>{resolveStatusMessage(shopStatus)}</span>
      <h2>{title}</h2>
      <p>
        {description ??
          "La superficie solicitada no está habilitada para el estado actual de la tienda según la política documentada de `shopStatus`."}
      </p>
      <Link className="surface-action" href={action.href}>
        {action.label}
      </Link>
    </section>
  );
}
