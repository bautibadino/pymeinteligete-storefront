import { normalizeAnnouncementBarModule } from "@/lib/modules/announcement-bar";
import { normalizeCatalogLayoutContent } from "@/lib/modules/catalog-layout";
import { normalizeProductGridContent } from "@/lib/modules/product-grid";
import { normalizeSocialProofContent } from "@/lib/modules/social-proof";
import { getStorefrontInstallmentsLabel } from "@/lib/commerce/installments";
import type {
  PresentationResolvedMediaMetadata,
  SectionInstance,
} from "@/lib/types/presentation";
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

function readFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * Adapta una SectionInstance del contrato presentation al shape de módulo
 * que espera cada componente de template.
 */
function readArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function readResolvedMediaMetadata(value: unknown): PresentationResolvedMediaMetadata | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const url = readString(value.url);
  const alt = readString(value.alt);
  const width = readFiniteNumber(value.width);
  const height = readFiniteNumber(value.height);
  const mimeType = readString(value.mimeType);

  if (
    url === undefined &&
    alt === undefined &&
    width === undefined &&
    height === undefined &&
    mimeType === undefined
  ) {
    return undefined;
  }

  return {
    ...(url ? { url } : {}),
    ...(alt ? { alt } : {}),
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(mimeType ? { mimeType } : {}),
  };
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

function adaptHeaderSection(
  section: SectionInstance<"header">,
  content: Record<string, unknown>,
  context?: PresentationRenderContext,
) {
  const showSearchByDefault = section.variant !== "minimal";
  const logoMetadata = readResolvedMediaMetadata(
    isRecord(context?.bootstrap?.branding) ? context.bootstrap.branding.logo : undefined,
  );

  return {
    id: section.id,
    type: section.type,
    variant: section.variant,
    ...content,
    logoUrl: context?.bootstrap?.branding?.logoUrl,
    logoMetadata,
    logoHref: "/",
    logoAlt: readString(content.logoAlt) ?? resolveStoreName(context),
    navLinks: readArray(content.navLinks) ?? resolveHeaderLinks(context),
    showSearch:
      typeof content.showSearch === "boolean" ? content.showSearch : showSearchByDefault,
    searchPlaceholder: readString(content.searchPlaceholder) ?? "Buscar productos...",
    showCart: typeof content.showCart === "boolean" ? content.showCart : true,
    // El storefront público no expone cuenta/login todavía.
    showAccount: false,
    topBarLinks: readArray(content.topBarLinks) ?? [],
  };
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
      const imageMetadata = readResolvedMediaMetadata(content.image);
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
        imageMetadata,
        primaryAction: content.primaryAction ?? content.primaryCta,
        secondaryAction: content.secondaryAction ?? content.secondaryCta,
        searchPlaceholder:
          readString(content.searchPlaceholder) ?? "Buscar productos...",
      };
    }

    case "socialProof": {
      const normalizedContent = normalizeSocialProofContent(content);

      return {
        ...base,
        content: normalizedContent,
        empresaId: context?.bootstrap?.tenant.empresaId,
        tenantSlug: context?.bootstrap?.tenant.tenantSlug,
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
      const carouselMeta = context?.bootstrap
        ? {
            empresaId: context.bootstrap.tenant.empresaId,
            tenantSlug: context.bootstrap.tenant.tenantSlug,
            installmentsLabel: getStorefrontInstallmentsLabel(context.bootstrap),
          }
        : undefined;

      return { ...base, content: normalizedContent, products, ...(carouselMeta ? { carouselMeta } : {}) };
    }

    case "catalogLayout": {
      const normalizedContent = normalizeCatalogLayoutContent(content);
      const products = mapCatalogProductsToCardData(
        context?.products,
        normalizedContent.perPage ?? 12,
        context?.bootstrap,
      );

      return {
        ...base,
        content: normalizedContent,
        products,
        categories: context?.categories,
      };
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
      return adaptHeaderSection(section as SectionInstance<"header">, content, context);

    case "footer": {
      const storeName = resolveStoreName(context);
      const logoMetadata = readResolvedMediaMetadata(
        isRecord(context?.bootstrap?.branding) ? context.bootstrap.branding.logo : undefined,
      );

      return {
        ...base,
        enabled: section.enabled,
        order: section.order,
        content: {
          ...content,
          logoUrl: context?.bootstrap?.branding?.logoUrl,
          logoMetadata,
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
