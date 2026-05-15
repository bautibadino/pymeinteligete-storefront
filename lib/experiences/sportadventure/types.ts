export type SportAdventureAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

export type SportAdventureBrand = {
  id: string;
  name: string;
  eyebrow: string;
  tagline: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
  contrast: string;
  families: string[];
  placeholderLabel: string;
  alignment?: "left" | "right";
  group?: "Performance / Racing" | "Adventure / Touring" | "Off-road / Campo / Utility" | "Urban / Lifestyle" | "Eléctricas / Movilidad";
  uses?: string[];
  featured?: boolean;
};

export type SportAdventurePalette = {
  base: string;
  panel: string;
  panelAlt: string;
  text: string;
  muted: string;
  line: string;
  orange: string;
  lime: string;
  red: string;
  white: string;
};

export type SportAdventureHomeContent = {
  brand: string;
  logoUrl?: string | undefined;
  introEyebrow: string;
  introTitle: string;
  introHint: string;
  introActions: SportAdventureAction[];
  brandSections: SportAdventureBrand[];
};

export type SportAdventureNavContext = {
  host: string;
  tenantSlug?: string | null;
};

export type SportAdventureHomeProps = {
  content: SportAdventureHomeContent;
  palette?: Partial<SportAdventurePalette>;
  className?: string;
  navigationContext?: SportAdventureNavContext | undefined;
  products?: import("@/lib/storefront-api").StorefrontCatalogProduct[] | null | undefined;
  categories?: import("@/lib/storefront-api").StorefrontCategory[] | null | undefined;
};
