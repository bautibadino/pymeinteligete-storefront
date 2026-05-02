import type { StorefrontBootstrap } from "@/lib/storefront-api";

export type ThemePreset = "industrialWarm" | "minimalClean" | "editorialDark" | "tyreshop";

export type TenantTheme = {
  preset: ThemePreset;
  name: string;
  colors: {
    background: string;
    paper: string;
    panel: string;
    panelStrong: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    primaryContrast: string;
    primarySoft: string;
    accent: string;
    accentSoft: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    draft: string;
    draftSoft: string;
    danger: string;
    dangerSoft: string;
  };
  controls: {
    surfaceMuted: string;
    surfaceRaised: string;
    surfaceOverlay: string;
    focusRing: string;
  };
  typography: {
    heading: string;
    body: string;
    accent: string;
    mono: string;
  };
  radii: {
    medium: string;
    large: string;
    xlarge: string;
    pill: string;
  };
  shadow: string;
  contentWidth: string;
};

type ThemeConfig = {
  preset?: ThemePreset;
  name?: string;
  colors?: Partial<TenantTheme["colors"]>;
  controls?: Partial<TenantTheme["controls"]>;
  typography?: Partial<TenantTheme["typography"]>;
  radii?: Partial<TenantTheme["radii"]>;
  shadow?: string;
  contentWidth?: string;
};

type BrandingThemeConfig = Pick<ThemeConfig, "colors" | "typography">;

const THEME_COLOR_KEYS = [
  "background",
  "paper",
  "panel",
  "panelStrong",
  "text",
  "muted",
  "border",
  "primary",
  "primaryContrast",
  "primarySoft",
  "accent",
  "accentSoft",
  "success",
  "successSoft",
  "warning",
  "warningSoft",
  "draft",
  "draftSoft",
  "danger",
  "dangerSoft",
] as const satisfies readonly (keyof TenantTheme["colors"])[];

const THEME_TYPOGRAPHY_KEYS = [
  "heading",
  "body",
  "accent",
  "mono",
] as const satisfies readonly (keyof TenantTheme["typography"])[];

const THEME_RADIUS_KEYS = [
  "medium",
  "large",
  "xlarge",
  "pill",
] as const satisfies readonly (keyof TenantTheme["radii"])[];

const THEME_CONTROL_KEYS = [
  "surfaceMuted",
  "surfaceRaised",
  "surfaceOverlay",
  "focusRing",
] as const satisfies readonly (keyof TenantTheme["controls"])[];

const PRESENTATION_COLOR_TOKEN_MAP = {
  bg: "background",
  background: "background",
  paper: "paper",
  panel: "panel",
  panelStrong: "panelStrong",
  ink: "text",
  text: "text",
  muted: "muted",
  line: "border",
  border: "border",
  accent: "primary",
  primary: "primary",
  actionContrast: "primaryContrast",
  primaryContrast: "primaryContrast",
  accentSoft: "primarySoft",
  primarySoft: "primarySoft",
  moduleAccent: "accent",
  moduleAccentSoft: "accentSoft",
  success: "success",
  accentLive: "success",
  successSoft: "successSoft",
  accentLiveSoft: "successSoft",
  warning: "warning",
  accentPaused: "warning",
  warningSoft: "warningSoft",
  accentPausedSoft: "warningSoft",
  draft: "draft",
  accentDraft: "draft",
  draftSoft: "draftSoft",
  accentDraftSoft: "draftSoft",
  danger: "danger",
  accentDisabled: "danger",
  dangerSoft: "dangerSoft",
  accentDisabledSoft: "dangerSoft",
} as const satisfies Record<string, keyof TenantTheme["colors"]>;

const PRESENTATION_TYPOGRAPHY_TOKEN_MAP = {
  fontHeading: "heading",
  heading: "heading",
  fontBody: "body",
  body: "body",
  fontAccent: "accent",
  fontMono: "mono",
  mono: "mono",
} as const satisfies Record<string, keyof TenantTheme["typography"]>;

const PRESENTATION_RADIUS_TOKEN_MAP = {
  radiusMd: "medium",
  medium: "medium",
  radiusLg: "large",
  large: "large",
  radiusXl: "xlarge",
  xlarge: "xlarge",
  radiusPill: "pill",
  pill: "pill",
} as const satisfies Record<string, keyof TenantTheme["radii"]>;

const PRESENTATION_CONTROL_TOKEN_MAP = {
  surfaceMuted: "surfaceMuted",
  surfaceRaised: "surfaceRaised",
  surfaceOverlay: "surfaceOverlay",
  focusRing: "focusRing",
} as const satisfies Record<string, keyof TenantTheme["controls"]>;

export const THEME_PRESETS: Record<ThemePreset, TenantTheme> = {
  industrialWarm: {
    preset: "industrialWarm",
    name: "Industrial warm",
    colors: {
      background: "#f4efe7",
      paper: "rgba(255, 250, 242, 0.9)",
      panel: "rgba(255, 252, 247, 0.95)",
      panelStrong: "#fffaf2",
      text: "#1f1a17",
      muted: "#6f6259",
      border: "rgba(58, 42, 29, 0.14)",
      primary: "#8c4319",
      primaryContrast: "#fffaf2",
      primarySoft: "rgba(140, 67, 25, 0.13)",
      accent: "#1f5967",
      accentSoft: "rgba(31, 89, 103, 0.12)",
      success: "#235f53",
      successSoft: "rgba(35, 95, 83, 0.12)",
      warning: "#a7651d",
      warningSoft: "rgba(167, 101, 29, 0.14)",
      draft: "#5f5a8f",
      draftSoft: "rgba(95, 90, 143, 0.14)",
      danger: "#7d2c2c",
      dangerSoft: "rgba(125, 44, 44, 0.12)",
    },
    controls: {
      surfaceMuted: "rgba(255, 250, 242, 0.72)",
      surfaceRaised: "rgba(255, 252, 247, 0.96)",
      surfaceOverlay: "rgba(255, 250, 242, 0.84)",
      focusRing: "rgba(140, 67, 25, 0.18)",
    },
    typography: {
      heading: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif',
      body: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
      accent: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
      mono: '"SFMono-Regular", "SF Mono", "Roboto Mono", monospace',
    },
    radii: {
      medium: "18px",
      large: "24px",
      xlarge: "34px",
      pill: "999px",
    },
    shadow: "0 26px 80px rgba(57, 36, 18, 0.09)",
    contentWidth: "1180px",
  },
  minimalClean: {
    preset: "minimalClean",
    name: "Minimal clean",
    colors: {
      background: "#f7f8f6",
      paper: "rgba(255, 255, 255, 0.94)",
      panel: "#ffffff",
      panelStrong: "#fdfdfb",
      text: "#171a17",
      muted: "#5d655e",
      border: "rgba(23, 26, 23, 0.11)",
      primary: "#243f36",
      primaryContrast: "#f7f8f6",
      primarySoft: "rgba(36, 63, 54, 0.1)",
      accent: "#b25b2f",
      accentSoft: "rgba(178, 91, 47, 0.12)",
      success: "#28614f",
      successSoft: "rgba(40, 97, 79, 0.12)",
      warning: "#946318",
      warningSoft: "rgba(148, 99, 24, 0.13)",
      draft: "#535b83",
      draftSoft: "rgba(83, 91, 131, 0.13)",
      danger: "#8a302e",
      dangerSoft: "rgba(138, 48, 46, 0.1)",
    },
    controls: {
      surfaceMuted: "rgba(247, 248, 246, 0.78)",
      surfaceRaised: "rgba(255, 255, 255, 0.98)",
      surfaceOverlay: "rgba(255, 255, 255, 0.86)",
      focusRing: "rgba(36, 63, 54, 0.16)",
    },
    typography: {
      heading: '"Optima", "Avenir Next", "Segoe UI", sans-serif',
      body: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
      accent: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
      mono: '"SFMono-Regular", "SF Mono", "Roboto Mono", monospace',
    },
    radii: {
      medium: "12px",
      large: "16px",
      xlarge: "22px",
      pill: "999px",
    },
    shadow: "0 20px 70px rgba(22, 35, 28, 0.08)",
    contentWidth: "1160px",
  },
  editorialDark: {
    preset: "editorialDark",
    name: "Editorial dark",
    colors: {
      background: "#11100f",
      paper: "rgba(22, 21, 20, 0.94)",
      panel: "rgba(29, 28, 26, 0.96)",
      panelStrong: "#24221f",
      text: "#f8f1e7",
      muted: "#b6aaa0",
      border: "rgba(248, 241, 231, 0.14)",
      primary: "#d89a52",
      primaryContrast: "#16110d",
      primarySoft: "rgba(216, 154, 82, 0.17)",
      accent: "#7bc4b2",
      accentSoft: "rgba(123, 196, 178, 0.13)",
      success: "#7bc4b2",
      successSoft: "rgba(123, 196, 178, 0.13)",
      warning: "#e6b15b",
      warningSoft: "rgba(230, 177, 91, 0.15)",
      draft: "#aaa2ff",
      draftSoft: "rgba(170, 162, 255, 0.14)",
      danger: "#f08a7e",
      dangerSoft: "rgba(240, 138, 126, 0.13)",
    },
    controls: {
      surfaceMuted: "rgba(36, 34, 31, 0.78)",
      surfaceRaised: "rgba(29, 28, 26, 0.98)",
      surfaceOverlay: "rgba(18, 17, 16, 0.86)",
      focusRing: "rgba(216, 154, 82, 0.22)",
    },
    typography: {
      heading: '"Didot", "Bodoni 72", "Iowan Old Style", serif',
      body: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
      accent: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
      mono: '"SFMono-Regular", "SF Mono", "Roboto Mono", monospace',
    },
    radii: {
      medium: "10px",
      large: "14px",
      xlarge: "20px",
      pill: "999px",
    },
    shadow: "0 30px 90px rgba(0, 0, 0, 0.28)",
    contentWidth: "1220px",
  },
  tyreshop: {
    preset: "tyreshop",
    name: "Tyreshop BYM",
    colors: {
      background: "#f7f7f4",
      paper: "rgba(255, 255, 255, 0.96)",
      panel: "#ffffff",
      panelStrong: "#fffdf2",
      text: "#000000",
      muted: "#4d4d4d",
      border: "rgba(0, 0, 0, 0.12)",
      primary: "#ffde01",
      primaryContrast: "#000000",
      primarySoft: "rgba(255, 222, 1, 0.22)",
      accent: "#34495e",
      accentSoft: "rgba(52, 73, 94, 0.14)",
      success: "#1f7a4d",
      successSoft: "rgba(31, 122, 77, 0.14)",
      warning: "#c27b00",
      warningSoft: "rgba(194, 123, 0, 0.16)",
      draft: "#5f6f85",
      draftSoft: "rgba(95, 111, 133, 0.14)",
      danger: "#9b2f2f",
      dangerSoft: "rgba(155, 47, 47, 0.12)",
    },
    controls: {
      surfaceMuted: "rgba(255, 255, 255, 0.72)",
      surfaceRaised: "rgba(255, 255, 255, 0.98)",
      surfaceOverlay: "rgba(255, 255, 255, 0.88)",
      focusRing: "rgba(255, 222, 1, 0.34)",
    },
    typography: {
      heading: '"Avenir Next Condensed", "Arial Narrow", "Avenir Next", sans-serif',
      body: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
      accent: '"Avenir Next Condensed", "Arial Narrow", "Avenir Next", sans-serif',
      mono: '"SFMono-Regular", "SF Mono", "Roboto Mono", monospace',
    },
    radii: {
      medium: "12px",
      large: "18px",
      xlarge: "28px",
      pill: "999px",
    },
    shadow: "0 18px 48px rgba(0, 0, 0, 0.08)",
    contentWidth: "1200px",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isThemePreset(value: unknown): value is ThemePreset {
  return value === "industrialWarm" || value === "minimalClean" || value === "editorialDark" || value === "tyreshop";
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function pickStringOverrides<TKeys extends readonly string[]>(
  value: unknown,
  keys: TKeys,
): Partial<Record<TKeys[number], string>> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const result: Partial<Record<TKeys[number], string>> = {};

  for (const key of keys) {
    const override = readString(value[key]);

    if (override) {
      result[key as TKeys[number]] = override;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function pickPresentationThemeOverrides(value: unknown): ThemeConfig {
  if (!isRecord(value)) {
    return {};
  }

  const colors: Partial<TenantTheme["colors"]> = {};
  const controls: Partial<TenantTheme["controls"]> = {};
  const typography: Partial<TenantTheme["typography"]> = {};
  const radii: Partial<TenantTheme["radii"]> = {};
  const shadow = readString(value.shadow);
  const contentWidth = readString(value.contentWidth);

  for (const [token, themeKey] of Object.entries(PRESENTATION_COLOR_TOKEN_MAP)) {
    const override = readString(value[token]);

    if (override) {
      colors[themeKey] = override;
    }
  }

  for (const [token, themeKey] of Object.entries(PRESENTATION_TYPOGRAPHY_TOKEN_MAP)) {
    const override = readString(value[token]);

    if (override) {
      typography[themeKey] = override;
    }
  }

  for (const [token, themeKey] of Object.entries(PRESENTATION_RADIUS_TOKEN_MAP)) {
    const override = readString(value[token]);

    if (override) {
      radii[themeKey] = override;
    }
  }

  for (const [token, themeKey] of Object.entries(PRESENTATION_CONTROL_TOKEN_MAP)) {
    const override = readString(value[token]);

    if (override) {
      controls[themeKey] = override;
    }
  }

  return {
    ...(Object.keys(colors).length > 0 ? { colors } : {}),
    ...(Object.keys(controls).length > 0 ? { controls } : {}),
    ...(Object.keys(typography).length > 0 ? { typography } : {}),
    ...(Object.keys(radii).length > 0 ? { radii } : {}),
    ...(shadow ? { shadow } : {}),
    ...(contentWidth ? { contentWidth } : {}),
  };
}

function mergeThemeConfigs(...configs: ThemeConfig[]): ThemeConfig {
  return configs.reduce<ThemeConfig>(
    (merged, config) => ({
      ...merged,
      ...config,
      colors: {
        ...merged.colors,
        ...config.colors,
      },
      controls: {
        ...merged.controls,
        ...config.controls,
      },
      typography: {
        ...merged.typography,
        ...config.typography,
      },
      radii: {
        ...merged.radii,
        ...config.radii,
      },
    }),
    {},
  );
}

function readPaletteThemeConfig(value: unknown): ThemeConfig {
  if (!isRecord(value)) {
    return {};
  }

  const palette = isRecord(value.palette) ? value.palette : undefined;
  if (!palette) {
    return {};
  }

  const primary = isRecord(palette.primary) ? palette.primary : undefined;
  const secondary = isRecord(palette.secondary) ? palette.secondary : undefined;
  const surface = isRecord(palette.surface) ? palette.surface : undefined;
  const state = isRecord(palette.state) ? palette.state : undefined;
  const focus = isRecord(palette.focus) ? palette.focus : undefined;

  const colors: Partial<TenantTheme["colors"]> = {};
  const controls: Partial<TenantTheme["controls"]> = {};

  const assignColor = (key: keyof TenantTheme["colors"], token: unknown) => {
    const value = readString(token);
    if (value) {
      colors[key] = value;
    }
  };

  const assignControl = (key: keyof TenantTheme["controls"], token: unknown) => {
    const value = readString(token);
    if (value) {
      controls[key] = value;
    }
  };

  assignColor("primary", primary?.solid);
  assignColor("primarySoft", primary?.soft);
  assignColor("primaryContrast", primary?.contrast);
  assignColor("accent", secondary?.solid);
  assignColor("accentSoft", secondary?.soft);

  assignColor("background", surface?.background);
  assignColor("paper", surface?.paper);
  assignColor("panel", surface?.panel);
  assignColor("panelStrong", surface?.panelStrong);
  assignColor("border", surface?.line);
  assignControl("surfaceMuted", surface?.muted);
  assignControl("surfaceRaised", surface?.raised);
  assignControl("surfaceOverlay", surface?.overlay);

  const live = isRecord(state?.live) ? state.live : undefined;
  const paused = isRecord(state?.paused) ? state.paused : undefined;
  const draft = isRecord(state?.draft) ? state.draft : undefined;
  const disabled = isRecord(state?.disabled) ? state.disabled : undefined;

  assignColor("success", live?.solid);
  assignColor("successSoft", live?.soft);
  assignColor("warning", paused?.solid);
  assignColor("warningSoft", paused?.soft);
  assignColor("draft", draft?.solid);
  assignColor("draftSoft", draft?.soft);
  assignColor("danger", disabled?.solid);
  assignColor("dangerSoft", disabled?.soft);
  assignControl("focusRing", focus?.ring);

  return {
    ...(Object.keys(colors).length > 0 ? { colors } : {}),
    ...(Object.keys(controls).length > 0 ? { controls } : {}),
  };
}

function readThemeConfig(value: unknown): ThemeConfig {
  if (isThemePreset(value)) {
    return { preset: value };
  }

  if (!isRecord(value)) {
    return {};
  }

  const preset = isThemePreset(value.preset) ? value.preset : undefined;
  const name = readString(value.name);
  const shadow = readString(value.shadow);
  const contentWidth = readString(value.contentWidth);
  const colors = pickStringOverrides(value.colors, THEME_COLOR_KEYS);
  const controls = pickStringOverrides(value.controls, THEME_CONTROL_KEYS);
  const typography = pickStringOverrides(value.typography, THEME_TYPOGRAPHY_KEYS);
  const radii = pickStringOverrides(value.radii, THEME_RADIUS_KEYS);
  const legacyConfig: ThemeConfig = {
    ...(preset ? { preset } : {}),
    ...(name ? { name } : {}),
    ...(colors ? { colors } : {}),
    ...(controls ? { controls } : {}),
    ...(typography ? { typography } : {}),
    ...(radii ? { radii } : {}),
    ...(shadow ? { shadow } : {}),
    ...(contentWidth ? { contentWidth } : {}),
  };

  return mergeThemeConfigs(
    legacyConfig,
    readPaletteThemeConfig(value),
    pickPresentationThemeOverrides(value.overrides),
  );
}

function readBrandingThemeConfig(bootstrap: StorefrontBootstrap | null): BrandingThemeConfig {
  const primary = readString(bootstrap?.branding?.colors?.primary);
  const accent = readString(bootstrap?.branding?.colors?.accent);
  const heading = readString(bootstrap?.branding?.typography?.heading);
  const body = readString(bootstrap?.branding?.typography?.body);
  const accentTypography = readString(bootstrap?.branding?.typography?.accent);

  return {
    ...((primary || accent)
      ? {
          colors: {
            ...(primary ? { primary } : {}),
            ...(accent ? { accent } : {}),
          },
        }
      : {}),
    ...((heading || body || accentTypography)
      ? {
          typography: {
            ...(heading ? { heading } : {}),
            ...(body ? { body } : {}),
            ...(accentTypography ? { accent: accentTypography } : {}),
          },
        }
      : {}),
  };
}

function mergeThemeConfig(base: TenantTheme, config: ThemeConfig): TenantTheme {
  const typography = {
    ...base.typography,
    ...config.typography,
  };

  if (!config.typography?.accent && config.typography?.body) {
    typography.accent = config.typography.body;
  }

  return {
    ...base,
    name: config.name ?? base.name,
    colors: {
      ...base.colors,
      ...config.colors,
    },
    controls: {
      ...base.controls,
      ...config.controls,
    },
    typography,
    radii: {
      ...base.radii,
      ...config.radii,
    },
    shadow: config.shadow ?? base.shadow,
    contentWidth: config.contentWidth ?? base.contentWidth,
  };
}

export function resolveEffectiveTenantTheme(bootstrap: StorefrontBootstrap | null): TenantTheme {
  const presentationConfig = readThemeConfig(bootstrap?.presentation?.theme);
  const hasPresentationTheme =
    bootstrap?.presentation?.theme !== undefined && bootstrap.presentation.theme !== null;
  const legacyConfig = readThemeConfig(bootstrap?.theme);
  const brandingConfig = readBrandingThemeConfig(bootstrap);
  const config = hasPresentationTheme
    ? presentationConfig
    : mergeThemeConfigs(legacyConfig, brandingConfig);
  const preset = config.preset ?? "industrialWarm";
  const base = THEME_PRESETS[preset];

  return mergeThemeConfig(base, config);
}

export function resolveTenantTheme(bootstrap: StorefrontBootstrap | null): TenantTheme {
  return resolveEffectiveTenantTheme(bootstrap);
}
