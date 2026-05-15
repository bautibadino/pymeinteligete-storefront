import type { StorefrontProductDetail } from "@/lib/storefront-api";

import { SportAdventureProductDetail } from "@/components/experiences/sportadventure/sportadventure-product-detail";

export type SportAdventureProductExperienceProps = {
  product: StorefrontProductDetail | null;
  host: string;
  tenantSlug?: string | null;
  className?: string;
};

export function SportAdventureProductExperience({
  product,
  host,
  tenantSlug,
  className,
}: SportAdventureProductExperienceProps) {
  return (
    <SportAdventureProductDetail
      host={host}
      product={product}
      {...(tenantSlug !== undefined ? { tenantSlug } : {})}
      {...(className ? { className } : {})}
    />
  );
}
