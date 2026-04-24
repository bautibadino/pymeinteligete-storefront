/**
 * CategoryTileModule — tipo del módulo de tiles de categoría.
 *
 * Este módulo pertenece al sistema builder (Ola 2). No requiere
 * integrarse con el union StorefrontModule legacy; vive en su propio
 * archivo para que los catálogos y componentes lo importen directamente.
 *
 * El componente receptor siempre recibe `{ module: CategoryTileModule }`,
 * sin props de contexto de tenant ni de entorno.
 */

export type CategoryTileTemplateId =
  | "grid-cards"
  | "rail-horizontal"
  | "masonry"
  | "compact-list";

export type CategoryTileItem = {
  label: string;
  href: string;
  imageUrl?: string;
  /** Nombre de ícono Lucide (string). Se usa cuando no hay imageUrl. */
  icon?: string;
};

export type CategoryTileModule = {
  id: string;
  type: "categoryTile";
  variant: CategoryTileTemplateId;
  title?: string;
  subtitle?: string;
  tiles: CategoryTileItem[];
};
