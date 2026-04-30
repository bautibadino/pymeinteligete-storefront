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
  it("normaliza la apariencia del variant static y degrada rotatingMessages legacy a mensaje plano", () => {
    const module = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "static",
        content: {
          rotatingMessages: ["6 cuotas", "envío 24 hs"],
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
    expect(module.message).toBe("6 cuotas");
    expect("rotatingMessages" in module).toBe(false);
    expect(module.appearance?.surface).toBe("gradient");
  });

  it("normaliza la nueva variante rotating", () => {
    const module = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "rotating",
        content: {
          messages: ["Promo 1", "Promo 2"],
          speed: "fast",
          motion: { rotationIntervalMs: 2400 },
        },
      }),
    );

    if (module.variant !== "rotating") {
      throw new Error("Se esperaba variant rotating");
    }

    expect(module.messages).toEqual(["Promo 1", "Promo 2"]);
    expect(module.speed).toBe("fast");
    expect(module.motion?.rotationIntervalMs).toBe(2400);
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

  it("acepta mensajes legacy como object-list en scroll, static y rotating", () => {
    const scrollModule = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "scroll",
        content: {
          messages: [{ text: "Promo 1" }, { text: "Promo 2" }],
        },
      }),
    );

    const staticModule = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "static",
        content: {
          rotatingMessages: [{ text: "6 cuotas" }, { text: "envío 24 hs" }],
        },
      }),
    );

    const rotatingModule = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "rotating",
        content: {
          messages: [{ text: "Promo 1" }, { text: "Promo 2" }],
        },
      }),
    );

    if (
      scrollModule.variant !== "scroll" ||
      staticModule.variant !== "static" ||
      rotatingModule.variant !== "rotating"
    ) {
      throw new Error("Se esperaba normalización estable para variantes scroll, static y rotating");
    }

    expect(scrollModule.messages).toEqual(["Promo 1", "Promo 2"]);
    expect(staticModule.message).toEqual("6 cuotas");
    expect(rotatingModule.messages).toEqual(["Promo 1", "Promo 2"]);
  });

  it("acepta microcopy adicional en badges aunque el layout final sea plano", () => {
    const module = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "badges",
        content: {
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
    expect(module.items[0]).toEqual({
      icon: "shield",
      label: "Garantía oficial",
      description: "marcas homologadas",
    });
  });

  it("acepta badges legacy con title/subtitle y default icon", () => {
    const module = normalizeAnnouncementBarModule(
      buildAnnouncementSection({
        variant: "badges",
        content: {
          items: [
            {
              title: "Compra protegida",
              subtitle: "soporte postventa",
            },
          ],
        },
      }),
    );

    if (module.variant !== "badges") {
      throw new Error("Se esperaba variant badges");
    }

    expect(module.items[0]).toEqual({
      icon: "badge-check",
      label: "Compra protegida",
      description: "soporte postventa",
    });
  });
});
