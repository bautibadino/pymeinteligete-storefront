import type { ComponentType } from "react";

// Hero
import { HeroCommerce } from "@/components/templates/hero/hero-commerce";
import { HeroEditorial } from "@/components/templates/hero/hero-editorial";
import { HeroSplit } from "@/components/templates/hero/hero-split";
import { HeroWorkshop } from "@/components/templates/hero/hero-workshop";
import type { HeroModule } from "@/lib/modules";
import { resolveHeroTemplateId, type HeroTemplateId } from "@/lib/templates/hero-catalog";

// TrustBar
import { TrustBarCompactStrip } from "@/components/templates/trust-bar/trust-bar-compact-strip";
import { TrustBarInline } from "@/components/templates/trust-bar/trust-bar-inline";
import { TrustBarRailDense } from "@/components/templates/trust-bar/trust-bar-rail-dense";
import { TrustBarStackedCards } from "@/components/templates/trust-bar/trust-bar-stacked-cards";
import type { TrustBarModule } from "@/lib/modules/trust-bar";
import { resolveTrustBarTemplateId, type TrustBarTemplateId } from "@/lib/templates/trust-bar-catalog";

// CategoryTile
import { CategoryTileCompactList } from "@/components/templates/category-tile/category-tile-compact-list";
import { CategoryTileGridCards } from "@/components/templates/category-tile/category-tile-grid-cards";
import { CategoryTileMasonry } from "@/components/templates/category-tile/category-tile-masonry";
import { CategoryTileRailHorizontal } from "@/components/templates/category-tile/category-tile-rail-horizontal";
import type { CategoryTileModule } from "@/lib/modules/category-tile";
import { resolveCategoryTileTemplateId, type CategoryTileTemplateId } from "@/lib/templates/category-tile-catalog";

// ProductGrid
import { ProductGridCarouselArrows } from "@/components/templates/product-grid/product-grid-carousel-arrows";
import { ProductGridGrid3 } from "@/components/templates/product-grid/product-grid-grid-3";
import { ProductGridGrid4 } from "@/components/templates/product-grid/product-grid-grid-4";
import { ProductGridMasonry } from "@/components/templates/product-grid/product-grid-masonry";
import type { ProductGridModule } from "@/lib/modules/product-grid";
import { resolveProductGridTemplateId, type ProductGridTemplateId } from "@/lib/templates/product-grid-catalog";

// PromoBand
import { PromoBandCountdown } from "@/components/templates/promo-band/promo-band-countdown";
import { PromoBandImageOverlay } from "@/components/templates/promo-band/promo-band-image-overlay";
import { PromoBandSolidBg } from "@/components/templates/promo-band/promo-band-solid-bg";
import { PromoBandSplitCta } from "@/components/templates/promo-band/promo-band-split-cta";
import type { PromoBandBuilderModule } from "@/lib/modules/promo-band";
import { resolvePromoBandTemplateId, type PromoBandTemplateId } from "@/lib/templates/promo-band-catalog";

// Testimonials
import { TestimonialsCarousel } from "@/components/templates/testimonials/testimonials-carousel";
import { TestimonialsGrid } from "@/components/templates/testimonials/testimonials-grid";
import { TestimonialsMasonry } from "@/components/templates/testimonials/testimonials-masonry";
import { TestimonialsSingleQuote } from "@/components/templates/testimonials/testimonials-single-quote";
import type { TestimonialsModule } from "@/lib/modules/testimonials";
import { resolveTestimonialsTemplateId, type TestimonialsTemplateId } from "@/lib/templates/testimonials-catalog";

// FAQ
import { FaqAccordion } from "@/components/templates/faq/faq-accordion";
import { FaqCategories } from "@/components/templates/faq/faq-categories";
import { FaqSearch } from "@/components/templates/faq/faq-search";
import { FaqTwoColumn } from "@/components/templates/faq/faq-two-column";
import type { FaqModule } from "@/lib/modules/faq";
import { resolveFaqTemplateId, type FaqTemplateId } from "@/lib/templates/faq-catalog";

// RichText
import { RichTextFullWidthProse } from "@/components/templates/rich-text/rich-text-full-width-prose";
import { RichTextImageLeftTextRight } from "@/components/templates/rich-text/rich-text-image-left-text-right";
import { RichTextImageRightTextLeft } from "@/components/templates/rich-text/rich-text-image-right-text-left";
import { RichTextTwoColumn } from "@/components/templates/rich-text/rich-text-two-column";
import type { RichTextBuilderModule } from "@/lib/modules/rich-text";
import { resolveRichTextTemplateId, type RichTextTemplateId } from "@/lib/templates/rich-text-catalog";

// ProductDetail
import { ProductDetailAccordionDetails } from "@/components/templates/product-detail/product-detail-accordion-details";
import { ProductDetailCardsFeatures } from "@/components/templates/product-detail/product-detail-cards-features";
import { ProductDetailEditorial } from "@/components/templates/product-detail/product-detail-editorial";
import { ProductDetailGallerySpecs } from "@/components/templates/product-detail/product-detail-gallery-specs";
import type { ProductDetailModule } from "@/lib/modules/product-detail";
import { resolveProductDetailTemplateId, type ProductDetailTemplateId } from "@/lib/templates/product-detail-catalog";

// CatalogLayout
import { CatalogLayoutFiltersSidebar } from "@/components/templates/catalog-layout/catalog-layout-filters-sidebar";
import { CatalogLayoutFiltersTop } from "@/components/templates/catalog-layout/catalog-layout-filters-top";
import { CatalogLayoutInfiniteScroll } from "@/components/templates/catalog-layout/catalog-layout-infinite-scroll";
import { CatalogLayoutPaginatedClassic } from "@/components/templates/catalog-layout/catalog-layout-paginated-classic";
import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";
import { resolveCatalogLayoutTemplateId, type CatalogLayoutTemplateId } from "@/lib/templates/catalog-layout-catalog";

// AnnouncementBar
import { AnnouncementBarBadges } from "@/components/templates/announcement-bar/announcement-bar-badges";
import { AnnouncementBarCountdown } from "@/components/templates/announcement-bar/announcement-bar-countdown";
import { AnnouncementBarScroll } from "@/components/templates/announcement-bar/announcement-bar-scroll";
import { AnnouncementBarStatic } from "@/components/templates/announcement-bar/announcement-bar-static";
import type { AnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { resolveAnnouncementBarTemplateId, type AnnouncementBarTemplateId } from "@/lib/templates/announcement-bar-catalog";

// Header
import { HeaderCenteredLogo } from "@/components/templates/header/header-centered-logo";
import { HeaderLeftLogoSearch } from "@/components/templates/header/header-left-logo-search";
import { HeaderMinimal } from "@/components/templates/header/header-minimal";
import { HeaderStickyCompact } from "@/components/templates/header/header-sticky-compact";
import type { HeaderModule } from "@/lib/modules/header";
import { resolveHeaderTemplateId, type HeaderTemplateId } from "@/lib/templates/header-catalog";

// Footer
import { FooterCorporate } from "@/components/templates/footer/footer-corporate";
import { FooterFourColumns } from "@/components/templates/footer/footer-four-columns";
import { FooterMinimal } from "@/components/templates/footer/footer-minimal";
import { FooterWithNewsletter } from "@/components/templates/footer/footer-with-newsletter";
import type { FooterModule } from "@/lib/modules/footer";
import { resolveFooterTemplateId, type FooterTemplateId } from "@/lib/templates/footer-catalog";

/**
 * Template Registry — núcleo del sistema multi-template.
 *
 * Cada tipo de módulo tiene un conjunto de templates posibles.
 * Un template es un componente React que consume exclusivamente
 * la data del módulo (sin conocer el tenant). Gracias a los
 * design tokens (CSS vars), cambia de estética por tenant sin
 * ramificar código.
 *
 * Cómo se agrega un template nuevo:
 *   1. Crear el componente en `components/templates/<moduleType>/`.
 *   2. Registrar su id en `lib/templates/<moduleType>-catalog.ts`.
 *   3. Sumarlo al pool correspondiente de este archivo.
 *
 * El tenant elige qué template usar desde `/ecommerce` del ERP;
 * la selección viaja por el bootstrap v1 (`module.variant`).
 *
 * Para descubrir los ids/descriptores sin cargar los componentes
 * (útil en tests unitarios y en endpoints de metadata), importar
 * desde el catálogo correspondiente.
 */

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export type HeroTemplateComponent = ComponentType<{ module: HeroModule }>;

export const HERO_TEMPLATES: Record<HeroTemplateId, HeroTemplateComponent> = {
  split: HeroSplit,
  workshop: HeroWorkshop,
  editorial: HeroEditorial,
  commerce: HeroCommerce,
};

export function resolveHeroTemplate(templateId: unknown): HeroTemplateComponent {
  return HERO_TEMPLATES[resolveHeroTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// TrustBar
// ---------------------------------------------------------------------------

export type TrustBarTemplateComponent = ComponentType<{ module: TrustBarModule }>;

export const TRUST_BAR_TEMPLATES: Record<TrustBarTemplateId, TrustBarTemplateComponent> = {
  inline: TrustBarInline,
  "stacked-cards": TrustBarStackedCards,
  "rail-dense": TrustBarRailDense,
  "compact-strip": TrustBarCompactStrip,
};

export function resolveTrustBarTemplate(templateId: unknown): TrustBarTemplateComponent {
  return TRUST_BAR_TEMPLATES[resolveTrustBarTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// CategoryTile
// ---------------------------------------------------------------------------

export type CategoryTileTemplateComponent = ComponentType<{ module: CategoryTileModule }>;

export const CATEGORY_TILE_TEMPLATES: Record<CategoryTileTemplateId, CategoryTileTemplateComponent> = {
  "grid-cards": CategoryTileGridCards,
  "rail-horizontal": CategoryTileRailHorizontal,
  masonry: CategoryTileMasonry,
  "compact-list": CategoryTileCompactList,
};

export function resolveCategoryTileTemplate(templateId: unknown): CategoryTileTemplateComponent {
  return CATEGORY_TILE_TEMPLATES[resolveCategoryTileTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// ProductGrid
// ---------------------------------------------------------------------------

export type ProductGridTemplateComponent = ComponentType<{ module: ProductGridModule }>;

export const PRODUCT_GRID_TEMPLATES: Record<ProductGridTemplateId, ProductGridTemplateComponent> = {
  "grid-3": ProductGridGrid3,
  "grid-4": ProductGridGrid4,
  "carousel-arrows": ProductGridCarouselArrows,
  masonry: ProductGridMasonry,
};

export function resolveProductGridTemplate(templateId: unknown): ProductGridTemplateComponent {
  return PRODUCT_GRID_TEMPLATES[resolveProductGridTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// PromoBand
// ---------------------------------------------------------------------------

export type PromoBandTemplateComponent = ComponentType<{ module: PromoBandBuilderModule }>;

export const PROMO_BAND_TEMPLATES: Record<PromoBandTemplateId, PromoBandTemplateComponent> = {
  "split-cta": PromoBandSplitCta,
  "solid-bg": PromoBandSolidBg,
  countdown: PromoBandCountdown,
  "image-overlay": PromoBandImageOverlay,
};

export function resolvePromoBandTemplate(templateId: unknown): PromoBandTemplateComponent {
  return PROMO_BAND_TEMPLATES[resolvePromoBandTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export type TestimonialsTemplateComponent = ComponentType<{ module: TestimonialsModule }>;

export const TESTIMONIALS_TEMPLATES: Record<TestimonialsTemplateId, TestimonialsTemplateComponent> = {
  carousel: TestimonialsCarousel,
  grid: TestimonialsGrid,
  masonry: TestimonialsMasonry,
  "single-quote": TestimonialsSingleQuote,
};

export function resolveTestimonialsTemplate(templateId: unknown): TestimonialsTemplateComponent {
  return TESTIMONIALS_TEMPLATES[resolveTestimonialsTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export type FaqTemplateComponent = ComponentType<{ module: FaqModule }>;

export const FAQ_TEMPLATES: Record<FaqTemplateId, FaqTemplateComponent> = {
  accordion: FaqAccordion,
  categories: FaqCategories,
  search: FaqSearch,
  "two-column": FaqTwoColumn,
};

export function resolveFaqTemplate(templateId: unknown): FaqTemplateComponent {
  return FAQ_TEMPLATES[resolveFaqTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// RichText
// ---------------------------------------------------------------------------

export type RichTextTemplateComponent = ComponentType<{ module: RichTextBuilderModule }>;

export const RICH_TEXT_TEMPLATES: Record<RichTextTemplateId, RichTextTemplateComponent> = {
  "full-width-prose": RichTextFullWidthProse,
  "two-column": RichTextTwoColumn,
  "image-left-text-right": RichTextImageLeftTextRight,
  "image-right-text-left": RichTextImageRightTextLeft,
};

export function resolveRichTextTemplate(templateId: unknown): RichTextTemplateComponent {
  return RICH_TEXT_TEMPLATES[resolveRichTextTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// ProductDetail
// ---------------------------------------------------------------------------

export type ProductDetailTemplateComponent = ComponentType<{ module: ProductDetailModule }>;

export const PRODUCT_DETAIL_TEMPLATES: Record<ProductDetailTemplateId, ProductDetailTemplateComponent> = {
  "gallery-specs": ProductDetailGallerySpecs,
  "cards-features": ProductDetailCardsFeatures,
  "accordion-details": ProductDetailAccordionDetails,
  editorial: ProductDetailEditorial,
};

export function resolveProductDetailTemplate(templateId: unknown): ProductDetailTemplateComponent {
  return PRODUCT_DETAIL_TEMPLATES[resolveProductDetailTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// CatalogLayout
// ---------------------------------------------------------------------------

export type CatalogLayoutTemplateComponent = ComponentType<{ module: CatalogLayoutModule }>;

export const CATALOG_LAYOUT_TEMPLATES: Record<CatalogLayoutTemplateId, CatalogLayoutTemplateComponent> = {
  "filters-sidebar": CatalogLayoutFiltersSidebar,
  "filters-top": CatalogLayoutFiltersTop,
  "infinite-scroll": CatalogLayoutInfiniteScroll,
  "paginated-classic": CatalogLayoutPaginatedClassic,
};

export function resolveCatalogLayoutTemplate(templateId: unknown): CatalogLayoutTemplateComponent {
  return CATALOG_LAYOUT_TEMPLATES[resolveCatalogLayoutTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// AnnouncementBar
// ---------------------------------------------------------------------------

export type AnnouncementBarTemplateComponent = ComponentType<{ module: AnnouncementBarModule }>;

export const ANNOUNCEMENT_BAR_TEMPLATES: Record<AnnouncementBarTemplateId, AnnouncementBarTemplateComponent> = {
  static: AnnouncementBarStatic,
  scroll: AnnouncementBarScroll,
  countdown: AnnouncementBarCountdown,
  badges: AnnouncementBarBadges,
};

export function resolveAnnouncementBarTemplate(templateId: unknown): AnnouncementBarTemplateComponent {
  return ANNOUNCEMENT_BAR_TEMPLATES[resolveAnnouncementBarTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export type HeaderTemplateComponent = ComponentType<{ module: HeaderModule }>;

export const HEADER_TEMPLATES: Record<HeaderTemplateId, HeaderTemplateComponent> = {
  "centered-logo": HeaderCenteredLogo,
  "left-logo-search": HeaderLeftLogoSearch,
  "sticky-compact": HeaderStickyCompact,
  minimal: HeaderMinimal,
};

export function resolveHeaderTemplate(templateId: unknown): HeaderTemplateComponent {
  return HEADER_TEMPLATES[resolveHeaderTemplateId(templateId)];
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export type FooterTemplateComponent = ComponentType<{ module: FooterModule }>;

export const FOOTER_TEMPLATES: Record<FooterTemplateId, FooterTemplateComponent> = {
  "four-columns": FooterFourColumns,
  minimal: FooterMinimal,
  "with-newsletter": FooterWithNewsletter,
  corporate: FooterCorporate,
};

export function resolveFooterTemplate(templateId: unknown): FooterTemplateComponent {
  return FOOTER_TEMPLATES[resolveFooterTemplateId(templateId)];
}
