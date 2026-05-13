import Link from "next/link";
import type { Route } from "next";

import { SocialProofCarousel } from "@/components/social-proof/social-proof-carousel";
import {
  BymHomeMotion,
  type BymBenefit,
} from "@/components/storefront/bym-home-motion";
import {
  mapCatalogProductsToCardData,
  selectProductsForGrid,
} from "@/components/presentation/render-context";
import { getStorefrontInstallmentsCount } from "@/lib/commerce/installments";
import { getStorefrontInstallmentsLabel } from "@/lib/commerce/installments";
import { normalizeProductGridContent, type ProductGridModule } from "@/lib/modules/product-grid";
import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";
import { resolveProductGridTemplate } from "@/lib/templates/registry";
import { resolveProductGridTemplateId } from "@/lib/templates/product-grid-catalog";
import type {
  StorefrontBootstrap,
  StorefrontCatalogProduct,
  StorefrontCategory,
} from "@/lib/storefront-api";
import type { SectionInstance } from "@/lib/types/presentation";

type BymHomePageProps = {
  bootstrap: StorefrontBootstrap | null;
  categories: StorefrontCategory[];
  products: StorefrontCatalogProduct[];
};

type LayoutImage = {
  src: string;
  alt?: string;
};

type Cta = {
  label: string;
  href: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readBenefitKind(value: unknown): BymBenefit["kind"] | undefined {
  const kind = readString(value);
  return kind === "installments" ||
    kind === "shipping" ||
    kind === "discounts" ||
    kind === "service" ||
    kind === "trust"
    ? kind
    : undefined;
}

function readImage(value: unknown): LayoutImage | undefined {
  if (typeof value === "string") {
    const src = readString(value);
    return src ? { src } : undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const src = readString(value.url) ?? readString(value.src) ?? readString(value.imageUrl);
  if (!src) {
    return undefined;
  }

  const alt = readString(value.alt);
  return alt ? { src, alt } : { src };
}

function readCta(value: unknown): Cta | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const label = readString(value.label) ?? readString(value.title) ?? readString(value.text);
  const href = readString(value.href) ?? readString(value.url);
  return label && href ? { label, href } : undefined;
}

function readBenefits(value: unknown): BymBenefit[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry): BymBenefit[] => {
    if (!isRecord(entry)) {
      return [];
    }

    const title = readString(entry.title);
    if (!title) {
      return [];
    }

    const description = readString(entry.description) ?? readString(entry.text);
    const kind = readBenefitKind(entry.kind);
    return [{ title, ...(description ? { description } : {}), ...(kind ? { kind } : {}) }];
  });
}

function readBenefitSectionText(content: Record<string, unknown>, key: string): string | undefined {
  return readString(content[key]);
}

function getHeroContent(bootstrap: StorefrontBootstrap | null) {
  const content = bootstrap?.presentation?.pages.home.layout?.content ?? {};
  const desktopImage = readImage(isRecord(content) ? content.desktopImage : undefined);
  const mobileImage = readImage(isRecord(content) ? content.mobileImage : undefined);
  const storeName = bootstrap?.branding?.storeName ?? bootstrap?.tenant?.tenantSlug ?? "BYM";
  const h1 =
    readString(isRecord(content) ? content.h1 : undefined) ??
    readString(isRecord(content) ? content.title : undefined) ??
    storeName;
  const intro =
    readString(isRecord(content) ? content.introText : undefined) ??
    readString(isRecord(content) ? content.subtitle : undefined) ??
    bootstrap?.seo?.defaultDescription;
  const primaryCta =
    readCta(isRecord(content) ? content.primaryCta : undefined) ??
    readCta(isRecord(content) ? content.primaryAction : undefined) ??
    { label: "Ver catálogo", href: "/catalogo" };
  const secondaryCta =
    readCta(isRecord(content) ? content.secondaryCta : undefined) ??
    readCta(isRecord(content) ? content.secondaryAction : undefined) ??
    { label: "Hablar con BYM", href: "/contacto" };
  const benefits = readBenefits(isRecord(content) ? content.benefits : undefined);
  const benefitsEyebrow = isRecord(content)
    ? readBenefitSectionText(content, "benefitsEyebrow")
    : undefined;
  const benefitsTitle = isRecord(content)
    ? readBenefitSectionText(content, "benefitsTitle")
    : undefined;
  const installmentsCount = getStorefrontInstallmentsCount(bootstrap) ?? 6;
  const fallbackBenefits: BymBenefit[] = [
    {
      kind: "installments",
      title: "Cuotas sin interés con Mercado Pago",
      description: `Pagá en ${installmentsCount} cuotas con Visa, Mastercard y Amex.`,
    },
    {
      kind: "shipping",
      title: "Envíos gratis a todo el país",
      description: "Despachos con Andreani y Vía Cargo en productos seleccionados",
    },
    {
      kind: "discounts",
      title: "Descuentos activos",
      description: "Promociones por transferencia y oportunidades comerciales",
    },
    {
      kind: "service",
      title: "Armado y balanceado bonificado",
      description: "Comprando neumáticos, el armado y balanceado está 100% bonificado",
    },
  ];

  return {
    desktopImage,
    mobileImage,
    storeName,
    h1,
    intro,
    primaryCta,
    secondaryCta,
    benefits:
      benefits.length > 0
        ? benefits
        : fallbackBenefits,
    benefitsEyebrow: benefitsEyebrow ?? "Beneficios BYM",
    benefitsTitle: benefitsTitle ?? "Comprá neumáticos con ventajas reales en cada pedido.",
    installmentsCount,
  };
}

function getConfiguredProductGridSection(bootstrap: StorefrontBootstrap | null): SectionInstance | undefined {
  return bootstrap?.presentation?.pages.home.sections.find(
    (section) => section.enabled !== false && section.type === "productGrid",
  );
}

function buildBymProductGridModule(
  bootstrap: StorefrontBootstrap | null,
  products: StorefrontCatalogProduct[],
): ProductGridModule | null {
  const configuredSection = getConfiguredProductGridSection(bootstrap);
  const content = normalizeProductGridContent(
    configuredSection?.content ?? {
      title: "Productos destacados",
      subtitle: "Selección disponible del catálogo online.",
      source: { type: "featured" },
      limit: 8,
      cardVariant: "spotlight-commerce",
      showViewAllLink: true,
      viewAllHref: "/catalogo",
      viewAllLabel: "Ver catálogo",
      cardDisplayOptions: {
        showBrand: true,
        showBadges: true,
        showInstallments: true,
        showCashDiscount: true,
        showAddToCart: true,
      },
    },
  );
  const limit = content.limit ?? 8;
  const selectedProducts = selectProductsForGrid(products, content.source, limit, bootstrap);
  const resolvedProducts =
    selectedProducts.length > 0
      ? selectedProducts
      : mapCatalogProductsToCardData(products, limit, bootstrap);

  if (resolvedProducts.length === 0) {
    return null;
  }

  const installmentsLabel = bootstrap ? getStorefrontInstallmentsLabel(bootstrap) : undefined;

  return {
    id: configuredSection?.id ?? "bym-featured-products",
    type: "productGrid",
    variant: resolveProductGridTemplateId(configuredSection?.variant ?? "spotlight-carousel"),
    content,
    products: resolvedProducts,
    ...(bootstrap
      ? {
          carouselMeta: {
            empresaId: bootstrap.tenant.empresaId,
            tenantSlug: bootstrap.tenant.tenantSlug,
            ...(installmentsLabel ? { installmentsLabel } : {}),
          },
        }
      : {}),
  };
}

export function BymHomePage({ bootstrap, categories, products }: BymHomePageProps) {
  const hero = getHeroContent(bootstrap);
  const fallbackImage = hero.desktopImage ?? hero.mobileImage;
  const productGridModule = buildBymProductGridModule(bootstrap, products);
  const ProductGridTemplate = productGridModule
    ? resolveProductGridTemplate(productGridModule.variant)
    : null;

  return (
    <div data-bym-fullbleed="true">
      <section
        className="relative isolate flex items-end overflow-hidden bg-black text-white"
        style={{ height: "100dvh", minHeight: "100dvh" }}
      >
        {fallbackImage ? (
          <picture className="absolute inset-0 z-0 block h-full w-full">
            {hero.mobileImage ? <source media="(max-width: 767px)" srcSet={hero.mobileImage.src} /> : null}
            {hero.desktopImage ? <source media="(min-width: 768px)" srcSet={hero.desktopImage.src} /> : null}
            <img
              src={fallbackImage.src}
              alt={hero.desktopImage?.alt ?? hero.mobileImage?.alt ?? hero.storeName}
              className="h-full w-full object-cover"
            />
          </picture>
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_20%,rgba(244,197,66,0.22),transparent_32%),linear-gradient(135deg,#111,#050505)]" />
        )}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/82 via-black/30 to-black/8" />
        <div className="absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-black/42 to-transparent" />

        <div className="relative z-20 mx-auto grid w-full max-w-7xl gap-10 px-4 pb-12 sm:px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(280px,0.28fr)] lg:px-8 lg:pb-16">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f4c542]">{hero.storeName}</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              {hero.h1}
            </h1>
            {hero.intro ? (
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/76 sm:text-lg">{hero.intro}</p>
            ) : null}
          </div>

          <div className="grid content-end gap-5 lg:justify-items-end">
            <p className="max-w-xs text-sm leading-6 text-white/68">
              {categories.length > 0
                ? `${categories.length} categorías publicadas para compra online.`
                : "Catálogo preparado para compra online y consulta comercial."}
            </p>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href={hero.primaryCta.href as Route}
                prefetch={shouldPrefetchStorefrontLink(hero.primaryCta.href)}
                className="inline-flex min-h-12 items-center bg-white px-5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-[#f4c542]"
              >
                {hero.primaryCta.label}
              </Link>
              <Link
                href={hero.secondaryCta.href as Route}
                prefetch={shouldPrefetchStorefrontLink(hero.secondaryCta.href)}
                className="inline-flex min-h-12 items-center border border-white/40 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BymHomeMotion
        benefits={hero.benefits}
        benefitsEyebrow={hero.benefitsEyebrow}
        benefitsTitle={hero.benefitsTitle}
        installmentsCount={hero.installmentsCount}
      />

      {productGridModule && ProductGridTemplate ? (
        <div className="bg-[#f4f1ea] text-black">
          <ProductGridTemplate module={productGridModule} />
        </div>
      ) : null}

      {bootstrap ? (
        <SocialProofCarousel
          empresaId={bootstrap.tenant.empresaId}
          tenantSlug={bootstrap.tenant.tenantSlug}
          eyebrow="Reseñas de Google"
          title="Clientes que ya compraron en BYM"
          subtitle="Opiniones reales para cerrar la compra con confianza, atención directa y condiciones claras."
          autoplay
          interval={4200}
          cardClassName="!border-[#dadce0] !bg-white !p-5 !text-[#202124] shadow-[0_18px_50px_-34px_rgba(255,255,255,0.42)] [--ink:#202124] [--line:#dadce0] [--muted:#5f6368] [--paper:#ffffff] [&_[data-google-pill=true]]:!bg-white"
          className="bg-[#070707] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 [&_[data-carousel-footer=true]]:mx-auto [&_[data-carousel-footer=true]]:max-w-6xl [&_[data-social-proof-muted=true]]:text-white/72"
        />
      ) : null}
    </div>
  );
}
