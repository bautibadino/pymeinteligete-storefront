import { describe, expect, it } from "vitest";

import {
  DEFAULT_HERO_TEMPLATE_ID,
  HERO_CONTENT_SCHEMAS,
  HERO_TEMPLATE_DESCRIPTORS,
  HERO_TEMPLATE_IDS,
  defaultHeroContent,
  isHeroTemplateId,
  resolveHeroTemplateId,
} from "@/lib/templates/hero-catalog";

describe("Hero template catalog — variantes hero", () => {
  it("incluye 'commerce' y 'button-overlay' en HERO_TEMPLATE_IDS", () => {
    expect(HERO_TEMPLATE_IDS).toContain("commerce");
    expect(HERO_TEMPLATE_IDS).toContain("button-overlay");
  });

  it("expone las 5 variantes declaradas", () => {
    expect(HERO_TEMPLATE_IDS).toEqual(["split", "workshop", "editorial", "commerce", "button-overlay"]);
  });

  it("tiene descriptor para 'commerce' con id, label, description y bestFor", () => {
    const descriptor = HERO_TEMPLATE_DESCRIPTORS["commerce"];
    expect(descriptor).toBeDefined();
    expect(descriptor.id).toBe("commerce");
    expect(descriptor.label.length).toBeGreaterThan(0);
    expect(descriptor.description.length).toBeGreaterThan(0);
    expect(descriptor.bestFor.length).toBeGreaterThan(0);
  });

  it("el descriptor de commerce tiene thumbnailUrl apuntando al SVG correcto", () => {
    const descriptor = HERO_TEMPLATE_DESCRIPTORS["commerce"];
    expect(descriptor.thumbnailUrl).toBe("/template-thumbnails/hero-commerce.svg");
  });

  it("todos los descriptores tienen thumbnailUrl", () => {
    for (const id of HERO_TEMPLATE_IDS) {
      const descriptor = HERO_TEMPLATE_DESCRIPTORS[id];
      expect(descriptor.thumbnailUrl).toBeDefined();
      expect(descriptor.thumbnailUrl.length).toBeGreaterThan(0);
    }
  });
});

describe("HERO_CONTENT_SCHEMAS['button-overlay']", () => {
  it("valida el defaultHeroContent('button-overlay') sin errores", () => {
    const defaults = defaultHeroContent("button-overlay");
    const result = HERO_CONTENT_SCHEMAS["button-overlay"].safeParse(defaults);
    expect(result.success).toBe(true);
  });

  it("requiere imageUrl y primaryCta", () => {
    const result = HERO_CONTENT_SCHEMAS["button-overlay"].safeParse({
      buttonPosition: "left",
    });
    expect(result.success).toBe(false);
  });

  it("acepta una configuración mínima válida", () => {
    const result = HERO_CONTENT_SCHEMAS["button-overlay"].safeParse({
      imageUrl: "https://cdn.example.com/hero-campaign.webp",
      primaryCta: { label: "Ver más", href: "/catalogo", variant: "primary" },
      buttonPosition: "right",
    });
    expect(result.success).toBe(true);
  });
});

describe("HERO_CONTENT_SCHEMAS['commerce']", () => {
  it("existe el schema para commerce", () => {
    expect(HERO_CONTENT_SCHEMAS.commerce).toBeDefined();
  });

  it("valida el defaultHeroContent('commerce') sin errores", () => {
    const defaults = defaultHeroContent("commerce");
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse(defaults);
    expect(result.success).toBe(true);
  });

  it("acepta un objeto de commerce válido completo", () => {
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse({
      imageUrl: "https://cdn.example.com/hero.jpg",
      imageAlt: "Taller BYM",
      overlayOpacity: 45,
      title: "Neumáticos y servicios",
      subtitle: "Hasta 6 cuotas sin interés",
      badges: [
        { icon: "truck", label: "Envío a todo el país" },
        { icon: "shield", label: "Garantía oficial" },
        { icon: "credit-card", label: "Todos los medios de pago" },
      ],
      primaryCta: { label: "Ver catálogo", href: "/catalogo" },
      secondaryCta: { label: "Contactar", href: "/contacto" },
      searchPlaceholder: "Buscá tu producto...",
      enableSearch: true,
    });
    expect(result.success).toBe(true);
  });

  it("requiere 'title' como campo obligatorio", () => {
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse({
      imageUrl: "https://cdn.example.com/hero.jpg",
    });
    expect(result.success).toBe(false);
  });

  it("requiere 'imageUrl' como campo obligatorio", () => {
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse({
      title: "Neumáticos y servicios",
    });
    expect(result.success).toBe(false);
  });

  it("acepta commerce sin campos opcionales", () => {
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse({
      imageUrl: "https://cdn.example.com/hero.jpg",
      title: "Neumáticos y servicios",
    });
    expect(result.success).toBe(true);
  });

  it("acepta metadata aditiva de imagen mientras imageUrl siga resuelto", () => {
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse({
      imageUrl: "https://cdn.example.com/hero.jpg",
      image: {
        url: "https://cdn.example.com/hero.jpg",
        alt: "Taller BYM",
        width: 1600,
        height: 900,
      },
      title: "Neumáticos y servicios",
    });
    expect(result.success).toBe(true);
  });

  it("aplica el default de overlayOpacity = 45 cuando se omite", () => {
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse({
      imageUrl: "https://cdn.example.com/hero.jpg",
      title: "Neumáticos y servicios",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overlayOpacity).toBe(45);
    }
  });

  it("rechaza badges con icon inválido", () => {
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse({
      imageUrl: "https://cdn.example.com/hero.jpg",
      title: "Test",
      badges: [{ icon: "icono-inventado", label: "Test" }],
    });
    expect(result.success).toBe(false);
  });

  it("acepta badges sin icon (solo label)", () => {
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse({
      imageUrl: "https://cdn.example.com/hero.jpg",
      title: "Test",
      badges: [{ label: "Solo texto" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("defaultHeroContent('commerce')", () => {
  const defaults = defaultHeroContent("commerce");

  it("incluye title no vacío", () => {
    expect(defaults.title.length).toBeGreaterThan(0);
  });

  it("incluye imageUrl (puede ser string vacío en defaults)", () => {
    expect(typeof defaults.imageUrl).toBe("string");
  });

  it("incluye badges con al menos un elemento", () => {
    expect(defaults.badges).toBeDefined();
    expect(defaults.badges!.length).toBeGreaterThan(0);
  });

  it("el overlayOpacity default es 45", () => {
    expect(defaults.overlayOpacity).toBe(45);
  });

  it("incluye primaryCta", () => {
    expect(defaults.primaryCta).toBeDefined();
    expect(defaults.primaryCta!.label.length).toBeGreaterThan(0);
    expect(defaults.primaryCta!.href.length).toBeGreaterThan(0);
  });

  it("pasa validación del schema de commerce", () => {
    const result = HERO_CONTENT_SCHEMAS.commerce.safeParse(defaults);
    expect(result.success).toBe(true);
  });
});

describe("resolveHeroTemplateId con variante commerce", () => {
  it("retorna 'commerce' cuando el input es 'commerce'", () => {
    expect(resolveHeroTemplateId("commerce")).toBe("commerce");
  });

  it("isHeroTemplateId reconoce 'commerce' como válido", () => {
    expect(isHeroTemplateId("commerce")).toBe(true);
  });

  it("isHeroTemplateId reconoce 'button-overlay' como válido", () => {
    expect(isHeroTemplateId("button-overlay")).toBe(true);
  });

  it("degrada al default si el input es inválido (no se rompe)", () => {
    expect(resolveHeroTemplateId("no-existe")).toBe(DEFAULT_HERO_TEMPLATE_ID);
  });

  it("las 5 variantes se resuelven como identidad", () => {
    for (const id of HERO_TEMPLATE_IDS) {
      expect(resolveHeroTemplateId(id)).toBe(id);
    }
  });
});
