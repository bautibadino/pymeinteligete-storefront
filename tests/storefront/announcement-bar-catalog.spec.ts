import { describe, expect, it } from "vitest";

import {
  ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS,
  ANNOUNCEMENT_BAR_TEMPLATE_IDS,
  DEFAULT_ANNOUNCEMENT_BAR_TEMPLATE_ID,
  defaultAnnouncementBarContent,
  isAnnouncementBarTemplateId,
  resolveAnnouncementBarTemplateId,
} from "@/lib/templates/announcement-bar-catalog";

describe("Announcement bar catalog — template IDs", () => {
  it("expone exactamente 4 variantes en el orden correcto", () => {
    expect(ANNOUNCEMENT_BAR_TEMPLATE_IDS).toEqual(["static", "scroll", "countdown", "badges"]);
  });

  it("el default es 'static'", () => {
    expect(DEFAULT_ANNOUNCEMENT_BAR_TEMPLATE_ID).toBe("static");
  });
});

describe("Announcement bar catalog — descriptores", () => {
  it("cada variante tiene label, description y bestFor no vacíos", () => {
    for (const id of ANNOUNCEMENT_BAR_TEMPLATE_IDS) {
      const descriptor = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS[id];
      expect(descriptor, `descriptor faltante para "${id}"`).toBeDefined();
      expect(descriptor.label.length).toBeGreaterThan(0);
      expect(descriptor.description.length).toBeGreaterThan(0);
      expect(descriptor.bestFor.length).toBeGreaterThan(0);
    }
  });

  it("cada variante tiene thumbnailUrl con ruta al directorio de thumbnails", () => {
    for (const id of ANNOUNCEMENT_BAR_TEMPLATE_IDS) {
      const { thumbnailUrl } = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS[id];
      expect(thumbnailUrl).toMatch(/^\/template-thumbnails\//);
      expect(thumbnailUrl).toContain(`announcement-bar-${id}`);
    }
  });

  it("cada variante expone un contentSchema Zod válido", () => {
    for (const id of ANNOUNCEMENT_BAR_TEMPLATE_IDS) {
      const { contentSchema } = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS[id];
      expect(contentSchema).toBeDefined();
      expect(typeof contentSchema.parse).toBe("function");
      expect(typeof contentSchema.safeParse).toBe("function");
    }
  });
});

describe("isAnnouncementBarTemplateId", () => {
  it("devuelve true para cada variante válida", () => {
    for (const id of ANNOUNCEMENT_BAR_TEMPLATE_IDS) {
      expect(isAnnouncementBarTemplateId(id)).toBe(true);
    }
  });

  it("devuelve false para valores inválidos", () => {
    expect(isAnnouncementBarTemplateId("no-existe")).toBe(false);
    expect(isAnnouncementBarTemplateId("")).toBe(false);
    expect(isAnnouncementBarTemplateId(undefined)).toBe(false);
    expect(isAnnouncementBarTemplateId(null)).toBe(false);
    expect(isAnnouncementBarTemplateId(42)).toBe(false);
    expect(isAnnouncementBarTemplateId({})).toBe(false);
  });
});

describe("resolveAnnouncementBarTemplateId", () => {
  it("devuelve el mismo id para inputs válidos", () => {
    expect(resolveAnnouncementBarTemplateId("static")).toBe("static");
    expect(resolveAnnouncementBarTemplateId("scroll")).toBe("scroll");
    expect(resolveAnnouncementBarTemplateId("countdown")).toBe("countdown");
    expect(resolveAnnouncementBarTemplateId("badges")).toBe("badges");
  });

  it("degrada al default para inputs inválidos o indefinidos", () => {
    expect(resolveAnnouncementBarTemplateId("xxx")).toBe(DEFAULT_ANNOUNCEMENT_BAR_TEMPLATE_ID);
    expect(resolveAnnouncementBarTemplateId(undefined)).toBe(DEFAULT_ANNOUNCEMENT_BAR_TEMPLATE_ID);
    expect(resolveAnnouncementBarTemplateId(null)).toBe(DEFAULT_ANNOUNCEMENT_BAR_TEMPLATE_ID);
    expect(resolveAnnouncementBarTemplateId(0)).toBe(DEFAULT_ANNOUNCEMENT_BAR_TEMPLATE_ID);
  });

  it("nunca devuelve undefined", () => {
    const cases = [undefined, null, "", "nope", 42, {}, []];
    for (const input of cases) {
      const result = resolveAnnouncementBarTemplateId(input);
      expect(result).toBeDefined();
      expect(isAnnouncementBarTemplateId(result)).toBe(true);
    }
  });
});

describe("defaultAnnouncementBarContent", () => {
  it("devuelve contenido con variant 'static' para static", () => {
    const content = defaultAnnouncementBarContent("static");
    expect(content.variant).toBe("static");
    expect(typeof content.message).toBe("string");
    expect(content.message.length).toBeGreaterThan(0);
  });

  it("devuelve contenido con al menos un mensaje para scroll", () => {
    const content = defaultAnnouncementBarContent("scroll");
    expect(content.variant).toBe("scroll");
    expect(Array.isArray(content.messages)).toBe(true);
    expect(content.messages.length).toBeGreaterThan(0);
  });

  it("devuelve contenido con message y endsAt para countdown", () => {
    const content = defaultAnnouncementBarContent("countdown");
    expect(content.variant).toBe("countdown");
    expect(typeof content.message).toBe("string");
    expect(typeof content.endsAt).toBe("string");
    expect(new Date(content.endsAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("devuelve contenido con al menos un badge para badges", () => {
    const content = defaultAnnouncementBarContent("badges");
    expect(content.variant).toBe("badges");
    expect(Array.isArray(content.items)).toBe(true);
    expect(content.items.length).toBeGreaterThan(0);
    for (const item of content.items) {
      expect(typeof item.icon).toBe("string");
      expect(typeof item.label).toBe("string");
    }
  });
});

describe("contentSchema — validación Zod por variante", () => {
  it("valida un contenido estático correcto", () => {
    const schema = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS.static.contentSchema;
    const result = schema.safeParse({ variant: "static", message: "Envío gratis" });
    expect(result.success).toBe(true);
  });

  it("rechaza contenido estático sin message", () => {
    const schema = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS.static.contentSchema;
    const result = schema.safeParse({ variant: "static" });
    expect(result.success).toBe(false);
  });

  it("valida un contenido scroll correcto", () => {
    const schema = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS.scroll.contentSchema;
    const result = schema.safeParse({
      variant: "scroll",
      messages: ["6 cuotas sin interés", "20% OFF contado"],
      speed: "fast",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza scroll con messages vacío", () => {
    const schema = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS.scroll.contentSchema;
    const result = schema.safeParse({ variant: "scroll", messages: [] });
    expect(result.success).toBe(false);
  });

  it("valida un contenido countdown correcto", () => {
    const schema = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS.countdown.contentSchema;
    const result = schema.safeParse({
      variant: "countdown",
      message: "¡Oferta expira pronto!",
      endsAt: new Date(Date.now() + 3600_000).toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("valida un contenido badges correcto", () => {
    const schema = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS.badges.contentSchema;
    const result = schema.safeParse({
      variant: "badges",
      items: [
        { icon: "truck", label: "Envío gratis" },
        { icon: "shield", label: "Garantía oficial" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rechaza badges con más de 5 items", () => {
    const schema = ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS.badges.contentSchema;
    const result = schema.safeParse({
      variant: "badges",
      items: Array.from({ length: 6 }, (_, i) => ({ icon: "truck", label: `Item ${i}` })),
    });
    expect(result.success).toBe(false);
  });
});
