import type { CSSProperties } from "react";

import type { TenantTheme } from "@/lib/theme/resolve-tenant-theme";

export type TenantThemeCssVars = CSSProperties & Record<`--${string}`, string>;

export function themeToCssVars(theme: TenantTheme): TenantThemeCssVars {
  return {
    "--bg": theme.colors.background,
    "--paper": theme.colors.paper,
    "--panel": theme.colors.panel,
    "--panel-strong": theme.colors.panelStrong,
    "--surface-muted": theme.controls.surfaceMuted,
    "--surface-raised": theme.controls.surfaceRaised,
    "--surface-overlay": theme.controls.surfaceOverlay,
    "--ink": theme.colors.text,
    "--muted": theme.colors.muted,
    "--line": theme.colors.border,
    "--accent": theme.colors.primary,
    "--accent-soft": theme.colors.primarySoft,
    "--focus-ring": theme.controls.focusRing,
    "--module-accent": theme.colors.accent,
    "--module-accent-soft": theme.colors.accentSoft,
    "--accent-live": theme.colors.success,
    "--accent-live-soft": theme.colors.successSoft,
    "--accent-paused": theme.colors.warning,
    "--accent-paused-soft": theme.colors.warningSoft,
    "--accent-draft": theme.colors.draft,
    "--accent-draft-soft": theme.colors.draftSoft,
    "--accent-disabled": theme.colors.danger,
    "--accent-disabled-soft": theme.colors.dangerSoft,
    "--action-contrast": theme.colors.primaryContrast,
    "--font-heading": theme.typography.heading,
    "--font-body": theme.typography.body,
    "--font-accent": theme.typography.accent,
    "--font-mono": theme.typography.mono,
    "--radius-md": theme.radii.medium,
    "--radius-lg": theme.radii.large,
    "--radius-xl": theme.radii.xlarge,
    "--radius-pill": theme.radii.pill,
    "--shadow": theme.shadow,
    "--content-width": theme.contentWidth,
  };
}
