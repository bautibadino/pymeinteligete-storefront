import { Truck } from "lucide-react";

import type { ProductCardBadge } from "@/lib/templates/product-card-catalog";

function isShippingLabel(label: string): boolean {
  const normalized = label
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();

  return normalized.includes("envio gratis") || normalized.includes("free shipping");
}

export function isProductCardShippingBadge(badge: ProductCardBadge): boolean {
  return badge.icon === "shipping" || isShippingLabel(badge.label);
}

export function ProductCardBadgeIcon({ badge }: { badge: ProductCardBadge }) {
  if (!isProductCardShippingBadge(badge)) {
    return null;
  }

  return <Truck className="size-3" data-badge-icon="shipping" aria-hidden="true" />;
}
