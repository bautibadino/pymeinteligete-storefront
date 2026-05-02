import type { ThemeConfig, ThemeTokens } from "@/lib/types/presentation";
import {
  THEME_PRESETS,
  type ThemePreset,
  type TenantTheme,
} from "@/lib/theme/resolve-tenant-theme";

type CssVarName = `--${string}`;

const VAR_MAP: Record<keyof ThemeTokens, CssVarName> = {
  bg: "--bg",
  paper: "--paper",
  panel: "--panel",
  panelStrong: "--panel-strong",
  surfaceMuted: "--surface-muted",
  surfaceRaised: "--surface-raised",
  surfaceOverlay: "--surface-overlay",
  ink: "--ink",
  muted: "--muted",
  line: "--line",
  accent: "--accent",
  accentSoft: "--accent-soft",
  accentContrast: "--action-contrast",
  focusRing: "--focus-ring",
  moduleAccent: "--module-accent",
  moduleAccentSoft: "--module-accent-soft",
  accentLive: "--accent-live",
  accentLiveSoft: "--accent-live-soft",
  accentPaused: "--accent-paused",
  accentPausedSoft: "--accent-paused-soft",
  accentDraft: "--accent-draft",
  accentDraftSoft: "--accent-draft-soft",
  accentDisabled: "--accent-disabled",
  accentDisabledSoft: "--accent-disabled-soft",
  radiusXl: "--radius-xl",
  radiusLg: "--radius-lg",
  radiusMd: "--radius-md",
  radiusPill: "--radius-pill",
  fontHeading: "--font-heading",
  fontBody: "--font-body",
  fontAccent: "--font-accent",
  fontMono: "--font-mono",
  shadow: "--shadow",
  contentWidth: "--content-width",
};

function resolvePresetValue(preset: TenantTheme, token: keyof ThemeTokens): string | undefined {
  switch (token) {
    case "bg":
      return preset.colors.background;
    case "paper":
      return preset.colors.paper;
    case "panel":
      return preset.colors.panel;
    case "panelStrong":
      return preset.colors.panelStrong;
    case "surfaceMuted":
      return preset.controls.surfaceMuted;
    case "surfaceRaised":
      return preset.controls.surfaceRaised;
    case "surfaceOverlay":
      return preset.controls.surfaceOverlay;
    case "ink":
      return preset.colors.text;
    case "muted":
      return preset.colors.muted;
    case "line":
      return preset.colors.border;
    case "accent":
      return preset.colors.primary;
    case "accentSoft":
      return preset.colors.primarySoft;
    case "accentContrast":
      return preset.colors.primaryContrast;
    case "focusRing":
      return preset.controls.focusRing;
    case "moduleAccent":
      return preset.colors.accent;
    case "moduleAccentSoft":
      return preset.colors.accentSoft;
    case "accentLive":
      return preset.colors.success;
    case "accentLiveSoft":
      return preset.colors.successSoft;
    case "accentPaused":
      return preset.colors.warning;
    case "accentPausedSoft":
      return preset.colors.warningSoft;
    case "accentDraft":
      return preset.colors.draft;
    case "accentDraftSoft":
      return preset.colors.draftSoft;
    case "accentDisabled":
      return preset.colors.danger;
    case "accentDisabledSoft":
      return preset.colors.dangerSoft;
    case "radiusXl":
      return preset.radii.xlarge;
    case "radiusLg":
      return preset.radii.large;
    case "radiusMd":
      return preset.radii.medium;
    case "radiusPill":
      return preset.radii.pill;
    case "fontHeading":
      return preset.typography.heading;
    case "fontBody":
      return preset.typography.body;
    case "fontAccent":
      return preset.typography.accent;
    case "fontMono":
      return preset.typography.mono;
    case "shadow":
      return preset.shadow;
    case "contentWidth":
      return preset.contentWidth;
    default:
      return undefined;
  }
}

/**
 * Convierte un `ThemeConfig` de presentation en un objeto de estilos inline
 * (CSS vars) listo para inyectar en `<html style={...}>`.
 *
 * Ejemplo de uso:
 *   <html style={applyPresentationTheme(presentation.theme)}>
 */
export function applyPresentationTheme(themeConfig: ThemeConfig): Record<string, string> {
  const presetKey = (themeConfig.preset as ThemePreset) ?? "industrialWarm";
  const preset = THEME_PRESETS[presetKey] ?? THEME_PRESETS.industrialWarm;

  const style: Record<string, string> = {};

  for (const token of Object.keys(VAR_MAP) as Array<keyof ThemeTokens>) {
    const value = resolvePresetValue(preset, token);
    if (value) {
      style[VAR_MAP[token]] = value;
    }
  }

  if (themeConfig.overrides) {
    const hasAccentOverride =
      typeof themeConfig.overrides.fontAccent === "string" && themeConfig.overrides.fontAccent.trim();
    const bodyOverride =
      typeof themeConfig.overrides.fontBody === "string" ? themeConfig.overrides.fontBody.trim() : "";

    for (const [token, value] of Object.entries(themeConfig.overrides)) {
      if (typeof value === "string" && value.trim()) {
        const varName = VAR_MAP[token as keyof ThemeTokens];
        if (varName) {
          style[varName] = value.trim();
        }
      }
    }

    if (!hasAccentOverride && bodyOverride) {
      style["--font-accent"] = bodyOverride;
    }
  }

  return style;
}
