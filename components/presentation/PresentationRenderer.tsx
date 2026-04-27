import type { ComponentType } from "react";

import type {
  Presentation,
  SectionInstance,
  SectionType,
} from "@/lib/types/presentation";
import { getEnabledSortedSections, type PresentationPageKey } from "@/lib/presentation/render-utils";
import { adaptSectionToModule } from "@/components/presentation/section-adapter";
import type { PresentationRenderContext } from "@/components/presentation/render-context";

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
  includeGlobals?: boolean;
  context?: PresentationRenderContext | undefined;
};

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

function SectionRenderer({
  section,
  context,
}: {
  section: SectionInstance;
  context?: PresentationRenderContext | undefined;
}) {
  if (section.type === "productCard") {
    return null;
  }

  const resolveTemplate = SECTION_RESOLVERS[section.type];
  if (!resolveTemplate) {
    return null;
  }

  const Component = resolveTemplate(section.variant);
  const moduleData = adaptSectionToModule(section, context);

  return <Component module={moduleData} />;
}

export function PresentationGlobalHeader({
  presentation,
  context,
}: {
  presentation: Presentation;
  context?: PresentationRenderContext | undefined;
}) {
  const header = presentation.globals.header;
  if (!header || !header.enabled) return null;

  const Component = resolveHeaderTemplate(header.variant);
  const moduleData = adaptSectionToModule(header, context);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Component module={moduleData as any} />;
}

export function PresentationGlobalAnnouncementBar({
  presentation,
  context,
}: {
  presentation: Presentation;
  context?: PresentationRenderContext | undefined;
}) {
  const bar = presentation.globals.announcementBar;
  if (!bar || !bar.enabled) return null;

  const Component = resolveAnnouncementBarTemplate(bar.variant);
  const moduleData = adaptSectionToModule(bar, context);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Component module={moduleData as any} />;
}

export function PresentationGlobalFooter({
  presentation,
  context,
}: {
  presentation: Presentation;
  context?: PresentationRenderContext | undefined;
}) {
  const footer = presentation.globals.footer;
  if (!footer || !footer.enabled) return null;

  const Component = resolveFooterTemplate(footer.variant);
  const moduleData = adaptSectionToModule(footer, context);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Component module={moduleData as any} />;
}

/**
 * Renderiza una página completa a partir del objeto `presentation`.
 *
 * - Muestra globals (announcementBar, header, footer) si están habilitados.
 * - Renderiza las secciones de la página solicitada ordenadas y filtradas.
 * - Omite secciones de tipo `productCard` (dependencia visual, no autónoma).
 */
export function PresentationRenderer({
  presentation,
  page,
  includeGlobals = true,
  context,
}: PresentationRendererProps) {
  const pageConfig = presentation.pages[page];
  const sections = getEnabledSortedSections(pageConfig.sections);

  return (
    <div data-presentation-renderer="true" data-page={page}>
      {includeGlobals ? (
        <PresentationGlobalAnnouncementBar presentation={presentation} context={context} />
      ) : null}
      {includeGlobals ? <PresentationGlobalHeader presentation={presentation} context={context} /> : null}

      <main>
        {sections.map((section) => (
          <div key={section.id} data-section-id={section.id} data-section-type={section.type}>
            <SectionRenderer section={section} context={context} />
          </div>
        ))}
      </main>

      {includeGlobals ? <PresentationGlobalFooter presentation={presentation} context={context} /> : null}
    </div>
  );
}
