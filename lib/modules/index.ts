export { normalizeModules } from "@/lib/modules/normalize-modules";
export type {
  CategoryRailModule,
  FeaturedProductsModule,
  HeroBadge,
  HeroModule,
  ModuleAction,
  ModuleImage,
  ModuleRendererProps,
  ModuleTextItem,
  ModuleVariant,
  PromoBandModule,
  RichTextModule,
  StorefrontModule,
  StorefrontModuleType,
  TrustBarModule,
} from "@/lib/modules/module-schema";

// Builder module types — Ola 2
export * from "@/lib/modules/announcement-bar";
export * from "@/lib/modules/catalog-layout";
export * from "@/lib/modules/category-tile";
export * from "@/lib/modules/faq";
export * from "@/lib/modules/footer";
export * from "@/lib/modules/header";
export * from "@/lib/modules/product-detail";
export * from "@/lib/modules/product-grid";
export * from "@/lib/modules/promo-band";
export * from "@/lib/modules/rich-text";
export * from "@/lib/modules/testimonials";
export type { TrustBarContent, TrustBarModule as TrustBarBuilderModule } from "@/lib/modules/trust-bar";

// ProductCard types live in the template catalog
export * from "@/lib/templates/product-card-catalog";
