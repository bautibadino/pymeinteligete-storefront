import type { StorefrontProductDetail } from "@/lib/storefront-api";

import { SportAdventureProductDetail } from "@/components/experiences/sportadventure/sportadventure-product-detail";

export type SportAdventureProductExperienceProps = {
  product: StorefrontProductDetail | null;
  className?: string;
};

export function SportAdventureProductExperience({
  product,
  className,
}: SportAdventureProductExperienceProps) {
  return (
    <SportAdventureProductDetail
      product={product}
      {...(className ? { className } : {})}
    />
  );
}
