import type { StorefrontBootstrap } from "@/lib/storefront-api";

export type ThemePreset = "industrialWarm" | "minimalClean" | "editorialDark";

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
  typography: {
    heading: string;
    body: string;
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
  typography?: Partial<TenantTheme["typography"]>;
  radii?: Partial<TenantTheme["radii"]>;
  shadow?: string;
  contentWidth?: string;
};

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
  "mono",
] as const satisfies readonly (keyof TenantTheme["typography"])[];

const THEME_RADIUS_KEYS = [
  "medium",
  "large",
  "xlarge",
  "pill",
] as const satisfies readonly (keyof TenantTheme["radii"])[];

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
    typography: {
      heading: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif',
      body: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
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
    typography: {
      heading: '"Optima", "Avenir Next", "Segoe UI", sans-serif',
      body: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
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
    typography: {
      heading: '"Didot", "Bodoni 72", "Iowan Old Style", serif',
      body: '"Avenir Next", "Segoe UI Variable", "Helvetica Neue", sans-serif',
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
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isThemePreset(value: unknown): value is ThemePreset {
  return value === "industrialWarm" || value === "minimalClean" || value === "editorialDark";
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
  const typography = pickStringOverrides(value.typography, THEME_TYPOGRAPHY_KEYS);
  const radii = pickStringOverrides(value.radii, THEME_RADIUS_KEYS);

  return {
    ...(preset ? { preset } : {}),
    ...(name ? { name } : {}),
    ...(colors ? { colors } : {}),
    ...(typography ? { typography } : {}),
    ...(radii ? { radii } : {}),
    ...(shadow ? { shadow } : {}),
    ...(contentWidth ? { contentWidth } : {}),
  };
}

export function resolveTenantTheme(bootstrap: StorefrontBootstrap | null): TenantTheme {
  const config = readThemeConfig(bootstrap?.theme?.preset);
  const preset = config.preset ?? "industrialWarm";
  const base = THEME_PRESETS[preset];

  return {
    ...base,
    name: config.name ?? base.name,
    colors: {
      ...base.colors,
      ...config.colors,
    },
    typography: {
      ...base.typography,
      ...config.typography,
    },
    radii: {
      ...base.radii,
      ...config.radii,
    },
    shadow: config.shadow ?? base.shadow,
    contentWidth: config.contentWidth ?? base.contentWidth,
  };
}
