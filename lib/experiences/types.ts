import type {
  StorefrontBootstrap,
  StorefrontCatalogProduct,
  StorefrontCategory,
  StorefrontPaymentMethod,
} from "@/lib/storefront-api";
import type { TenantTheme } from "@/lib/theme";

export const CUSTOM_STOREFRONT_EXPERIENCE_KEYS = ["sportadventure-custom-v1"] as const;

export type CustomStorefrontExperienceKey = (typeof CUSTOM_STOREFRONT_EXPERIENCE_KEYS)[number];

export type CustomHomeExperienceProps = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
  theme: TenantTheme;
  products: StorefrontCatalogProduct[];
  categories: StorefrontCategory[];
  paymentMethods: StorefrontPaymentMethod[];
};
