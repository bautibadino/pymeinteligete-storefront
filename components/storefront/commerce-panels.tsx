import Link from "next/link";
import type { Route } from "next";
import { CreditCard, ShieldCheck, ShoppingCart, Truck } from "lucide-react";

import type {
  StorefrontBootstrap,
  StorefrontPaymentMethods,
  StorefrontProductDetail,
} from "@/lib/storefront-api";

import {
  resolveModules,
  resolveTenantDescription,
  resolveTenantDisplayName,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { mapCatalogProductToCardData } from "@/components/presentation/render-context";

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

  const params = new URLSearchParams({
    productId,
    quantity: "1",
  });

  return `/checkout?${params.toString()}`;
}

export function ProductDetailPanel({ product }: ProductDetailPanelProps) {
  if (!product) {
    return (
      <section className="empty-state-card">
        <h3>Producto no disponible</h3>
        <p>
          El detalle no pudo resolverse con el `slug` actual o el backend todavía no expone el
          payload final de esta superficie.
        </p>
      </section>
    );
  }

  const normalizedProduct = mapCatalogProductToCardData(product);
  const productRecord = product as StorefrontProductDetail & Record<string, unknown>;
  const images = readProductImages(product);
  const mainImage = normalizedProduct?.imageUrl ?? images[0]?.url;
  const brand = normalizedProduct?.brand ?? product.brand ?? product.category ?? "Producto público";
  const stock = normalizedProduct?.stock;
  const isAvailable = stock === undefined || stock.available;
  const stockLabel = stock?.label ?? (isAvailable ? "Disponible para comprar" : "Sin stock");
  const productId = normalizedProduct?.id;
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
    <section className="pdp-shell">
      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link href="/catalogo">Catálogo</Link>
        <span aria-hidden="true">/</span>
        <span>{product.name ?? "Producto"}</span>
      </nav>

      <div className="pdp-layout">
        <div className="pdp-gallery">
          <div className="pdp-main-image">
            {mainImage ? (
              <img src={mainImage} alt={product.name ?? "Producto"} />
            ) : (
              <div className="product-card-placeholder spotlight-placeholder">
                <span>{product.name?.slice(0, 1).toUpperCase() ?? "P"}</span>
              </div>
            )}
          </div>

          {images.length > 1 ? (
            <div className="pdp-thumbs" aria-label="Imágenes del producto">
              {images.slice(0, 5).map((image) => (
                <span key={image.url} className="pdp-thumb">
                  <img src={image.url} alt={image.alt ?? product.name ?? "Producto"} />
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="pdp-buybox" aria-label="Información de compra">
          <div className="pdp-brand-row">
            <div>
              <span className="pdp-brand">{brand}</span>
              {modelName || sku ? (
                <p className="pdp-model">
                  {modelName ? `Modelo ${modelName}` : null}
                  {modelName && sku ? " · " : null}
                  {sku ? `SKU ${sku}` : null}
                </p>
              ) : null}
            </div>

            {dispatchType === "IMMEDIATE" ? (
              <span className="pdp-stock-badge pdp-stock-badge-live">Despacho inmediato</span>
            ) : dispatchType === "DELAYED_72H" ? (
              <span className="pdp-stock-badge pdp-stock-badge-delay">Despacho 72 hs</span>
            ) : null}
          </div>

          <h1>{product.name ?? "Producto"}</h1>

          {product.description ? (
            <p className="pdp-description">{product.description}</p>
          ) : null}

          <div className="pdp-price-card">
            <span>Precio final</span>
            <strong>{price}</strong>
            {installments ? (
              <p>
                {installments.count} cuotas de {installments.formatted}
                {installments.interestFree ? " sin interés" : ""}
              </p>
            ) : null}
          </div>

          {cashDiscount ? (
            <div className="pdp-benefit-card">
              <CreditCard aria-hidden="true" />
              <div>
                <strong>{cashDiscount.formatted}</strong>
                {savings && savings > 0 ? <span>Ahorrás {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(savings)}</span> : null}
              </div>
            </div>
          ) : null}

          <div className="pdp-purchase-actions">
            <Link
              className={`pdp-primary-cta${!isAvailable ? " pdp-primary-cta-disabled" : ""}`}
              href={(isAvailable ? checkoutHref : "/catalogo") as Route}
              aria-disabled={!isAvailable}
            >
              <ShoppingCart aria-hidden="true" />
              {isAvailable ? "Comprar ahora" : "Ver otros productos"}
            </Link>
            <Link className="pdp-secondary-cta" href="/catalogo">
              Seguir comprando
            </Link>
          </div>

          <div className="pdp-trust-grid">
            <div>
              <Truck aria-hidden="true" />
              <span>{stockLabel}</span>
            </div>
            <div>
              <ShieldCheck aria-hidden="true" />
              <span>Compra protegida por PyME Inteligente</span>
            </div>
          </div>

          {stockByBranch.length > 0 ? (
            <div className="pdp-branch-stock">
              <strong>Disponibilidad por sucursal</strong>
              <ul>
                {stockByBranch.slice(0, 4).map((branch, index) => {
                  const branchRecord = isRecord(branch) ? branch : {};
                  const branchId = readString(branchRecord.branchId) ?? `branch-${index}`;
                  const branchName = readString(branchRecord.branchName) ?? "Sucursal";
                  const branchStock = readNumber(branchRecord.stock) ?? 0;

                  return (
                    <li key={branchId}>
                      <span>{branchName}</span>
                      <strong>{branchStock} u.</strong>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </aside>
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
