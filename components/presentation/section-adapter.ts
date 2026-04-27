import { normalizeCatalogLayoutContent } from "@/lib/modules/catalog-layout";
import { normalizeProductGridContent } from "@/lib/modules/product-grid";
import type { SectionInstance } from "@/lib/types/presentation";

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
export function adaptSectionToModule(section: SectionInstance): unknown {
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

      return {
        ...base,
        ...content,
        description: content.description ?? content.subtitle,
        image: imageUrl ? { src: imageUrl, alt: imageAlt } : undefined,
        primaryAction: content.primaryAction ?? content.primaryCta,
        secondaryAction: content.secondaryAction ?? content.secondaryCta,
      };
    }

    case "productGrid":
      return { ...base, content: normalizeProductGridContent(content) };

    case "catalogLayout":
      return { ...base, content: normalizeCatalogLayoutContent(content) };

    case "trustBar":
    case "promoBand":
    case "richText":
    case "footer":
    case "productDetail":
      return { ...base, content };

    case "announcementBar":
      return {
        ...base,
        enabled: section.enabled,
        order: section.order,
        ...content,
      };

    default:
      return { ...base, ...content };
  }
}
