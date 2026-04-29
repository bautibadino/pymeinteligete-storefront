import { describe, expect, it } from "vitest";

import {
  applyPresentationTheme,
  themeTypographySlotClass,
  themeTypographyStyles,
} from "@/lib/theme";

describe("theme typography", () => {
  it("proyecta fontAccent en presentation theme y hereda body cuando falta", () => {
    const withAccent = applyPresentationTheme({
      preset: "minimalClean",
      overrides: {
        fontBody: '"Body Font"',
        fontAccent: '"Accent Font"',
      },
    });
    const inheritedAccent = applyPresentationTheme({
      preset: "minimalClean",
      overrides: {
        fontBody: '"Body Font"',
      },
    });

    expect(withAccent["--font-body"]).toBe('"Body Font"');
    expect(withAccent["--font-accent"]).toBe('"Accent Font"');
    expect(inheritedAccent["--font-accent"]).toBe('"Body Font"');
  });

  it("expone helpers consumibles para slots y estilos semanticos", () => {
    expect(themeTypographySlotClass("accent")).toContain("--font-accent");
    expect(themeTypographyStyles.brand()).toContain("uppercase");
    expect(themeTypographyStyles.cardTitle()).toContain("font-semibold");
  });
});
