import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  BadgeCheck,
  CircleAlert,
  CreditCard,
  Info,
  Package,
  Sparkles,
} from "lucide-react";

import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { ShippingQuoteCalculator } from "@/components/storefront/shipping/shipping-quote-calculator";
import { ProductDetailGoogleTrust } from "@/components/storefront/product-detail-google-trust";
import { resolveCartItemPrice } from "@/lib/cart/storefront-cart";
import { buildShippingQuotePackageFromProductDetailData } from "@/lib/shipping/product-package";
import { ProductCardCompact } from "@/components/templates/product-card/product-card-compact";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type {
  ProductDetailBadge,
  ProductDetailData,
  ProductDetailImage,
  ProductDetailSpecification,
} from "@/lib/modules/product-detail";
import type { ProductCardData } from "@/lib/templates/product-card-catalog";

type BadgeVariant = "soft" | "success" | "warning" | "secondary";

export type ProductDetailTabSection = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  brandLogoUrl?: string | undefined;
  notes?: string[] | undefined;
  specifications?: ProductDetailSpecification[] | undefined;
};

type ProductDetailShellProps = {
  children: ReactNode;
  className?: string | undefined;
};

type ProductDetailBreadcrumbsProps = {
  productName: string;
  className?: string | undefined;
};

type ProductDetailBadgeGroupProps = {
  badges?: ProductDetailBadge[] | undefined;
  className?: string | undefined;
  limit?: number | undefined;
  compact?: boolean | undefined;
};

type ProductDetailPriceStackProps = {
  product: ProductDetailData;
  className?: string | undefined;
};

type ProductDetailPurchaseCardProps = {
  product: ProductDetailData;
  mainImage?: ProductDetailImage | undefined;
  className?: string | undefined;
  description?: string | undefined;
  commercialData?: ProductDetailCommercialData | undefined;
};

type ProductDetailSpecsCardProps = {
  title?: string;
  description?: string | undefined;
  specifications?: ProductDetailSpecification[] | undefined;
  className?: string | undefined;
  limit?: number;
};

type ProductDetailFallbackCardProps = {
  title: string;
  body: string;
  className?: string | undefined;
};

type ProductDetailCommercialData = {
  paymentMethods: string[];
  reviewsEnabled?: boolean | undefined;
  reviewsEmpresaId?: string | undefined;
  reviewsTenantSlug?: string | undefined;
};

type ProductDetailCommercialSignal = {
  id: string;
  label: string;
  value: string;
  detail?: string | undefined;
  icon: ReactNode;
  emphasized?: boolean | undefined;
};

type ProductDetailRelatedGridProps = {
  products: ProductCardData[];
  className?: string | undefined;
};

const CARD_BASE =
  "min-w-0 rounded-none border-y border-black/10 border-x-0 bg-white shadow-none sm:rounded-[24px] sm:border sm:shadow-[0_16px_42px_rgba(15,23,42,0.08)] xl:rounded-[28px] xl:border-black/6 xl:bg-white/92 xl:shadow-[0_24px_70px_rgba(15,23,42,0.1)]";

const INNER_PANEL =
  "rounded-[20px] border border-black/10 bg-black/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] xl:rounded-[24px] xl:border-black/10 xl:bg-black/[0.02] xl:shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function splitParagraphs(copy: string | undefined, fallback: string): string[] {
  if (!copy) return [fallback];

  const paragraphs = copy
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.length > 0 ? paragraphs : [fallback];
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normalizePaymentMethodLabel(value: string): string {
  const normalized = value.trim();
  const collapsed = normalized.toLowerCase().replace(/\s+/g, "");

  if (collapsed.includes("mercadopago")) {
    return "Mercado Pago";
  }

  return normalized
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function normalizeComparableLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueProductBadges(
  badges?: ProductDetailBadge[] | undefined,
): ProductDetailBadge[] {
  if (!badges || badges.length === 0) return [];

  const seenLabels = new Set<string>();
  const uniqueBadges: ProductDetailBadge[] = [];

  for (const badge of badges) {
    const labelKey = normalizeComparableLabel(badge.label);
    if (!labelKey || seenLabels.has(labelKey)) continue;

    seenLabels.add(labelKey);
    uniqueBadges.push(badge);
  }

  return uniqueBadges;
}

function readPaymentMethods(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return readString(entry);
      }

      if (!isRecord(entry)) {
        return undefined;
      }

      return (
        readString(entry.displayName) ??
        readString(entry.methodId) ??
        readString(entry.provider) ??
        readString(entry.name)
      );
    })
    .filter((entry): entry is string => Boolean(entry))
    .map((entry) => normalizePaymentMethodLabel(entry))
    .filter((entry, index, array) => array.indexOf(entry) === index);
}

function mapBadgeVariant(tone: ProductDetailBadge["tone"]): BadgeVariant {
  switch (tone) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "accent":
      return "secondary";
    case "info":
    default:
      return "soft";
  }
}

function getSavings(product: ProductDetailData) {
  if (!product.compareAtPrice) return null;

  const amount = product.compareAtPrice.amount - product.price.amount;
  if (amount <= 0) return null;

  return {
    amount,
    formatted: formatCurrency(amount, product.price.currency),
  };
}

function getSummaryFacts(product: ProductDetailData) {
  const facts: Array<{ id: string; label: string; value: string; icon: ReactNode }> = [];

  if (product.stock?.label) {
    facts.push({
      id: "stock",
      label: "Disponibilidad",
      value: product.stock.label,
      icon: product.stock.available ? (
        <BadgeCheck className="size-4" aria-hidden="true" />
      ) : (
        <CircleAlert className="size-4" aria-hidden="true" />
      ),
    });
  } else {
    facts.push({
      id: "stock-pending",
      label: "Disponibilidad",
      value: "Stock pendiente de publicación",
      icon: <Info className="size-4" aria-hidden="true" />,
    });
  }

  return facts;
}

function getCommercialSignals(
  product: ProductDetailData,
  commercialData?: ProductDetailCommercialData | undefined,
): ProductDetailCommercialSignal[] {
  const signals: ProductDetailCommercialSignal[] = [];
  const paymentMethods = commercialData?.paymentMethods ?? [];
  const mercadoPagoVisible = paymentMethods.includes("Mercado Pago");

  if (paymentMethods.length > 0) {
    const primaryMethod = mercadoPagoVisible ? "Mercado Pago" : paymentMethods[0];
    const extraMethods = mercadoPagoVisible
      ? paymentMethods.length - 1
      : paymentMethods.length > 1
        ? paymentMethods.length - 1
        : 0;

    signals.push({
      id: "payment-methods",
      label: "Pago",
      value: primaryMethod ?? "Medios visibles",
      detail:
        extraMethods > 0
          ? `+${extraMethods} método${extraMethods === 1 ? "" : "s"} visible${extraMethods === 1 ? "" : "s"}`
          : "Disponible para checkout",
      icon: <CreditCard className="size-4" aria-hidden="true" />,
      emphasized: mercadoPagoVisible,
    });
  }

  if (product.installments?.interestFree) {
    signals.push({
      id: "interest-free-installments",
      label: "Cuotas",
      value: `${product.installments.count} sin interés`,
      detail: `${product.installments.formatted} por cuota`,
      icon: <Sparkles className="size-4" aria-hidden="true" />,
      emphasized: true,
    });
  }

  return signals;
}

export function resolveProductDetailCommercialData(
  content: unknown,
): ProductDetailCommercialData | undefined {
  if (!content || typeof content !== "object") {
    return undefined;
  }

  const record = content as Record<string, unknown>;
  const paymentMethods = readPaymentMethods(record.paymentMethods);
  const reviewsEnabled = readBoolean(record.reviewsEnabled);
  const reviewsEmpresaId = readString(record.reviewsEmpresaId);
  const reviewsTenantSlug = readString(record.reviewsTenantSlug);

  if (
    paymentMethods.length === 0 &&
    typeof reviewsEnabled !== "boolean" &&
    !reviewsEmpresaId &&
    !reviewsTenantSlug
  ) {
    return undefined;
  }

  return {
    paymentMethods,
    ...(typeof reviewsEnabled === "boolean" ? { reviewsEnabled } : {}),
    ...(reviewsEmpresaId ? { reviewsEmpresaId } : {}),
    ...(reviewsTenantSlug ? { reviewsTenantSlug } : {}),
  };
}

export function productDetailCardClassName(className?: string) {
  return cn(CARD_BASE, className);
}

export function productDetailInnerPanelClassName(className?: string) {
  return cn(INNER_PANEL, className);
}

export function ProductDetailShell({ children, className }: ProductDetailShellProps) {
  return (
    <section className="py-0 md:py-6 xl:py-8" data-surface="product-detail-premium">
      <div className="mx-auto max-w-7xl px-3 sm:px-0">
        <div
          className={cn(
            "relative overflow-hidden bg-transparent text-foreground shadow-none sm:rounded-[28px] sm:border sm:border-black/6 sm:bg-white/92 sm:shadow-[0_24px_70px_rgba(15,23,42,0.08)] xl:rounded-[34px] xl:border-black/6 xl:bg-white/92 xl:text-foreground xl:shadow-[0_28px_80px_rgba(15,23,42,0.1)]",
            "xl:before:absolute xl:before:inset-0 xl:before:bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_40%)] xl:before:content-['']",
            "xl:after:absolute xl:after:inset-0 xl:after:bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--module-accent)_8%,transparent),transparent_36%)] xl:after:content-['']",
            className,
          )}
        >
          <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0)_24%,rgba(255,255,255,0.1))] xl:block" />
          <div className="relative z-10 p-0 sm:p-4 md:p-5 xl:p-10">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function ProductDetailEmptyState() {
  return (
    <ProductDetailShell>
      <div className={productDetailCardClassName("px-6 py-14 text-center")}>
        <p className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
          Producto no disponible
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          Este detalle todavía no tiene información suficiente para renderizar una ficha
          comercial.
        </p>
      </div>
    </ProductDetailShell>
  );
}

export function ProductDetailBreadcrumbs({
  productName,
  className,
}: ProductDetailBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mb-4 hidden overflow-x-auto text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block md:mb-6 md:text-xs md:tracking-[0.18em]",
        className,
      )}
    >
      <ol className="flex min-w-max items-center gap-2 whitespace-nowrap md:gap-3">
        <li>
          <Link
            href="/"
            className="transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background xl:hover:text-white xl:focus-visible:ring-white/70 xl:focus-visible:ring-offset-foreground"
          >
            Inicio
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href={"/catalogo" as Route}
            className="transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background xl:hover:text-white xl:focus-visible:ring-white/70 xl:focus-visible:ring-offset-foreground"
          >
            Catálogo
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="max-w-[10rem] truncate text-foreground sm:max-w-[16rem] md:max-w-none" aria-current="page">
          {productName}
        </li>
      </ol>
    </nav>
  );
}

export function ProductDetailBadgeGroup({
  badges,
  className,
  limit,
  compact = false,
}: ProductDetailBadgeGroupProps) {
  const uniqueBadges = uniqueProductBadges(badges);
  if (uniqueBadges.length === 0) return null;

  const visibleBadges = typeof limit === "number" ? uniqueBadges.slice(0, limit) : uniqueBadges;
  const hiddenCount = uniqueBadges.length - visibleBadges.length;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleBadges.map((badge, index) => (
        <Badge
          key={`${badge.label}-${index}`}
          variant={mapBadgeVariant(badge.tone)}
          className={cn(
            "rounded-full border border-black/10 bg-black/[0.03] uppercase text-foreground shadow-none xl:border-black/10 xl:bg-black/[0.03] xl:text-foreground",
            compact
              ? "px-2.5 py-1 text-[10px] tracking-[0.14em]"
              : "px-3 py-1 text-[11px] tracking-[0.16em]",
          )}
        >
          {badge.label}
        </Badge>
      ))}
      {hiddenCount > 0 ? (
        <Badge
          variant="soft"
          className={cn(
            "rounded-full border border-black/10 bg-black/[0.03] uppercase text-muted-foreground shadow-none xl:border-black/10 xl:bg-black/[0.03] xl:text-muted-foreground",
            compact
              ? "px-2.5 py-1 text-[10px] tracking-[0.14em]"
              : "px-3 py-1 text-[11px] tracking-[0.16em]",
          )}
        >
          +{hiddenCount}
        </Badge>
      ) : null}
    </div>
  );
}

export function ProductDetailPriceStack({
  product,
  className,
}: ProductDetailPriceStackProps) {
  const savings = getSavings(product);

  return (
    <div className={cn("grid gap-2.5", className)}>
      <div className="grid gap-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <p className="font-heading text-[1.75rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[2.05rem] md:text-[2.35rem] lg:text-5xl">
            {product.price.formatted}
          </p>
          {product.compareAtPrice ? (
            <p className="text-sm text-muted-foreground line-through md:text-base">
              {product.compareAtPrice.formatted}
            </p>
          ) : null}
        </div>

        {savings ? (
          <div className="inline-flex w-fit items-center rounded-full border border-[color:color-mix(in_srgb,var(--accent)_40%,black_10%)] bg-[color:color-mix(in_srgb,var(--accent)_18%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground xl:border-[color:color-mix(in_srgb,var(--accent)_40%,black_10%)] xl:text-foreground">
            Ahorrás {savings.formatted}
          </div>
        ) : null}
      </div>

      {product.installments || product.cashDiscount ? (
        <div
          className={productDetailInnerPanelClassName(
            "grid gap-2 px-3 py-2.5 sm:grid-cols-2 sm:items-start",
          )}
        >
          {product.installments ? (
            <div className="grid gap-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Cuotas
              </p>
              <p className="text-[13px] leading-5 text-foreground/80">
                {product.installments.count} de {product.installments.formatted}
                {product.installments.interestFree ? " sin interés" : ""}
              </p>
            </div>
          ) : null}
          {product.cashDiscount ? (
            <div className="grid gap-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Contado
              </p>
              <p className="text-[13px] font-medium leading-5 text-foreground">
                {product.cashDiscount.formatted}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetailPurchaseCard({
  product,
  mainImage,
  className,
  description,
  commercialData,
}: ProductDetailPurchaseCardProps) {
  const isAvailable = product.stock === undefined || product.stock.available;
  const quickSpecs = product.specifications?.slice(0, 4) ?? [];
  const facts = getSummaryFacts(product);
  const commercialSignals = getCommercialSignals(product, commercialData);
  const primaryFacts = facts.slice(0, 1);
  const secondaryFacts = facts.slice(1);
  const quotePackage = buildShippingQuotePackageFromProductDetailData(product);
  const showReviewsTrust =
    commercialData?.reviewsEnabled &&
    (commercialData.reviewsEmpresaId || commercialData.reviewsTenantSlug);

  return (
    <aside
      className={productDetailCardClassName(
        cn("grid gap-4 p-3.5 sm:p-4 md:gap-5 md:p-5 xl:gap-6 xl:p-6", className),
      )}
    >
      <div className="grid gap-3">
        {product.brand ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {product.brand}
          </span>
        ) : null}

        <div className="grid gap-2.5">
          <h1 className="font-heading text-[1.55rem] font-semibold leading-[0.96] tracking-[-0.05em] text-foreground [overflow-wrap:anywhere] sm:text-[1.9rem] md:text-[2.3rem] lg:text-[2.6rem] xl:text-5xl">
            {product.name}
          </h1>
          <ProductDetailBadgeGroup
            badges={product.badges}
            limit={2}
            compact
            className="gap-1.5 md:gap-2"
          />
        </div>

        {description ? (
          <p className="hidden max-w-[54ch] text-sm leading-7 text-muted-foreground xl:block xl:text-base">
            {description}
          </p>
        ) : null}
      </div>

      <ProductDetailPriceStack product={product} className="gap-2.5" />

      <AddToCartButton
        item={{
          productId: product.id,
          slug: product.slug,
          name: product.name,
          href: product.href,
          price: resolveCartItemPrice({
            price: product.price,
            basePrice: product.basePrice,
          }),
          ...(product.brand ? { brand: product.brand } : {}),
          ...(mainImage?.url ? { imageUrl: mainImage.url } : {}),
        }}
        size="lg"
        className="h-12 w-full rounded-[16px] text-sm font-semibold shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:h-14 sm:text-base xl:focus-visible:ring-white/80 xl:focus-visible:ring-offset-foreground"
        disabled={!isAvailable}
        unavailableLabel="No disponible"
      />

      <ShippingQuoteCalculator quotePackage={quotePackage} />

      {showReviewsTrust ? (
        <ProductDetailGoogleTrust
          empresaId={commercialData.reviewsEmpresaId}
          tenantSlug={commercialData.reviewsTenantSlug}
        />
      ) : null}

      {(commercialSignals.length > 0 || primaryFacts.length > 0) ? (
        <div className={productDetailInnerPanelClassName("grid gap-2.5 p-3")}>
          {commercialSignals.length > 0 ? (
            <div className="grid gap-2">
              {commercialSignals.slice(0, 2).map((signal) => (
                <div
                  key={signal.id}
                  className={cn(
                    "grid min-h-10 grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-[14px] border px-3 py-2",
                    signal.emphasized
                      ? "border-black/12 bg-black/[0.04] xl:border-black/12 xl:bg-black/[0.04]"
                      : "border-black/10 bg-black/[0.02] xl:border-black/10 xl:bg-black/[0.02]",
                  )}
                >
                  <div className="mt-0.5 text-muted-foreground">{signal.icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      {signal.label}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-5 text-foreground">
                      {signal.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {primaryFacts.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {primaryFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="grid min-h-10 grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-[14px] border border-black/10 bg-black/[0.02] px-3 py-2 xl:border-black/10 xl:bg-black/[0.02]"
                >
                  <div className="mt-0.5 text-muted-foreground">{fact.icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      {fact.label}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-5 text-foreground/80">
                      {fact.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {secondaryFacts.length > 0 ? (
        <div className="hidden gap-2 xl:grid">
          {secondaryFacts.map((fact) => (
            <div
              key={fact.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-[18px] border border-black/10 bg-black/[0.02] px-3 py-3"
            >
              <div className="mt-0.5 text-muted-foreground">{fact.icon}</div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {fact.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-foreground/80">{fact.value}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {quickSpecs.length > 0 ? (
        <div className="hidden gap-3 xl:grid">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Snapshot técnico
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickSpecs.map((spec, index) => (
              <div
                key={`${spec.label}-${index}`}
                className="rounded-[18px] border border-black/10 bg-black/[0.02] px-3 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {spec.label}
                </p>
                <p className="mt-1 text-sm font-medium leading-6 text-foreground/84">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export function ProductDetailRelatedGrid({
  products,
  className,
}: ProductDetailRelatedGridProps) {
  return (
    <div className={productDetailCardClassName(cn("p-5 md:p-6", className))}>
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-full border border-black/10 bg-black/[0.03] p-2 text-muted-foreground xl:border-black/10 xl:bg-black/[0.03] xl:text-muted-foreground">
          <Sparkles className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Relacionados
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Productos del contexto actual del storefront.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((relatedProduct) => (
          <ProductCardCompact
            key={relatedProduct.id}
            product={relatedProduct}
            displayOptions={{ showBrand: true, showStockBadge: true }}
          />
        ))}
      </div>
    </div>
  );
}

export function ProductDetailFallbackCard({
  title,
  body,
  className,
}: ProductDetailFallbackCardProps) {
  return (
    <div className={productDetailCardClassName(cn("p-5 md:p-6", className))}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full border border-black/10 bg-black/[0.03] p-2 text-muted-foreground xl:border-black/10 xl:bg-black/[0.03] xl:text-muted-foreground">
          <Info className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSpecsCard({
  title = "Especificaciones",
  description,
  specifications,
  className,
  limit,
}: ProductDetailSpecsCardProps) {
  const visibleSpecifications = typeof limit === "number" ? specifications?.slice(0, limit) : specifications;

  if (!visibleSpecifications || visibleSpecifications.length === 0) {
    return (
      <ProductDetailFallbackCard
        title={title}
        body="Este producto todavía no tiene especificaciones publicadas."
        className={className}
      />
    );
  }

  return (
    <div className={productDetailCardClassName(cn("p-5 md:p-6", className))}>
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-full border border-black/10 bg-black/[0.03] p-2 text-muted-foreground xl:border-black/10 xl:bg-black/[0.03] xl:text-muted-foreground">
          <Package className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {visibleSpecifications.map((spec, index) => (
          <div
            key={`${spec.label}-${index}`}
            className={productDetailInnerPanelClassName("px-4 py-3")}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {spec.label}
            </dt>
            <dd className="mt-1 text-sm font-medium leading-6 text-foreground">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function buildProductDetailTabs(
  product: ProductDetailData,
  commercialData?: ProductDetailCommercialData | undefined,
): ProductDetailTabSection[] {
  const descriptionParagraphs = splitParagraphs(
    product.description,
    "La descripción comercial todavía no fue cargada para este producto.",
  );

  return [
    {
      id: "details",
      label: "Detalle",
      eyebrow: "Producto",
      title: "Descripción y especificaciones",
      paragraphs: descriptionParagraphs,
      ...(product.brandLogoUrl ? { brandLogoUrl: product.brandLogoUrl } : {}),
      notes: [
        product.brand ? `Marca: ${product.brand}` : "Marca pendiente de publicación",
      ],
      specifications: product.specifications,
    },
  ];
}
