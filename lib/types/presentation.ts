export type PresentationVersion = 1;

export type ThemePreset = "industrialWarm" | "minimalClean" | "editorialDark";

export interface ThemePaletteTone {
  solid?: string;
  soft?: string;
  contrast?: string;
}

export interface ThemePaletteSurfaces {
  background?: string;
  paper?: string;
  panel?: string;
  panelStrong?: string;
  muted?: string;
  raised?: string;
  overlay?: string;
  line?: string;
}

export interface ThemePaletteStates {
  live?: ThemePaletteTone;
  paused?: ThemePaletteTone;
  draft?: ThemePaletteTone;
  disabled?: ThemePaletteTone;
}

export interface ThemePaletteConfig {
  primary?: ThemePaletteTone;
  secondary?: ThemePaletteTone;
  surface?: ThemePaletteSurfaces;
  state?: ThemePaletteStates;
  focus?: {
    ring?: string;
  };
}

export interface ThemeTokens {
  bg: string;
  paper: string;
  panel: string;
  panelStrong: string;
  surfaceMuted: string;
  surfaceRaised: string;
  surfaceOverlay: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentSoft: string;
  accentContrast: string;
  focusRing: string;
  moduleAccent: string;
  moduleAccentSoft: string;
  accentLive: string;
  accentLiveSoft: string;
  accentPaused: string;
  accentPausedSoft: string;
  accentDraft: string;
  accentDraftSoft: string;
  accentDisabled: string;
  accentDisabledSoft: string;
  radiusXl: string;
  radiusLg: string;
  radiusMd: string;
  radiusPill: string;
  fontHeading: string;
  fontBody: string;
  fontAccent: string;
  fontMono: string;
  shadow: string;
  contentWidth: string;
}

export interface ThemeConfig {
  preset: ThemePreset;
  palette?: ThemePaletteConfig;
  overrides?: Partial<ThemeTokens>;
}

export type SectionType =
  | "announcementBar"
  | "header"
  | "footer"
  | "hero"
  | "trustBar"
  | "categoryTile"
  | "productGrid"
  | "productCard"
  | "promoBand"
  | "testimonials"
  | "faq"
  | "richText"
  | "productDetail"
  | "catalogLayout";

export type CatalogDensity = "compact" | "comfortable";

export interface SectionInstance<T extends SectionType = SectionType> {
  id: string;
  type: T;
  variant: string;
  enabled: boolean;
  order: number;
  content: Record<string, unknown>;
  lockedBy?: "system" | "tenant-override";
}

export interface GlobalBlocks {
  announcementBar: SectionInstance<"announcementBar">;
  header: SectionInstance<"header">;
  footer: SectionInstance<"footer">;
}

export interface PageConfig {
  seo?: {
    title?: string;
    description?: string;
    ogImageUrl?: string;
  };
  sections: SectionInstance[];
}

export interface Presentation {
  version: PresentationVersion;
  updatedAt: string;
  updatedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
  theme: ThemeConfig;
  globals: GlobalBlocks;
  pages: {
    home: PageConfig;
    catalog: PageConfig;
    product: PageConfig;
  };
}
