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
  | "richText"
  | "videoHero";

export type ModuleVariant =
  | "split"
  | "workshop"
  | "editorial"
  | "commerce"
  | "button-overlay"
  | "grid"
  | "spotlight"
  | "rail"
  | "tiles"
  | "solid"
  | "stacked"
  | "inline"
  | "cards"
  | "compact"
  | "cinematic";

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

export type HeroBadge = {
  icon?: "truck" | "shield" | "credit-card" | "star" | "clock";
  label: string;
};

export type HeroModule = StorefrontModuleBase<"hero", "split" | "workshop" | "editorial" | "commerce" | "button-overlay"> & {
  buttonPosition?: "left" | "right";
  eyebrow?: string;
  title: string;
  description: string;
  image?: ModuleImage;
  primaryAction?: ModuleAction;
  secondaryAction?: ModuleAction;
  subtitle?: string;
  overlayOpacity?: number;
  badges?: HeroBadge[];
  searchPlaceholder?: string;
  enableSearch?: boolean;
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

export type VideoHeroModule = StorefrontModuleBase<"videoHero", "cinematic"> & {
  eyebrow?: string;
  title: string;
  description: string;
  videoSrc?: string;
  videoPoster?: string;
  primaryAction?: ModuleAction;
  secondaryAction?: ModuleAction;
};

export type StorefrontModule =
  | HeroModule
  | FeaturedProductsModule
  | CategoryRailModule
  | PromoBandModule
  | TrustBarModule
  | RichTextModule
  | VideoHeroModule;

export type ModuleRendererProps = {
  modules: StorefrontModule[];
  bootstrap: StorefrontBootstrap | null;
  theme: TenantTheme;
  host: string;
  products?: StorefrontCatalogProduct[];
  categories?: StorefrontCategory[];
  paymentMethods?: StorefrontPaymentMethod[];
};
