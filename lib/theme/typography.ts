import { cn } from "@/lib/utils/cn";

export type ThemeTypographySlot = "heading" | "body" | "accent" | "mono";
export type ThemeTypographySemanticStyle =
  | "eyebrow"
  | "kicker"
  | "label"
  | "brand"
  | "cardTitle";

const SLOT_CLASS_MAP: Record<ThemeTypographySlot, string> = {
  heading: "font-heading",
  body: "font-sans",
  accent: "[font-family:var(--font-accent,var(--font-body))]",
  mono: "font-mono",
};

const SEMANTIC_STYLE_MAP: Record<ThemeTypographySemanticStyle, string> = {
  eyebrow: "font-semibold uppercase tracking-[0.18em]",
  kicker: "font-semibold uppercase tracking-[0.22em]",
  label: "font-semibold uppercase tracking-[0.14em]",
  brand: "font-medium uppercase tracking-[0.2em]",
  cardTitle: "font-semibold tracking-[0.01em]",
};

export function themeTypographySlotClass(slot: ThemeTypographySlot, className?: string): string {
  return cn(SLOT_CLASS_MAP[slot], className);
}

export function themeTypographyClass(
  style: ThemeTypographySemanticStyle,
  className?: string,
): string {
  return themeTypographySlotClass("accent", cn(SEMANTIC_STYLE_MAP[style], className));
}

export const themeTypographyStyles = {
  slot: themeTypographySlotClass,
  eyebrow: (className?: string) => themeTypographyClass("eyebrow", className),
  kicker: (className?: string) => themeTypographyClass("kicker", className),
  label: (className?: string) => themeTypographyClass("label", className),
  brand: (className?: string) => themeTypographyClass("brand", className),
  cardTitle: (className?: string) => themeTypographyClass("cardTitle", className),
} as const;
