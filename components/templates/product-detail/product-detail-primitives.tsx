import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  BadgeCheck,
  CircleAlert,
  CreditCard,
  Info,
  MessageSquareText,
  Package,
  Sparkles,
  Truck,
} from "lucide-react";

import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
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
  shippingMessage?: string | undefined;
  reviewsEnabled?: boolean | undefined;
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
  "rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_28px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl";

const INNER_PANEL =
  "rounded-[24px] border border-white/10 bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

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

  if (product.installments) {
    facts.push({
      id: "installments",
      label: "Financiación",
      value: `${product.installments.count} cuotas de ${product.installments.formatted}${product.installments.interestFree ? " sin interés" : ""}`,
      icon: <CreditCard className="size-4" aria-hidden="true" />,
    });
  }

  if (product.cashDiscount) {
    facts.push({
      id: "cash-discount",
      label: "Pago",
      value: product.cashDiscount.formatted,
      icon: <Sparkles className="size-4" aria-hidden="true" />,
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

  if (product.freeShipping || product.dispatch || commercialData?.shippingMessage) {
    signals.push({
      id: "shipping",
      label: "Entrega",
      value: product.freeShipping
        ? "Envío gratis"
        : product.dispatch?.label ?? "Logística publicada",
      detail: commercialData?.shippingMessage ?? product.dispatch?.label,
      icon: <Truck className="size-4" aria-hidden="true" />,
      emphasized: Boolean(product.freeShipping),
    });
  }

  if (commercialData?.reviewsEnabled) {
    signals.push({
      id: "reviews",
      label: "Opiniones",
      value: "Reseñas habilitadas",
      detail: "Signal comercial del canal",
      icon: <MessageSquareText className="size-4" aria-hidden="true" />,
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
  const shippingMessage = readString(record.shippingMessage);
  const reviewsEnabled = readBoolean(record.reviewsEnabled);

  if (
    paymentMethods.length === 0 &&
    !shippingMessage &&
    typeof reviewsEnabled !== "boolean"
  ) {
    return undefined;
  }

  return {
    paymentMethods,
    ...(shippingMessage ? { shippingMessage } : {}),
    ...(typeof reviewsEnabled === "boolean" ? { reviewsEnabled } : {}),
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
    <section className="py-5 md:py-8" data-surface="product-detail-premium">
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={cn(
            "relative overflow-hidden rounded-[34px] border border-white/10 bg-foreground text-white shadow-[0_38px_130px_rgba(0,0,0,0.34)]",
            "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_34%)] before:content-['']",
            "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--module-accent)_18%,transparent),transparent_30%)] after:content-['']",
            className,
          )}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_24%,rgba(0,0,0,0.16))]" />
          <div className="relative z-10 p-5 md:p-8 lg:p-10">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function ProductDetailEmptyState() {
  return (
    <ProductDetailShell>
      <div className={productDetailCardClassName("px-6 py-14 text-center")}>
        <p className="font-heading text-2xl font-semibold text-white md:text-3xl">
          Producto no disponible
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/68 md:text-base">
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
        "mb-6 text-xs font-medium uppercase tracking-[0.18em] text-white/52 md:mb-8",
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-2 md:gap-3">
        <li>
          <Link
            href="/"
            className="transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
          >
            Inicio
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href={"/catalogo" as Route}
            className="transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
          >
            Catálogo
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-white" aria-current="page">
          {productName}
        </li>
      </ol>
    </nav>
  );
}

export function ProductDetailBadgeGroup({
  badges,
  className,
}: ProductDetailBadgeGroupProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge, index) => (
        <Badge
          key={`${badge.label}-${index}`}
          variant={mapBadgeVariant(badge.tone)}
          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white shadow-none"
        >
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}

export function ProductDetailPriceStack({
  product,
  className,
}: ProductDetailPriceStackProps) {
  const savings = getSavings(product);

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <p className="font-heading text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
            {product.price.formatted}
          </p>
          {product.compareAtPrice ? (
            <p className="text-sm text-white/46 line-through md:text-base">
              {product.compareAtPrice.formatted}
            </p>
          ) : null}
        </div>

        {savings ? (
          <div className="inline-flex w-fit items-center rounded-full border border-[color:color-mix(in_srgb,var(--accent)_40%,white_10%)] bg-[color:color-mix(in_srgb,var(--accent)_18%,transparent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Ahorrás {savings.formatted}
          </div>
        ) : null}
      </div>

      {product.installments || product.cashDiscount ? (
        <div className={productDetailInnerPanelClassName("grid gap-2 px-4 py-3")}>
          {product.installments ? (
            <p className="text-sm leading-6 text-white/72">
              {product.installments.count} cuotas de {product.installments.formatted}
              {product.installments.interestFree ? " sin interés" : ""}
            </p>
          ) : null}
          {product.cashDiscount ? (
            <p className="text-sm font-medium leading-6 text-white">
              {product.cashDiscount.formatted}
            </p>
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

  return (
    <aside className={productDetailCardClassName(cn("grid gap-6 p-5 md:p-6", className))}>
      <div className="grid gap-4">
        {product.brand ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/54">
            {product.brand}
          </span>
        ) : null}

        <div className="grid gap-3">
          <h1 className="font-heading text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-white md:text-5xl">
            {product.name}
          </h1>
          <ProductDetailBadgeGroup badges={product.badges} />
        </div>

        {description ? (
          <p className="max-w-[54ch] text-sm leading-7 text-white/70 md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      <ProductDetailPriceStack product={product} />

      <div className={productDetailInnerPanelClassName("grid gap-3 p-4")}>
        <AddToCartButton
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            href: product.href,
            price: product.price,
            ...(product.brand ? { brand: product.brand } : {}),
            ...(mainImage?.url ? { imageUrl: mainImage.url } : {}),
          }}
          size="lg"
          className="h-14 w-full rounded-[18px] text-base font-semibold shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:translate-y-[-1px] motion-reduce:transition-none"
          disabled={!isAvailable}
          unavailableLabel="No disponible"
        />

        <div className="grid gap-2">
          {facts.map((fact) => (
            <div
              key={fact.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3"
            >
              <div className="mt-0.5 text-white/66">{fact.icon}</div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  {fact.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-white/78">{fact.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {commercialSignals.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">
            Señales comerciales
          </p>
          <div className="grid gap-2">
            {commercialSignals.map((signal) => (
              <div
                key={signal.id}
                className={cn(
                  "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-[18px] border px-3 py-3",
                  signal.emphasized
                    ? "border-white/16 bg-white/[0.06]"
                    : "border-white/10 bg-white/[0.03]",
                )}
              >
                <div className="mt-0.5 text-white/72">{signal.icon}</div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">
                    {signal.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/84">{signal.value}</p>
                  {signal.detail ? (
                    <p className="text-xs leading-5 text-white/58">{signal.detail}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {quickSpecs.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">
            Snapshot técnico
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickSpecs.map((spec, index) => (
              <div
                key={`${spec.label}-${index}`}
                className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/42">
                  {spec.label}
                </p>
                <p className="mt-1 text-sm font-medium leading-6 text-white/84">
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
        <div className="rounded-full border border-white/10 bg-white/[0.06] p-2 text-white/72">
          <Sparkles className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-white">
            Relacionados
          </h2>
          <p className="mt-1 text-sm leading-6 text-white/62">
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
        <div className="mt-0.5 rounded-full border border-white/10 bg-white/[0.06] p-2 text-white/72">
          <Info className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-white">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-white/68 md:text-base">{body}</p>
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
        <div className="rounded-full border border-white/10 bg-white/[0.06] p-2 text-white/74">
          <Package className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-white">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-white/64">{description}</p>
          ) : null}
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {visibleSpecifications.map((spec, index) => (
          <div
            key={`${spec.label}-${index}`}
            className={productDetailInnerPanelClassName("px-4 py-3")}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/42">
              {spec.label}
            </dt>
            <dd className="mt-1 text-sm font-medium leading-6 text-white/82">{spec.value}</dd>
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
  const shippingParagraphs = [
    product.freeShipping
      ? "Este producto participa de beneficios logísticos publicados por la tienda, incluyendo envío gratis cuando aplica."
      : null,
    product.dispatch?.label
      ? `Modalidad de despacho actual: ${product.dispatch.label}.`
      : null,
    commercialData?.shippingMessage
      ? commercialData.shippingMessage
      : null,
  ].filter((paragraph): paragraph is string => Boolean(paragraph));

  const shippingNotes = [
    product.stock?.label
      ? `Estado actual: ${product.stock.label}`
      : "Estado actual: disponibilidad sin detalle público",
    commercialData?.paymentMethods?.length
      ? `Pago visible: ${commercialData.paymentMethods.slice(0, 3).join(" · ")}`
      : null,
    commercialData?.reviewsEnabled
      ? "La tienda tiene social proof habilitado para el canal."
      : null,
  ].filter((note): note is string => Boolean(note));

  return [
    {
      id: "description",
      label: "Descripción",
      eyebrow: "Overview",
      title: "Contexto del producto",
      paragraphs: descriptionParagraphs,
      notes: [
        product.brand ? `Marca: ${product.brand}` : "Marca pendiente de publicación",
        product.badges && product.badges.length > 0
          ? `Distinciones: ${product.badges.map((badge) => badge.label).join(" · ")}`
          : "Sin badges comerciales configurados",
      ],
    },
    {
      id: "specs",
      label: "Especificaciones",
      eyebrow: "Ficha técnica",
      title: "Detalles técnicos relevantes",
      paragraphs:
        product.specifications && product.specifications.length > 0
          ? ["Las especificaciones disponibles se listan en este bloque para facilitar comparación y decisión."]
          : ["La ficha técnica todavía no expone atributos específicos para este producto."],
      specifications: product.specifications,
    },
    {
      id: "shipping",
      label: "Envíos",
      eyebrow: "Logística",
      title: "Entrega y disponibilidad",
      paragraphs:
        shippingParagraphs.length > 0
          ? shippingParagraphs
          : [
              "La información logística todavía no está publicada para este producto dentro del storefront.",
              "Cuando el canal exponga cobertura, tiempos y retiro, aparecerán en esta sección.",
            ],
      notes: shippingNotes,
    },
  ];
}
