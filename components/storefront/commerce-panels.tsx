import { CreditCard, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  resolveModules,
  resolveTenantDescription,
  resolveTenantDisplayName,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { mapCatalogProductToCardData } from "@/components/presentation/render-context";
import type {
  StorefrontBootstrap,
  StorefrontPaymentMethods,
  StorefrontProductDetail,
} from "@/lib/storefront-api";

function formatMoney(amount: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

type HomeHeroProps = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
};

export function HomeHero({ bootstrap, host }: HomeHeroProps) {
  const displayName = resolveTenantDisplayName(bootstrap, host);
  const description =
    resolveTenantDescription(bootstrap) ??
    "La tienda pública se resuelve por host y consume bootstrap multi-tenant desde PyMEInteligente.";
  const modules = resolveModules(bootstrap);

  return (
    <section className="hero-stage">
      <div className="hero-copy">
        <span className="eyebrow">Experiencia pública host-driven</span>
        <h2>{displayName}</h2>
        <p>{description}</p>
        <div className="hero-actions">
          <Link className="primary-action" href="/catalogo">
            Explorar catálogo
          </Link>
          <Link className="secondary-action" href="/checkout">
            Ver checkout
          </Link>
        </div>
      </div>

      <div className="hero-aside">
        <div className="hero-stat">
          <span>Host actual</span>
          <strong className="mono">{host}</strong>
        </div>
        <div className="hero-stat">
          <span>Módulos bootstrap</span>
          <strong>{modules.length}</strong>
        </div>
        <div className="hero-stat">
          <span>Tenant slug</span>
          <strong>{bootstrap?.tenant?.tenantSlug ?? "pendiente de backend"}</strong>
        </div>
      </div>
    </section>
  );
}

type ModuleDeckProps = {
  bootstrap: StorefrontBootstrap | null;
};

export function ModuleDeck({ bootstrap }: ModuleDeckProps) {
  const modules = resolveModules(bootstrap);

  if (modules.length === 0) {
    return (
      <section className="empty-state-card">
        <h3>Módulos comerciales pendientes</h3>
        <p>
          El bootstrap actual todavía no expone módulos de home listos para render. La shell queda
          preparada para integrarlos sin redefinir arquitectura.
        </p>
      </section>
    );
  }

  return (
    <section className="module-deck">
      {modules.map((module: import("@/lib/storefront-api").StorefrontContentModule, index: number) => {
        const payloadTitle =
          typeof module.payload === "object" && module.payload !== null && "title" in module.payload
            ? String((module.payload as Record<string, unknown>).title)
            : undefined;

        return (
          <article key={module.id ?? `module-${index}`} className="module-panel">
            <span className="eyebrow">{module.type ?? "modulo"}</span>
            <h3>{payloadTitle ?? "Contenido configurable"}</h3>
            <p>
              Este panel representa un módulo de home expuesto por bootstrap. El render específico
              queda abierto hasta congelar la forma final del backend.
            </p>
          </article>
        );
      })}
    </section>
  );
}

type ProductDetailPanelProps = {
  product: StorefrontProductDetail | null;
};

type ProductImageView = {
  url: string;
  alt?: string;
};

type ProductStockView = {
  available: boolean;
  label?: string;
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

function readProductImages(product: StorefrontProductDetail): ProductImageView[] {
  const record = product as StorefrontProductDetail & Record<string, unknown>;
  const images = Array.isArray(record.images) ? record.images : [];

  return images
    .map((image): ProductImageView | null => {
      if (typeof image === "string" && image.trim()) {
        return { url: image.trim(), alt: product.name };
      }

      if (isRecord(image)) {
        const url = readString(image.url) ?? readString(image.src) ?? readString(image.imageUrl);
        const alt = readString(image.alt) ?? product.name;
        return url ? { url, alt } : null;
      }

      return null;
    })
    .filter((image): image is ProductImageView => image !== null);
}

function buildCheckoutHref(productId: string | undefined): string {
  if (!productId) return "/checkout";

  const params = new URLSearchParams({ productId, quantity: "1" });
  return `/checkout?${params.toString()}`;
}

function resolveProductPurchaseState({
  productId,
  stock,
}: {
  productId?: string | undefined;
  stock?: ProductStockView | undefined;
}) {
  const hasExplicitAvailability = stock !== undefined;
  const canPurchase = Boolean(productId && hasExplicitAvailability && stock?.available);
  const stockLabel = stock?.label ?? "Disponibilidad a confirmar";

  return { canPurchase, stockLabel };
}

export function ProductDetailPanel({ product }: ProductDetailPanelProps) {
  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Producto no disponible</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          El detalle no pudo resolverse con el slug actual.
        </CardContent>
      </Card>
    );
  }

  const normalizedProduct = mapCatalogProductToCardData(product);
  const productRecord = product as StorefrontProductDetail & Record<string, unknown>;
  const images = readProductImages(product);
  const mainImage = normalizedProduct?.imageUrl ?? images[0]?.url;
  const brand = normalizedProduct?.brand ?? product.brand ?? product.category ?? "Producto público";
  const stock = normalizedProduct?.stock;
  const productId = normalizedProduct?.id;
  const { canPurchase, stockLabel } = resolveProductPurchaseState({ productId, stock });
  const checkoutHref = buildCheckoutHref(productId);
  const installments = normalizedProduct?.installments;
  const cashDiscount = normalizedProduct?.cashDiscount;
  const dispatchType = readString(productRecord.dispatchType);
  const stockByBranch = Array.isArray(productRecord.stockByBranch) ? productRecord.stockByBranch : [];
  const modelName = readString(productRecord.modelName);
  const sku = readString(product.sku);
  const price = normalizedProduct?.price.formatted ?? "Precio a confirmar";
  const discountedPrice = readNumber(productRecord.discountedPrice);
  const savings =
    typeof normalizedProduct?.price.amount === "number" && discountedPrice
      ? normalizedProduct.price.amount - discountedPrice
      : undefined;

  return (
    <section className="grid gap-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link className="font-semibold text-foreground hover:underline" href="/">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link className="font-semibold text-foreground hover:underline" href="/catalogo">
          Catálogo
        </Link>
        <span aria-hidden="true">/</span>
        <span>{product.name ?? "Producto"}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:gap-14">
        <div className="grid gap-4">
          <Card className="overflow-hidden rounded-[28px] border-slate-200 bg-slate-50 shadow-none">
            <div className="grid min-h-[340px] place-items-center md:min-h-[560px]">
              {mainImage ? (
                <img
                  className="h-full max-h-[560px] w-full object-contain p-6 md:p-12"
                  src={mainImage}
                  alt={product.name ?? "Producto"}
                />
              ) : (
                <div className="grid h-full min-h-[340px] w-full place-items-center bg-gradient-to-br from-slate-100 to-amber-50 text-5xl font-bold text-slate-400">
                  {product.name?.slice(0, 1).toUpperCase() ?? "P"}
                </div>
              )}
            </div>
          </Card>

          {images.length > 1 ? (
            <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Imágenes del producto">
              {images.slice(0, 5).map((image) => (
                <Card key={image.url} className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-slate-200 bg-white p-2 shadow-none">
                  <img className="h-full w-full object-contain" src={image.url} alt={image.alt ?? product.name ?? "Producto"} />
                </Card>
              ))}
            </div>
          ) : null}
        </div>

        <Card className="h-fit rounded-[28px] border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:sticky lg:top-36">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge variant="outline" className="uppercase tracking-[0.14em]">
                  {brand}
                </Badge>
                {modelName || sku ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {modelName ? `Modelo ${modelName}` : null}
                    {modelName && sku ? " · " : null}
                    {sku ? `SKU ${sku}` : null}
                  </p>
                ) : null}
              </div>

              {dispatchType === "IMMEDIATE" ? (
                <Badge variant="success">Despacho inmediato</Badge>
              ) : dispatchType === "DELAYED_72H" ? (
                <Badge variant="warning">Despacho 72 hs</Badge>
              ) : null}
            </div>

            <h1 className="text-3xl font-black leading-none tracking-[-0.055em] text-slate-950 md:text-5xl">
              {product.name ?? "Producto"}
            </h1>

            {product.description ? (
              <p className="text-sm leading-7 text-muted-foreground md:text-base">{product.description}</p>
            ) : null}
          </CardHeader>

          <CardContent className="grid gap-4">
            <Card className="rounded-3xl border-slate-200 bg-slate-50 shadow-none">
              <CardContent className="grid gap-2 p-5">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Precio final</span>
                <strong className="text-3xl font-black tracking-[-0.05em] text-slate-950 md:text-5xl">{price}</strong>
                {installments ? (
                  <p className="font-bold text-emerald-700">
                    {installments.count} cuotas de {installments.formatted}
                    {installments.interestFree ? " sin interés" : ""}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {cashDiscount ? (
              <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <CreditCard className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div className="grid gap-1">
                  <strong>{cashDiscount.formatted}</strong>
                  {savings && savings > 0 ? <span className="text-sm">Ahorrás {formatMoney(savings)}</span> : null}
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button asChild size="lg" className="h-14 rounded-2xl text-base font-black shadow-lg shadow-slate-950/15" variant={canPurchase ? "default" : "secondary"}>
                <Link href={(canPurchase ? checkoutHref : "/catalogo") as Route} aria-disabled={!canPurchase}>
                  <ShoppingCart className="size-5" aria-hidden="true" />
                  {canPurchase ? "Comprar ahora" : "Ver otros productos"}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-2xl font-black">
                <Link href="/catalogo">Seguir comprando</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm font-semibold text-slate-600">
                <Truck className="size-5 shrink-0 text-slate-950" aria-hidden="true" />
                <span>{stockLabel}</span>
              </div>
              <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm font-semibold text-slate-600">
                <ShieldCheck className="size-5 shrink-0 text-slate-950" aria-hidden="true" />
                <span>Compra protegida por PyME Inteligente</span>
              </div>
            </div>

            {stockByBranch.length > 0 ? (
              <div className="grid gap-3 pt-1">
                <Separator />
                <strong>Disponibilidad por sucursal</strong>
                <ul className="grid gap-2 text-sm text-muted-foreground">
                  {stockByBranch.slice(0, 4).map((branch, index) => {
                    const branchRecord = isRecord(branch) ? branch : {};
                    const branchId = readString(branchRecord.branchId) ?? `branch-${index}`;
                    const branchName = readString(branchRecord.branchName) ?? "Sucursal";
                    const branchStock = readNumber(branchRecord.stock) ?? 0;

                    return (
                      <li key={branchId} className="flex justify-between gap-3">
                        <span>{branchName}</span>
                        <strong className="text-foreground">{branchStock} u.</strong>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

type PaymentMethodsPanelProps = {
  paymentMethods: StorefrontPaymentMethods | null;
};

export function PaymentMethodsPanel({ paymentMethods }: PaymentMethodsPanelProps) {
  const items = paymentMethods?.paymentMethods ?? [];

  if (items.length === 0) {
    return (
      <section className="empty-state-card">
        <h3>Métodos de pago visibles</h3>
        <p>
          La superficie existe, pero el backend actual todavía no devolvió métodos visibles o no
          pudo resolverse el payload final para este tenant.
        </p>
      </section>
    );
  }

  return (
    <section className="payment-strip">
      {items.map((method: import("@/lib/storefront-api").StorefrontPaymentMethod, index: number) => (
        <article key={method.methodId ?? `payment-${index}`} className="payment-card">
          <span>{method.methodType ?? "provider"}</span>
          <strong>{method.displayName ?? "Método activo"}</strong>
          <p>{method.description ?? "Disponibilidad operativa sujeta a backend."}</p>
        </article>
      ))}
    </section>
  );
}
