"use client";

import type {
  StorefrontBootstrap,
  StorefrontCatalogProduct,
  StorefrontCategory,
  StorefrontPaymentMethod,
} from "@/lib/storefront-api";
import {
  buildSportAdventureHomeContent,
  sportAdventurePalette,
  type SportAdventureHomeContent,
  type SportAdventurePalette,
} from "@/lib/experiences/sportadventure";

import { SportAdventureHome } from "@/components/experiences/sportadventure/sportadventure-home";

export type SportAdventureHomeExperienceProps = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
  products?: StorefrontCatalogProduct[] | null;
  categories?: StorefrontCategory[] | null;
  paymentMethods?: StorefrontPaymentMethod[] | null;
  className?: string;
  contentOverride?: Partial<SportAdventureHomeContent>;
  paletteOverride?: Partial<SportAdventurePalette>;
};

export function SportAdventureHomeExperience({
  bootstrap,
  host,
  products,
  categories,
  paymentMethods,
  className,
  contentOverride,
  paletteOverride,
}: SportAdventureHomeExperienceProps) {
  const baseContent = buildSportAdventureHomeContent({
    bootstrap,
    host,
    ...(products !== undefined ? { products } : {}),
    ...(categories !== undefined ? { categories } : {}),
    ...(paymentMethods !== undefined ? { paymentMethods } : {}),
  });

  return (
    <SportAdventureHome
      {...(className ? { className } : {})}
      content={{ ...baseContent, ...contentOverride }}
      navigationContext={{
        host,
        tenantSlug: bootstrap?.tenant?.tenantSlug ?? null,
      }}
      palette={{ ...sportAdventurePalette, ...paletteOverride }}
    />
  );
}
