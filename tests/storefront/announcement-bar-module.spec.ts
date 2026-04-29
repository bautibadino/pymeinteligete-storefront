import { describe, expect, it } from "vitest";

import { normalizeAnnouncementBarModule } from "@/lib/modules/announcement-bar";
import type { SectionInstance } from "@/lib/types/presentation";

function buildAnnouncementSection(
  overrides: Partial<SectionInstance<"announcementBar">> = {},
): SectionInstance<"announcementBar"> {
  return {
    id: "announcement-1",
    type: "announcementBar",
    variant: "static",
    enabled: true,
    order: 0,
    content: {},
    ...overrides,
  };
}

describe("normalizeAnnouncementBarModule", () => {
  it("normaliza la apariencia y la rotación del variant static", () => {
    const module = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "static",
        content: {
          message: "Promo vigente",
          rotatingMessages: ["6 cuotas", "envío 24 hs"],
          motion: { rotationIntervalMs: 2800 },
          appearance: {
            gradientFrom: "#111827",
            gradientTo: "#1d4ed8",
            textColor: "#f8fafc",
          },
        },
      }),
    );

    if (module.variant !== "static") {
      throw new Error("Se esperaba variant static");
    }

    expect(module.variant).toBe("static");
    expect(module.rotatingMessages).toEqual(["6 cuotas", "envío 24 hs"]);
    expect(module.motion?.rotationIntervalMs).toBe(2800);
    expect(module.appearance?.surface).toBe("gradient");
  });

  it("normaliza hover y separator para scroll", () => {
    const module = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "scroll",
        content: {
          messages: ["Promo 1", "Promo 2"],
          separator: "·",
        },
      }),
    );

    if (module.variant !== "scroll") {
      throw new Error("Se esperaba variant scroll");
    }

    expect(module.variant).toBe("scroll");
    expect(module.pauseOnHover).toBe(true);
    expect(module.separator).toBe("·");
  });

  it("acepta microcopy adicional en badges", () => {
    const module = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "badges",
        content: {
          heading: "Compra protegida",
          items: [
            {
              icon: "shield",
              label: "Garantía oficial",
              description: "marcas homologadas",
            },
          ],
        },
      }),
    );

    if (module.variant !== "badges") {
      throw new Error("Se esperaba variant badges");
    }

    expect(module.variant).toBe("badges");
    expect(module.heading).toBe("Compra protegida");
    expect(module.items[0]).toEqual({
      icon: "shield",
      label: "Garantía oficial",
      description: "marcas homologadas",
    });
  });
});
