import Link from "next/link";

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

  const price =
    typeof product.price?.amount === "number"
      ? new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: product.price?.currency ?? "ARS",
          maximumFractionDigits: 0,
        }).format(product.price.amount)
      : "Precio a confirmar por backend";

  return (
    <section className="product-spotlight">
      <div className="product-spotlight-media">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name ?? "Producto"} />
        ) : (
          <div className="product-card-placeholder spotlight-placeholder">
            <span>{product.name?.slice(0, 1).toUpperCase() ?? "P"}</span>
          </div>
        )}
      </div>

      <div className="product-spotlight-copy">
        <span className="eyebrow">{product.brand ?? product.category ?? "Producto público"}</span>
        <h2>{product.name ?? "Producto sin nombre expuesto"}</h2>
        <p>
          {product.description ??
            "La descripción larga del producto todavía depende de cómo el backend congele el payload final."}
        </p>

        <dl className="detail-grid">
          <div>
            <dt>Precio</dt>
            <dd>{price}</dd>
          </div>
          <div>
            <dt>Disponibilidad</dt>
            <dd>{String(product.availability ?? "Sujeta a backend")}</dd>
          </div>
          <div>
            <dt>SKU</dt>
            <dd>{product.sku ?? "No expuesto"}</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>{String(product.deliveryInfo ?? "A definir por backend")}</dd>
          </div>
        </dl>
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
