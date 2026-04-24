import type { ComponentType } from "react";

import type {
  Presentation,
  SectionInstance,
  SectionType,
} from "@/lib/types/presentation";
import { getEnabledSortedSections, type PresentationPageKey } from "@/lib/presentation/render-utils";

// Registry resolvers
import {
  resolveHeroTemplate,
  resolveTrustBarTemplate,
  resolveCategoryTileTemplate,
  resolveProductGridTemplate,
  resolvePromoBandTemplate,
  resolveTestimonialsTemplate,
  resolveFaqTemplate,
  resolveRichTextTemplate,
  resolveProductDetailTemplate,
  resolveCatalogLayoutTemplate,
  resolveAnnouncementBarTemplate,
  resolveHeaderTemplate,
  resolveFooterTemplate,
} from "@/lib/templates/registry";

type PresentationRendererProps = {
  presentation: Presentation;
  page: PresentationPageKey;
};

/**
 * Adapta una SectionInstance del contrato presentation al shape de módulo
 * que espera cada componente de template.
 *
 * Algunos tipos usan `content` anidado; otros reciben los campos planos.
 */
function adaptSectionToModule(section: SectionInstance): unknown {
  const base = {
    id: section.id,
    type: section.type,
    variant: section.variant,
  };

  switch (section.type) {
    case "productGrid":
    case "trustBar":
    case "promoBand":
    case "richText":
    case "footer":
    case "catalogLayout":
    case "productDetail":
      return { ...base, content: section.content };

    case "announcementBar":
      return {
        ...base,
        enabled: section.enabled,
        order: section.order,
        ...section.content,
      };

    default:
      return { ...base, ...section.content };
  }
}

const SECTION_RESOLVERS: Record<
  Exclude<SectionType, "productCard">,
  (variant: string) => ComponentType<{ module: unknown }>
> = {
  hero: resolveHeroTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  trustBar: resolveTrustBarTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  categoryTile: resolveCategoryTileTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  productGrid: resolveProductGridTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  promoBand: resolvePromoBandTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  testimonials: resolveTestimonialsTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  faq: resolveFaqTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  richText: resolveRichTextTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  productDetail: resolveProductDetailTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  catalogLayout: resolveCatalogLayoutTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  announcementBar: resolveAnnouncementBarTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  header: resolveHeaderTemplate as (variant: string) => ComponentType<{ module: unknown }>,
  footer: resolveFooterTemplate as (variant: string) => ComponentType<{ module: unknown }>,
};

function SectionRenderer({ section }: { section: SectionInstance }) {
  if (section.type === "productCard") {
    return null;
  }

  const resolveTemplate = SECTION_RESOLVERS[section.type];
  if (!resolveTemplate) {
    return null;
  }

  const Component = resolveTemplate(section.variant);
  const moduleData = adaptSectionToModule(section);

  return <Component module={moduleData} />;
}

function GlobalHeader({ presentation }: { presentation: Presentation }) {
  const header = presentation.globals.header;
  if (!header || !header.enabled) return null;

  const Component = resolveHeaderTemplate(header.variant);
  const moduleData = adaptSectionToModule(header);

  return <Component module={moduleData} />;
}

function GlobalAnnouncementBar({ presentation }: { presentation: Presentation }) {
  const bar = presentation.globals.announcementBar;
  if (!bar || !bar.enabled) return null;

  const Component = resolveAnnouncementBarTemplate(bar.variant);
  const moduleData = adaptSectionToModule(bar);

  return <Component module={moduleData} />;
}

function GlobalFooter({ presentation }: { presentation: Presentation }) {
  const footer = presentation.globals.footer;
  if (!footer || !footer.enabled) return null;

  const Component = resolveFooterTemplate(footer.variant);
  const moduleData = adaptSectionToModule(footer);

  return <Component module={moduleData} />;
}

/**
 * Renderiza una página completa a partir del objeto `presentation`.
 *
 * - Muestra globals (announcementBar, header, footer) si están habilitados.
 * - Renderiza las secciones de la página solicitada ordenadas y filtradas.
 * - Omite secciones de tipo `productCard` (dependencia visual, no autónoma).
 */
export function PresentationRenderer({ presentation, page }: PresentationRendererProps) {
  const pageConfig = presentation.pages[page];
  const sections = getEnabledSortedSections(pageConfig.sections);

  return (
    <div data-presentation-renderer="true" data-page={page}>
      <GlobalAnnouncementBar presentation={presentation} />
      <GlobalHeader presentation={presentation} />

      <main>
        {sections.map((section) => (
          <div key={section.id} data-section-id={section.id} data-section-type={section.type}>
            <SectionRenderer section={section} />
          </div>
        ))}
      </main>

      <GlobalFooter presentation={presentation} />
    </div>
  );
}
