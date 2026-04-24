import type { PageConfig, Presentation, SectionInstance } from "@/lib/types/presentation";

export type PresentationPageKey = "home" | "catalog" | "product";

/**
 * Determina si una página debe renderizarse usando presentation en lugar
 * del sistema legacy de módulos.
 */
export function shouldUsePresentation(
  presentation: Presentation | undefined,
  pageKey: PresentationPageKey,
): boolean {
  if (!presentation) return false;
  const page = presentation.pages[pageKey];
  return page.sections.length > 0;
}

/**
 * Filtra secciones habilitadas y las ordena por el campo `order`.
 */
export function getEnabledSortedSections(sections: SectionInstance[]): SectionInstance[] {
  return sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
}
