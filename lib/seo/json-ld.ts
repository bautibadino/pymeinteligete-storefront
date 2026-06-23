import type { StorefrontBootstrap } from "@/lib/types/storefront";
import type { ProductCardData } from "@/lib/templates/product-card-catalog";

// ─────────────────────────────────────────────────────────────
// Product + Offer
// ─────────────────────────────────────────────────────────────

export function buildProductJsonLd(
  card: ProductCardData,
  canonicalUrl: string,
  tenantName: string,
): Record<string, unknown> {
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: canonicalUrl,
    priceCurrency: card.price.currency,
    price: card.price.amount,
    availability:
      card.stock?.available === false
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: tenantName },
  };

  if (card.compareAtPrice) {
    offer.priceSpecification = [
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/ListPrice",
        price: card.compareAtPrice.amount,
        priceCurrency: card.price.currency,
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: card.price.amount,
        priceCurrency: card.price.currency,
      },
    ];
  }

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: card.name,
    url: canonicalUrl,
    offers: offer,
  };

  if (card.imageUrl) jsonLd.image = card.imageUrl;
  if (card.brand) jsonLd.brand = { "@type": "Brand", name: card.brand };
  if (card.id) jsonLd.sku = card.id;

  return jsonLd;
}

// ─────────────────────────────────────────────────────────────
// LocalBusiness
// ─────────────────────────────────────────────────────────────

function resolveLocalBusinessUrl(bootstrap: StorefrontBootstrap, fallbackHost: string): string {
  const raw =
    (bootstrap.tenant.canonicalUrl as string | undefined) ??
    (bootstrap.tenant.canonicalHost as string | undefined) ??
    fallbackHost;

  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw}`;
}

export function buildLocalBusinessJsonLd(
  bootstrap: StorefrontBootstrap,
  fallbackHost: string,
): Record<string, unknown> {
  const url = resolveLocalBusinessUrl(bootstrap, fallbackHost);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: bootstrap.branding.storeName,
    url,
  };

  if (bootstrap.branding.logoUrl) jsonLd.logo = bootstrap.branding.logoUrl;
  if (bootstrap.contact?.phone) jsonLd.telephone = bootstrap.contact.phone;
  if (bootstrap.contact?.email) jsonLd.email = bootstrap.contact.email;
  if (bootstrap.contact?.address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: bootstrap.contact.address,
    };
  }

  return jsonLd;
}

// ─────────────────────────────────────────────────────────────
// BreadcrumbList
// ─────────────────────────────────────────────────────────────

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// ItemList (para páginas de categoría)
// ─────────────────────────────────────────────────────────────

type ProductListItem = {
  slug: string;
  name: string;
};

export function buildItemListJsonLd(
  products: ProductListItem[],
  canonicalBase: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products
      .filter((p) => p.slug && p.name)
      .slice(0, 12)
      .map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${canonicalBase}/producto/${encodeURIComponent(product.slug)}`,
        name: product.name,
      })),
  };
}
