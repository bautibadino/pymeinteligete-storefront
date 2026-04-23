import type { ComponentType } from "react";

import { CatalogLayoutFiltersSidebar } from "@/components/templates/catalog-layout/catalog-layout-filters-sidebar";
import { CatalogLayoutFiltersTop } from "@/components/templates/catalog-layout/catalog-layout-filters-top";
import { CatalogLayoutInfiniteScroll } from "@/components/templates/catalog-layout/catalog-layout-infinite-scroll";
import { CatalogLayoutPaginatedClassic } from "@/components/templates/catalog-layout/catalog-layout-paginated-classic";
import {
  resolveCatalogLayoutTemplateId,
  type CatalogLayoutTemplateId,
} from "@/lib/templates/catalog-layout-catalog";
import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";

/**
 * Registry de componentes de CatalogLayout — archivo separado del global registry.ts.
 *
 * `catalogLayout` es una sección de página (`pages.catalog.sections[]`).
 * Este archivo es independiente y NO modifica `lib/templates/registry.ts`.
 *
 * Uso esperado:
 *   const CatalogLayout = resolveCatalogLayoutTemplate(module.variant);
 *   <CatalogLayout module={module} />
 */

export interface CatalogLayoutProps {
  module: CatalogLayoutModule;
}

export type CatalogLayoutComponent = ComponentType<CatalogLayoutProps>;

export const CATALOG_LAYOUT_TEMPLATES: Record<CatalogLayoutTemplateId, CatalogLayoutComponent> = {
  "filters-sidebar": CatalogLayoutFiltersSidebar,
  "filters-top": CatalogLayoutFiltersTop,
  "infinite-scroll": CatalogLayoutInfiniteScroll,
  "paginated-classic": CatalogLayoutPaginatedClassic,
};

/**
 * Resuelve el componente de catalog layout a renderizar a partir de un input opaco.
 * Nunca falla: si el templateId no matchea, devuelve el template default (`filters-sidebar`).
 */
export function resolveCatalogLayoutTemplate(templateId: unknown): CatalogLayoutComponent {
  return CATALOG_LAYOUT_TEMPLATES[resolveCatalogLayoutTemplateId(templateId)];
}
