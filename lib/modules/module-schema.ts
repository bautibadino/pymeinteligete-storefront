import type {
  StorefrontBootstrap,
  StorefrontCatalogProduct,
  StorefrontCategory,
  StorefrontPaymentMethod,
} from "@/lib/storefront-api";
import type { TenantTheme } from "@/lib/theme";

export type StorefrontModuleType =
  | "hero"
  | "featuredProducts"
  | "categoryRail"
  | "promoBand"
  | "trustBar"
  | "richText";

export type ModuleVariant =
  | "split"
  | "workshop"
  | "editorial"
  | "grid"
  | "spotlight"
  | "rail"
  | "tiles"
  | "solid"
  | "stacked"
  | "inline"
  | "cards"
  | "compact";

export type StorefrontModuleBase<TType extends StorefrontModuleType, TVariant extends ModuleVariant> = {
  id: string;
  type: TType;
  variant: TVariant;
};

export type ModuleAction = {
  label: string;
  href: string;
};

export type ModuleImage = {
  src: string;
  alt: string;
};

export type ModuleTextItem = {
  title: string;
  description?: string;
  href?: string;
};

export type HeroModule = StorefrontModuleBase<"hero", "split" | "workshop" | "editorial"> & {
  eyebrow?: string;
  title: string;
  description: string;
  image?: ModuleImage;
  primaryAction?: ModuleAction;
  secondaryAction?: ModuleAction;
};

export type FeaturedProductsModule = StorefrontModuleBase<"featuredProducts", "grid" | "spotlight"> & {
  eyebrow?: string;
  title: string;
  description?: string;
  limit: number;
};

export type CategoryRailModule = StorefrontModuleBase<"categoryRail", "rail" | "tiles"> & {
  eyebrow?: string;
  title: string;
  description?: string;
  limit: number;
};

export type PromoBandModule = StorefrontModuleBase<"promoBand", "solid" | "split"> & {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ModuleAction;
};

export type TrustBarModule = StorefrontModuleBase<"trustBar", "inline" | "cards"> & {
  eyebrow?: string;
  title?: string;
  items: ModuleTextItem[];
};

export type RichTextModule = StorefrontModuleBase<"richText", "editorial" | "compact"> & {
  eyebrow?: string;
  title: string;
  body: string;
  action?: ModuleAction;
};

export type StorefrontModule =
  | HeroModule
  | FeaturedProductsModule
  | CategoryRailModule
  | PromoBandModule
  | TrustBarModule
  | RichTextModule;

export type ModuleRendererProps = {
  modules: StorefrontModule[];
  bootstrap: StorefrontBootstrap | null;
  theme: TenantTheme;
  host: string;
  products?: StorefrontCatalogProduct[];
  categories?: StorefrontCategory[];
  paymentMethods?: StorefrontPaymentMethod[];
};
