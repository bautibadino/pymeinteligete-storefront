import { describe, expect, it } from "vitest";

import { ANNOUNCEMENT_BAR_TEMPLATE_IDS } from "@/lib/templates/announcement-bar-catalog";
import { CATALOG_LAYOUT_TEMPLATE_IDS } from "@/lib/templates/catalog-layout-catalog";
import { CATEGORY_TILE_TEMPLATE_IDS } from "@/lib/templates/category-tile-catalog";
import { FAQ_TEMPLATE_IDS } from "@/lib/templates/faq-catalog";
import { FOOTER_TEMPLATE_IDS } from "@/lib/templates/footer-catalog";
import { HEADER_TEMPLATE_IDS } from "@/lib/templates/header-catalog";
import { HERO_TEMPLATE_IDS } from "@/lib/templates/hero-catalog";
import { PRODUCT_CARD_TEMPLATE_IDS } from "@/lib/templates/product-card-catalog";
import { PRODUCT_DETAIL_TEMPLATE_IDS } from "@/lib/templates/product-detail-catalog";
import { PRODUCT_GRID_TEMPLATE_IDS } from "@/lib/templates/product-grid-catalog";
import { PROMO_BAND_TEMPLATE_IDS } from "@/lib/templates/promo-band-catalog";
import { RICH_TEXT_TEMPLATE_IDS } from "@/lib/templates/rich-text-catalog";
import { TESTIMONIALS_TEMPLATE_IDS } from "@/lib/templates/testimonials-catalog";
import { TRUST_BAR_TEMPLATE_IDS } from "@/lib/templates/trust-bar-catalog";

const ERP_CATALOG_DESCRIPTOR_IDS = {
  announcementBar: ["static", "scroll", "badges", "countdown"],
  header: ["centered-logo", "left-logo-search", "sticky-compact", "minimal"],
  footer: ["four-columns", "minimal", "with-newsletter", "corporate"],
  hero: ["split", "workshop", "editorial", "commerce"],
  trustBar: ["inline", "stacked-cards", "rail-dense", "compact-strip"],
  categoryTile: ["grid-cards", "rail-horizontal", "masonry", "compact-list"],
  productGrid: ["carousel-arrows", "grid-3", "grid-4", "masonry"],
  productCard: ["classic", "compact", "editorial", "premium-commerce"],
  promoBand: ["split-cta", "solid-bg", "countdown", "image-overlay"],
  testimonials: ["carousel", "grid", "masonry", "single-quote"],
  faq: ["accordion", "two-column", "search", "categories"],
  richText: ["full-width-prose", "two-column", "image-left-text-right", "image-right-text-left"],
  productDetail: ["gallery-specs", "cards-features", "accordion-details", "editorial"],
  catalogLayout: ["filters-sidebar", "filters-top", "infinite-scroll", "paginated-classic"],
} as const;

const STOREFRONT_TEMPLATE_IDS = {
  announcementBar: ANNOUNCEMENT_BAR_TEMPLATE_IDS,
  header: HEADER_TEMPLATE_IDS,
  footer: FOOTER_TEMPLATE_IDS,
  hero: HERO_TEMPLATE_IDS,
  trustBar: TRUST_BAR_TEMPLATE_IDS,
  categoryTile: CATEGORY_TILE_TEMPLATE_IDS,
  productGrid: PRODUCT_GRID_TEMPLATE_IDS,
  productCard: PRODUCT_CARD_TEMPLATE_IDS,
  promoBand: PROMO_BAND_TEMPLATE_IDS,
  testimonials: TESTIMONIALS_TEMPLATE_IDS,
  faq: FAQ_TEMPLATE_IDS,
  richText: RICH_TEXT_TEMPLATE_IDS,
  productDetail: PRODUCT_DETAIL_TEMPLATE_IDS,
  catalogLayout: CATALOG_LAYOUT_TEMPLATE_IDS,
} satisfies Record<keyof typeof ERP_CATALOG_DESCRIPTOR_IDS, readonly string[]>;

function sorted(values: readonly string[]): string[] {
  return [...values].sort();
}

describe("ERP catalog-descriptors.json ids", () => {
  it("corresponden a IDs reales del storefront", () => {
    for (const type of Object.keys(ERP_CATALOG_DESCRIPTOR_IDS) as Array<
      keyof typeof ERP_CATALOG_DESCRIPTOR_IDS
    >) {
      expect(sorted(STOREFRONT_TEMPLATE_IDS[type]), type).toEqual(
        sorted(ERP_CATALOG_DESCRIPTOR_IDS[type]),
      );
    }
  });
});
