import type { StorefrontBootstrap, StorefrontContentModule } from "@/lib/storefront-api";
import type {
  ModuleAction,
  ModuleImage,
  ModuleTextItem,
  ModuleVariant,
  HeroModule,
  PromoBandModule,
  RichTextModule,
  StorefrontModule,
  StorefrontModuleType,
} from "@/lib/modules/module-schema";
import type { TenantTheme } from "@/lib/theme";

type NormalizeModulesInput = {
  bootstrap: StorefrontBootstrap | null;
  theme: TenantTheme;
  host: string;
};

const MODULE_TYPE_ALIASES: Record<string, StorefrontModuleType> = {
  hero: "hero",
  featured: "featuredProducts",
  "featured-products": "featuredProducts",
  featured_products: "featuredProducts",
  featuredProducts: "featuredProducts",
  product_collection: "featuredProducts",
  "product-collection": "featuredProducts",
  categories: "categoryRail",
  "category-rail": "categoryRail",
  category_rail: "categoryRail",
  categoryRail: "categoryRail",
  promo: "promoBand",
  "promo-band": "promoBand",
  promo_band: "promoBand",
  promoBand: "promoBand",
  trust: "trustBar",
  "trust-bar": "trustBar",
  trust_bar: "trustBar",
  trustBar: "trustBar",
  text: "richText",
  "rich-text": "richText",
  rich_text: "richText",
  richText: "richText",
};

const DEFAULT_VARIANTS: Record<StorefrontModuleType, ModuleVariant> = {
  hero: "split",
  featuredProducts: "grid",
  categoryRail: "rail",
  promoBand: "solid",
  trustBar: "inline",
  richText: "editorial",
};

const ALLOWED_VARIANTS: Record<StorefrontModuleType, Set<ModuleVariant>> = {
  hero: new Set(["split", "workshop", "editorial"]),
  featuredProducts: new Set(["grid", "spotlight"]),
  categoryRail: new Set(["rail", "tiles"]),
  promoBand: new Set(["solid", "split"]),
  trustBar: new Set(["inline", "cards"]),
  richText: new Set(["editorial", "compact"]),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readModuleType(module: Record<string, unknown>): StorefrontModuleType | undefined {
  const rawType = readString(module.type) ?? readString(module.moduleType) ?? readString(module.kind);

  return rawType ? MODULE_TYPE_ALIASES[rawType] : undefined;
}

function readVariant(module: Record<string, unknown>, type: StorefrontModuleType): ModuleVariant | undefined {
  const rawVariant = readString(module.variant);

  if (rawVariant && ALLOWED_VARIANTS[type].has(rawVariant as ModuleVariant)) {
    return rawVariant as ModuleVariant;
  }

  return undefined;
}

function readAction(value: unknown, fallback?: ModuleAction): ModuleAction | undefined {
  if (!isRecord(value)) {
    return fallback;
  }

  const label = readString(value.label) ?? readString(value.text);
  const href = readString(value.href) ?? readString(value.url);

  if (!label || !href) {
    return fallback;
  }

  return { label, href };
}

function readImage(value: unknown): ModuleImage | undefined {
  if (typeof value === "string" && value.trim()) {
    return { src: value, alt: "" };
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const src = readString(value.src) ?? readString(value.url) ?? readString(value.imageUrl);

  if (!src) {
    return undefined;
  }

  return {
    src,
    alt: readString(value.alt) ?? "",
  };
}

function readItems(value: unknown): ModuleTextItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): ModuleTextItem[] => {
    if (typeof item === "string" && item.trim()) {
      return [{ title: item.trim() }];
    }

    if (!isRecord(item)) {
      return [];
    }

    const title = readString(item.title) ?? readString(item.label) ?? readString(item.name);

    if (!title) {
      return [];
    }

    const description = readString(item.description);
    const href = readString(item.href) ?? readString(item.url);
    const textItem: ModuleTextItem = { title };

    if (description) {
      textItem.description = description;
    }

    if (href) {
      textItem.href = href;
    }

    return [textItem];
  });
}

function readModuleId(module: Record<string, unknown>, index: number, type: StorefrontModuleType): string {
  return readString(module.id) ?? `${type}-${index + 1}`;
}

function normalizeModule(module: unknown, index: number): StorefrontModule | null {
  if (!isRecord(module)) {
    return null;
  }

  const payload = isRecord(module.payload) ? module.payload : {};
  const type = readModuleType(module) ?? readModuleType(payload);

  if (!type) {
    return null;
  }

  const id = readModuleId(module, index, type);
  const variant = readVariant(module, type) ?? readVariant(payload, type) ?? DEFAULT_VARIANTS[type];
  const title = readString(module.title) ?? readString(payload.title);
  const description =
    readString(module.description) ??
    readString(module.subtitle) ??
    readString(module.body) ??
    readString(payload.description) ??
    readString(payload.subtitle) ??
    readString(payload.body);
  const eyebrow =
    readString(module.eyebrow) ?? readString(module.kicker) ?? readString(payload.eyebrow) ?? readString(payload.kicker);

  switch (type) {
    case "hero": {
      const image = readImage(module.image ?? module.imageUrl ?? payload.image ?? payload.imageUrl);
      const primaryAction = readAction(module.primaryAction ?? module.cta ?? payload.primaryAction ?? payload.cta, {
        label: "Ver catálogo",
        href: "/catalogo",
      });
      const secondaryAction = readAction(module.secondaryAction ?? payload.secondaryAction);
      const heroModule: HeroModule = {
        id,
        type,
        variant: variant as "split" | "workshop" | "editorial",
        title: title ?? "Tienda online",
        description: description ?? "Explorá productos, servicios y novedades de la tienda.",
      };

      if (eyebrow) {
        heroModule.eyebrow = eyebrow;
      }

      if (image) {
        heroModule.image = image;
      }

      if (primaryAction) {
        heroModule.primaryAction = primaryAction;
      }

      if (secondaryAction) {
        heroModule.secondaryAction = secondaryAction;
      }

      return heroModule;
    }
    case "featuredProducts":
      return {
        id,
        type,
        variant: variant as "grid" | "spotlight",
        ...(eyebrow ? { eyebrow } : {}),
        title: title ?? "Productos destacados",
        ...(description ? { description } : {}),
        limit: readNumber(module.limit) ?? readNumber(payload.limit) ?? 6,
      };
    case "categoryRail":
      return {
        id,
        type,
        variant: variant as "rail" | "tiles",
        ...(eyebrow ? { eyebrow } : {}),
        title: title ?? "Categorías",
        ...(description ? { description } : {}),
        limit: readNumber(module.limit) ?? readNumber(payload.limit) ?? 8,
      };
    case "promoBand": {
      const promoAction = readAction(module.action ?? module.cta ?? payload.action ?? payload.cta);
      const promoModule: PromoBandModule = {
        id,
        type,
        variant: variant as "solid" | "split",
        title: title ?? "Promoción vigente",
        description: description ?? "Consultá las condiciones comerciales disponibles para esta tienda.",
      };

      if (eyebrow) {
        promoModule.eyebrow = eyebrow;
      }

      if (promoAction) {
        promoModule.action = promoAction;
      }

      return promoModule;
    }
    case "trustBar":
      return {
        id,
        type,
        variant: variant as "inline" | "cards",
        ...(eyebrow ? { eyebrow } : {}),
        ...(title ? { title } : {}),
        items: readItems(module.items ?? payload.items).slice(0, 6),
      };
    case "richText": {
      const richTextAction = readAction(module.action ?? module.cta ?? payload.action ?? payload.cta);
      const richTextModule: RichTextModule = {
        id,
        type,
        variant: variant as "editorial" | "compact",
        title: title ?? "Información de la tienda",
        body: description ?? "Contenido configurable pendiente de completar desde PyMEInteligente.",
      };

      if (eyebrow) {
        richTextModule.eyebrow = eyebrow;
      }

      if (richTextAction) {
        richTextModule.action = richTextAction;
      }

      return richTextModule;
    }
  }
}

function buildFallbackModules({ bootstrap, theme, host }: NormalizeModulesInput): StorefrontModule[] {
  const displayName =
    bootstrap?.branding?.storeName ??
    bootstrap?.tenant?.tenantSlug ??
    host;
  const description =
    bootstrap?.seo?.defaultDescription ??
    "Una experiencia pública configurada por theme y módulos, conectada al backend de PyMEInteligente.";

  if (theme.preset === "editorialDark") {
    return [
      {
        id: "fallback-hero",
        type: "hero",
        variant: "editorial",
        eyebrow: "Selección curada",
        title: displayName,
        description,
        primaryAction: { label: "Explorar catálogo", href: "/catalogo" },
      },
      {
        id: "fallback-featured",
        type: "featuredProducts",
        variant: "spotlight",
        eyebrow: "Destacados",
        title: "Piezas principales de la tienda",
        description: "Los productos se toman del catálogo público del tenant actual.",
        limit: 5,
      },
      {
        id: "fallback-trust",
        type: "trustBar",
        variant: "cards",
        title: "Compra con respaldo",
        items: [
          { title: "Atención directa", description: "Canales visibles configurados por empresa." },
          { title: "Stock y precio validados", description: "La plataforma mantiene la verdad comercial." },
          { title: "Pedido trazable", description: "Seguimiento por token firmado cuando exista orden." },
        ],
      },
    ];
  }

  if (theme.preset === "minimalClean") {
    return [
      {
        id: "fallback-hero",
        type: "hero",
        variant: "split",
        eyebrow: "Storefront oficial",
        title: displayName,
        description,
        primaryAction: { label: "Ver catálogo", href: "/catalogo" },
        secondaryAction: { label: "Consultar checkout", href: "/checkout" },
      },
      {
        id: "fallback-categories",
        type: "categoryRail",
        variant: "tiles",
        title: "Comprar por categoría",
        description: "La navegación pública usa categorías devueltas por el backend.",
        limit: 8,
      },
      {
        id: "fallback-featured",
        type: "featuredProducts",
        variant: "grid",
        title: "Productos disponibles",
        limit: 6,
      },
    ];
  }

  return [
    {
      id: "fallback-hero",
      type: "hero",
      variant: "workshop",
      eyebrow: "Tienda conectada al taller",
      title: displayName,
      description,
      primaryAction: { label: "Explorar catálogo", href: "/catalogo" },
      secondaryAction: { label: "Iniciar checkout", href: "/checkout" },
    },
    {
      id: "fallback-categories",
      type: "categoryRail",
      variant: "rail",
      eyebrow: "Rubros",
      title: "Encontrá rápido lo que necesitás",
      limit: 8,
    },
    {
      id: "fallback-featured",
      type: "featuredProducts",
      variant: "grid",
      eyebrow: "Selección pública",
      title: "Productos destacados del catálogo",
      description: "El storefront presenta datos públicos; precios y disponibilidad siguen en el ERP.",
      limit: 6,
    },
    {
      id: "fallback-trust",
      type: "trustBar",
      variant: "inline",
      items: [
        { title: "Compra validada por backend" },
        { title: "Checkout bloqueado si la tienda no está activa" },
        { title: "SEO aislado por host" },
      ],
    },
  ];
}

export function normalizeModules(input: NormalizeModulesInput): StorefrontModule[] {
  const rawModules = Array.isArray(input.bootstrap?.home?.modules) ? input.bootstrap.home.modules : [];
  const normalized =
    rawModules
      .map((module: StorefrontContentModule | unknown, index: number) => normalizeModule(module, index))
      .filter((module): module is StorefrontModule => module !== null);

  if (normalized.length > 0) {
    return normalized;
  }

  return buildFallbackModules(input);
}
