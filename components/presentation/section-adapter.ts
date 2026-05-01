import { normalizeAnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { normalizeCatalogLayoutContent } from "@/lib/modules/catalog-layout";
import { normalizeProductGridContent } from "@/lib/modules/product-grid";
import type { SectionInstance } from "@/lib/types/presentation";
import {
  mapCategoriesToTiles,
  mapCatalogProductsToCardData,
  mapProductDetailToData,
  mapPaymentMethodsToTrustItems,
  resolveStoreName,
  selectRelatedProductsForDetail,
  selectProductsForGrid,
  type PresentationRenderContext,
} from "@/components/presentation/render-context";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * Adapta una SectionInstance del contrato presentation al shape de módulo
 * que espera cada componente de template.
 */
function readArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function resolveHeaderLinks(context?: PresentationRenderContext) {
  const links = context?.bootstrap?.navigation?.headerLinks;

  if (links && links.length > 0) {
    return links;
  }

  return [
    { label: "Inicio", href: "/" },
    { label: "Catálogo", href: "/catalogo" },
  ];
}

function resolveFooterColumns(context?: PresentationRenderContext) {
  const columns = context?.bootstrap?.navigation?.footerColumns;

  if (columns && columns.length > 0) {
    return columns;
  }

  return [
    {
      title: "Tienda",
      links: [
        { label: "Inicio", href: "/" },
        { label: "Catálogo", href: "/catalogo" },
      ],
    },
  ];
}

export function adaptSectionToModule(
  section: SectionInstance,
  context?: PresentationRenderContext,
): unknown {
  const content = isRecord(section.content) ? section.content : {};
  const base = {
    id: section.id,
    type: section.type,
    variant: section.variant,
  };

  switch (section.type) {
    case "hero": {
      const imageUrl = readString(content.imageUrl) ?? "";
      const imageAlt = readString(content.imageAlt) ?? "Imagen principal";
      const storeName = resolveStoreName(context);

      return {
        ...base,
        ...content,
        title: readString(content.title) ?? storeName,
        description:
          content.description ??
          content.subtitle ??
          context?.bootstrap?.seo?.defaultDescription ??
          "Explorá el catálogo online y encontrá productos disponibles para comprar.",
        image: imageUrl ? { src: imageUrl, alt: imageAlt } : undefined,
        primaryAction: content.primaryAction ?? content.primaryCta,
        secondaryAction: content.secondaryAction ?? content.secondaryCta,
        searchPlaceholder:
          readString(content.searchPlaceholder) ?? "Buscar productos...",
      };
    }

    case "productGrid": {
      const normalizedContent = normalizeProductGridContent(content);
      const products = selectProductsForGrid(
        context?.products,
        normalizedContent.source,
        normalizedContent.limit ?? 12,
        context?.bootstrap,
      );

      return { ...base, content: normalizedContent, products };
    }

    case "catalogLayout": {
      const normalizedContent = normalizeCatalogLayoutContent(content);
      const products = mapCatalogProductsToCardData(
        context?.products,
        normalizedContent.perPage ?? 12,
        context?.bootstrap,
      );

      return { ...base, content: normalizedContent, products, categories: context?.categories };
    }

    case "categoryTile": {
      const configuredTiles = readArray(content.tiles);
      const tiles = configuredTiles && configuredTiles.length > 0
        ? content.tiles
        : mapCategoriesToTiles(context?.categories);

      return {
        ...base,
        ...content,
        title: readString(content.title) ?? "Categorías",
        tiles,
      };
    }

    case "trustBar": {
      const configuredItems = readArray(content.items);
      const items = configuredItems && configuredItems.length > 0
        ? content.items
        : mapPaymentMethodsToTrustItems(context?.paymentMethods);

      return { ...base, content: { ...content, items } };
    }

    case "promoBand":
    case "richText":
      return { ...base, content };

    case "productDetail": {
      const relatedLimit =
        typeof content.relatedLimit === "number" && Number.isFinite(content.relatedLimit)
          ? content.relatedLimit
          : 4;

      return {
        ...base,
        content,
        product: mapProductDetailToData(context?.product, context?.bootstrap),
        relatedProducts: selectRelatedProductsForDetail(
          context?.product,
          context?.products,
          content.relatedSource as "category" | "brand" | "collection" | undefined,
          relatedLimit,
          context?.bootstrap,
        ),
      };
    }

    case "header":
      return {
        ...base,
        ...content,
        logoUrl: context?.bootstrap?.branding?.logoUrl,
        logoHref: "/",
        logoAlt: readString(content.logoAlt) ?? resolveStoreName(context),
        navLinks: readArray(content.navLinks) ?? resolveHeaderLinks(context),
        showSearch: typeof content.showSearch === "boolean" ? content.showSearch : true,
        searchPlaceholder: readString(content.searchPlaceholder) ?? "Buscar productos...",
        showCart: typeof content.showCart === "boolean" ? content.showCart : true,
      };

    case "footer": {
      const storeName = resolveStoreName(context);

      return {
        ...base,
        enabled: section.enabled,
        order: section.order,
        content: {
          ...content,
          logoUrl: context?.bootstrap?.branding?.logoUrl,
          tagline:
            readString(content.tagline) ??
            context?.bootstrap?.seo?.defaultDescription ??
            storeName,
          columns: readArray(content.columns) ?? resolveFooterColumns(context),
          contact: content.contact ?? context?.bootstrap?.contact,
          copyright:
            readString(content.copyright) ??
            `${new Date().getFullYear()} ${storeName}.`,
        },
      };
    }

    case "announcementBar":
      return normalizeAnnouncementBarModule(section as SectionInstance<"announcementBar">);

    default:
      return { ...base, ...content };
  }
}
