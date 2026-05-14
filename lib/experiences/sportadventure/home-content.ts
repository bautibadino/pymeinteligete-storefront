import type {
  StorefrontBootstrap,
  StorefrontCatalogProduct,
  StorefrontCategory,
  StorefrontPaymentMethod,
} from "@/lib/storefront-api";
import { sportAdventureHomePreset } from "@/lib/experiences/sportadventure/preset";
import type { SportAdventureHomeContent } from "@/lib/experiences/sportadventure/types";

export type SportAdventureExperienceInput = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
  products?: StorefrontCatalogProduct[] | null;
  categories?: StorefrontCategory[] | null;
  paymentMethods?: StorefrontPaymentMethod[] | null;
};

export function buildSportAdventureHomeContent({
  bootstrap,
}: SportAdventureExperienceInput): SportAdventureHomeContent {
  return {
    ...sportAdventureHomePreset,
    ...(bootstrap?.branding?.logoUrl?.trim()
      ? { logoUrl: bootstrap.branding.logoUrl.trim() }
      : {}),
  };
}
