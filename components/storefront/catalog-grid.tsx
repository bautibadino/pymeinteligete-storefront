import Link from "next/link";

import type { StorefrontCatalogProduct } from "@/lib/storefront-api";

type CatalogGridProps = {
  products: StorefrontCatalogProduct[];
  emptyTitle: string;
  emptyDescription: string;
};

function formatPrice(product: StorefrontCatalogProduct): string {
  const amount = product.price?.amount;
  const currency = product.price?.currency ?? "ARS";

  if (typeof amount !== "number") {
    return "Precio a confirmar por backend";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CatalogGrid({ products, emptyTitle, emptyDescription }: CatalogGridProps) {
  if (products.length === 0) {
    return (
      <section className="empty-state-card">
        <h3>{emptyTitle}</h3>
        <p>{emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="product-grid">
      {products.map((product, index) => (
        <article key={product.slug ?? product.productId ?? `product-${index}`} className="product-card">
          <div className="product-card-media">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name ?? "Producto"} />
            ) : (
              <div className="product-card-placeholder">
                <span>{product.name?.slice(0, 1).toUpperCase() ?? "P"}</span>
              </div>
            )}
          </div>

          <div className="product-card-body">
            <div className="product-card-meta">
              <span>{product.brand ?? product.category ?? "Catálogo público"}</span>
              <strong>{formatPrice(product)}</strong>
            </div>
            <h3>{product.name ?? "Producto sin nombre expuesto"}</h3>
            <p>
              {product.description ??
                product.sku ??
                "La descripción detallada todavía depende del payload real del backend."}
            </p>
            <div className="product-card-footer">
              <span className="availability-pill">
                {String(product.availability ?? "Disponibilidad sujeta a backend")}
              </span>
              <Link href={`/producto/${product.slug ?? ""}`}>Ver detalle</Link>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
