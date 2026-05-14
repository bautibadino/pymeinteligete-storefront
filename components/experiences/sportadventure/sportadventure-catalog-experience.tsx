"use client";

import Link from "next/link";
import type { Route } from "next";

import type {
  StorefrontBootstrap,
  StorefrontCatalog,
  StorefrontCatalogProduct,
  StorefrontCatalogQuery,
  StorefrontCategory,
} from "@/lib/storefront-api";

type SportAdventureCatalogExperienceProps = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
  catalog: StorefrontCatalog | null;
  categories?: StorefrontCategory[] | null;
  query?: Partial<StorefrontCatalogQuery>;
  className?: string;
};

type FilterChip = {
  key: string;
  label: string;
  value: string;
};

const CATALOG_COPY = {
  eyebrow: "SportAdventure",
  title: "Motos, equipamiento y taller en una sola salida",
  description:
    "Una vidriera pensada para explorar unidades, indumentaria técnica, repuestos y servicios con una lectura rápida desde el celular.",
  emptyTitle: "No encontramos publicaciones para esta combinación",
  emptyDescription:
    "Probá limpiar filtros o entrar desde una familia distinta para volver a abrir opciones.",
} as const;

const CATEGORY_FALLBACKS = [
  { label: "Motos", slug: "motos" },
  { label: "Indumentaria", slug: "indumentaria" },
  { label: "Repuestos", slug: "repuestos" },
  { label: "Taller", slug: "taller" },
] as const;

const SERVICE_PANELS = [
  {
    kicker: "Seleccionadas",
    title: "Motos listas para salir",
    description: "Adventure, naked y off-road con foco en disponibilidad visible y acceso directo al detalle.",
  },
  {
    kicker: "Equipamiento",
    title: "Capas, cascos y protección",
    description: "Indumentaria para ruta y ciudad con lectura simple de marcas, precios y familias.",
  },
  {
    kicker: "Soporte",
    title: "Repuestos y taller",
    description: "Un espacio pensado para resolver mantenimiento, service y partes sin fricción.",
  },
] as const;

const BRAND_NAME = "SportAdventure";

function getDisplayName(bootstrap: StorefrontBootstrap | null, host: string) {
  const candidate =
    bootstrap?.branding?.storeName?.trim() ||
    bootstrap?.branding?.name?.trim() ||
    bootstrap?.tenant?.tenantSlug?.trim() ||
    host;

  if (candidate && /sport\s*adventure/i.test(candidate)) {
    return candidate;
  }

  return BRAND_NAME;
}

function getLogoUrl(bootstrap: StorefrontBootstrap | null) {
  return bootstrap?.branding?.logoUrl?.trim() || null;
}

function getCategoryLabel(category: StorefrontCategory) {
  return category.name?.trim() || category.slug?.trim() || "Categoria";
}

function getCategorySlug(category: StorefrontCategory) {
  return category.slug?.trim() || category.categoryId?.trim() || null;
}

function getCategoryTiles(categories?: StorefrontCategory[] | null) {
  if (categories && categories.length > 0) {
    return categories.slice(0, 4).map((category) => ({
      label: getCategoryLabel(category),
      slug: getCategorySlug(category),
      imageUrl: category.imageUrl?.trim() || null,
      description: category.description?.trim() || null,
    }));
  }

  return CATEGORY_FALLBACKS.map((item) => ({
    label: item.label,
    slug: item.slug,
    imageUrl: null,
    description: null,
  }));
}

function formatPrice(product: StorefrontCatalogProduct) {
  const amount = product.price?.amount;
  const currency = product.price?.currency || "ARS";

  if (typeof amount !== "number") {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getAvailabilityLabel(product: StorefrontCatalogProduct) {
  const raw = product.availability;

  if (typeof raw === "string" && raw.trim()) {
    return raw.trim();
  }

  if (typeof raw === "boolean") {
    return raw ? "Disponible" : "Sin stock visible";
  }

  if (raw && typeof raw === "object") {
    const stockLabel = normalizeText((raw as { label?: string }).label);
    if (stockLabel) {
      return stockLabel;
    }

    const status = normalizeText((raw as { status?: string }).status);
    if (status) {
      return status;
    }
  }

  return "Disponibilidad a confirmar";
}

function buildCatalogHref(query: Partial<StorefrontCatalogQuery>, overrides: Partial<StorefrontCatalogQuery> = {}) {
  const params = new URLSearchParams();
  const merged = { ...query, ...overrides };

  (Object.entries(merged) as [keyof StorefrontCatalogQuery, StorefrontCatalogQuery[keyof StorefrontCatalogQuery]][])
    .forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      params.set(String(key), String(value));
    });

  const search = params.toString();
  return search ? ({ pathname: "/catalogo", query: Object.fromEntries(params) } as const) : ("/catalogo" as Route);
}

function resolveFilterChips(query: Partial<StorefrontCatalogQuery>) {
  const chips: FilterChip[] = [];

  if (query.search) {
    chips.push({ key: "search", label: "Busqueda", value: query.search });
  }

  if (query.category) {
    chips.push({ key: "category", label: "Categoria", value: query.category });
  }

  if (query.brand) {
    chips.push({ key: "brand", label: "Marca", value: query.brand });
  }

  if (query.sortBy) {
    const sortLabel = query.sortOrder
      ? `${query.sortBy} · ${query.sortOrder}`
      : query.sortBy;
    chips.push({ key: "sort", label: "Orden", value: sortLabel });
  }

  if (typeof query.availability === "string" && query.availability.trim()) {
    chips.push({
      key: "availability",
      label: "Disponibilidad",
      value: query.availability,
    });
  }

  return chips;
}

function resolvePaginationSummary(catalog: StorefrontCatalog | null) {
  const page = catalog?.pagination?.page;
  const totalPages = catalog?.pagination?.totalPages;
  const totalItems = catalog?.pagination?.totalItems;

  if (
    typeof page === "number" &&
    typeof totalPages === "number" &&
    typeof totalItems === "number" &&
    totalPages > 0
  ) {
    return `Pagina ${page} de ${totalPages} · ${totalItems} publicaciones`;
  }

  if (typeof totalItems === "number") {
    return `${totalItems} publicaciones`;
  }

  return `${catalog?.products.length ?? 0} publicaciones`;
}

function ProductCard({ product }: { product: StorefrontCatalogProduct }) {
  const href = product.slug ? (`/producto/${product.slug}` as Route) : ("/catalogo" as Route);
  const title = product.name?.trim() || "Producto";
  const overline = product.brand?.trim() || product.category?.trim() || "SportAdventure";
  const description =
    product.description?.trim() ||
    product.sku?.trim() ||
    "Ficha breve disponible para ampliar desde el detalle.";

  return (
    <article className="sa-product-card">
      <Link href={href} className="sa-product-media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={title} />
        ) : (
          <div className="sa-product-placeholder" aria-hidden="true">
            <span>{title.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
      </Link>

      <div className="sa-product-body">
        <div className="sa-product-meta">
          <span>{overline}</span>
          <strong>{formatPrice(product)}</strong>
        </div>

        <h3>{title}</h3>
        <p>{description}</p>

        <div className="sa-product-footer">
          <span className="sa-availability">{getAvailabilityLabel(product)}</span>
          <Link href={href}>Ver detalle</Link>
        </div>
      </div>
    </article>
  );
}

export function SportAdventureCatalogExperience({
  bootstrap,
  host,
  catalog,
  categories,
  query,
  className,
}: SportAdventureCatalogExperienceProps) {
  const resolvedQuery = query ?? {};
  const displayName = getDisplayName(bootstrap, host);
  const logoUrl = getLogoUrl(bootstrap);
  const heroTitle = CATALOG_COPY.title;
  const categoryTiles = getCategoryTiles(categories);
  const filterChips = resolveFilterChips(resolvedQuery);
  const products = catalog?.products ?? [];
  const pagination = catalog?.pagination;
  const currentPage = typeof pagination?.page === "number" ? pagination.page : 1;
  const totalPages = typeof pagination?.totalPages === "number" ? pagination.totalPages : 1;
  const phone = bootstrap?.contact?.phone?.trim() || bootstrap?.contact?.whatsapp?.trim() || null;
  const contactHref = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : "/checkout";

  return (
    <section className={["sa-catalog-shell", className].filter(Boolean).join(" ")}>
      <div className="sa-backdrop" aria-hidden="true" />

      <header className="sa-hero">
        <div className="sa-brand-row">
          <div className="sa-brand-lockup">
            <span className="sa-kicker">{CATALOG_COPY.eyebrow}</span>
            {logoUrl ? (
              <img src={logoUrl} alt={displayName} className="sa-logo" />
            ) : (
              <strong className="sa-wordmark">{displayName}</strong>
            )}
          </div>
          <Link href="/" className="sa-hero-link">
            Volver al inicio
          </Link>
        </div>

        <div className="sa-hero-grid">
          <div className="sa-hero-copy">
            <span className="sa-section-label">Catalogo</span>
            <h1>{heroTitle}</h1>
            <p>{CATALOG_COPY.description}</p>

            <div className="sa-hero-actions">
              <Link href="/checkout" className="sa-primary-action">
                Coordinar compra
              </Link>
              {phone ? (
                <a href={contactHref} className="sa-secondary-action" target="_blank" rel="noreferrer">
                  Hablar con taller
                </a>
              ) : (
                <Link href="/checkout" className="sa-secondary-action">
                  Hablar con taller
                </Link>
              )}
            </div>
          </div>

          <div className="sa-hero-stats">
            <div className="sa-stat-card sa-stat-card-accent">
              <span>Publicaciones</span>
              <strong>{catalog?.pagination?.totalItems ?? products.length}</strong>
              <small>{resolvePaginationSummary(catalog)}</small>
            </div>

            <div className="sa-stat-card">
              <span>Familias activas</span>
              <strong>{categoryTiles.length}</strong>
              <small>Motos, equipamiento, repuestos y taller</small>
            </div>

            <div className="sa-stat-card">
              <span>Contacto rapido</span>
              <strong>{phone ?? "Checkout online"}</strong>
              <small>Canal directo para consultas comerciales y service</small>
            </div>
          </div>
        </div>
      </header>

      <section className="sa-category-strip" aria-label="Atajos por familia">
        {categoryTiles.map((category, index) => {
          const href = category.slug
            ? buildCatalogHref(resolvedQuery, { category: category.slug, page: 1 })
            : "/catalogo";

          return (
            <Link href={href} className="sa-category-tile" key={`${category.label}-${index}`}>
              <div className="sa-category-visual">
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.label} />
                ) : (
                  <span>{String(index + 1).padStart(2, "0")}</span>
                )}
              </div>

              <div className="sa-category-copy">
                <strong>{category.label}</strong>
                <p>{category.description || "Explorar seleccionados de esta familia."}</p>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="sa-service-panels" aria-label="Puntos destacados">
        {SERVICE_PANELS.map((panel) => (
          <article key={panel.title} className="sa-service-card">
            <span>{panel.kicker}</span>
            <h2>{panel.title}</h2>
            <p>{panel.description}</p>
          </article>
        ))}
      </section>

      <section className="sa-results-head">
        <div>
          <span className="sa-section-label">Resultados</span>
          <h2>Explorá el frente comercial</h2>
          <p>{resolvePaginationSummary(catalog)}</p>
        </div>

        <div className="sa-results-actions">
          <Link
            href={buildCatalogHref(resolvedQuery, {
              sortBy: "price",
              sortOrder: "desc",
              page: 1,
            })}
          >
            Mayor precio
          </Link>
          <Link
            href={buildCatalogHref(resolvedQuery, {
              sortBy: "price",
              sortOrder: "asc",
              page: 1,
            })}
          >
            Menor precio
          </Link>
          <Link href="/catalogo">Limpiar</Link>
        </div>
      </section>

      {filterChips.length > 0 ? (
        <div className="sa-filter-row" aria-label="Filtros activos">
          {filterChips.map((chip) => (
            <span className="sa-filter-chip" key={chip.key}>
              <strong>{chip.label}</strong>
              <span>{chip.value}</span>
            </span>
          ))}
        </div>
      ) : null}

      {products.length > 0 ? (
        <section className="sa-product-grid" aria-label="Productos del catalogo">
          {products.map((product, index) => (
            <ProductCard
              key={product.slug ?? product.productId ?? product.sku ?? `product-${index}`}
              product={product}
            />
          ))}
        </section>
      ) : (
        <section className="sa-empty-state">
          <span className="sa-section-label">Sin resultados</span>
          <h2>{CATALOG_COPY.emptyTitle}</h2>
          <p>{CATALOG_COPY.emptyDescription}</p>
          <div className="sa-hero-actions">
            <Link href="/catalogo" className="sa-primary-action">
              Ver catalogo completo
            </Link>
            {phone ? (
              <a href={contactHref} className="sa-secondary-action" target="_blank" rel="noreferrer">
                Pedir asistencia
              </a>
            ) : (
              <Link href="/checkout" className="sa-secondary-action">
                Pedir asistencia
              </Link>
            )}
          </div>
        </section>
      )}

      {totalPages > 1 ? (
        <nav className="sa-pagination" aria-label="Paginacion del catalogo">
          <Link
            href={buildCatalogHref(resolvedQuery, { page: Math.max(1, currentPage - 1) })}
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? "is-disabled" : undefined}
          >
            Anterior
          </Link>
          <span>
            Pagina {currentPage} / {totalPages}
          </span>
          <Link
            href={buildCatalogHref(resolvedQuery, { page: Math.min(totalPages, currentPage + 1) })}
            aria-disabled={currentPage >= totalPages}
            className={currentPage >= totalPages ? "is-disabled" : undefined}
          >
            Siguiente
          </Link>
        </nav>
      ) : null}

      <style jsx>{`
        .sa-catalog-shell {
          --sa-bg: #050505;
          --sa-panel: rgba(14, 14, 14, 0.92);
          --sa-panel-alt: rgba(21, 21, 21, 0.84);
          --sa-line: rgba(255, 255, 255, 0.12);
          --sa-text: #f7f5f1;
          --sa-muted: rgba(247, 245, 241, 0.68);
          --sa-orange: #ff6600;
          --sa-orange-soft: rgba(255, 102, 0, 0.18);
          --sa-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
          position: relative;
          overflow: hidden;
          color: var(--sa-text);
          background:
            radial-gradient(circle at top left, rgba(255, 102, 0, 0.22), transparent 32%),
            linear-gradient(180deg, #0b0b0b 0%, #050505 54%, #0f0f0f 100%);
          padding: 20px 16px 40px;
        }

        .sa-backdrop {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
          mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.92), transparent);
        }

        .sa-hero,
        .sa-category-strip,
        .sa-service-panels,
        .sa-results-head,
        .sa-filter-row,
        .sa-product-grid,
        .sa-empty-state,
        .sa-pagination {
          position: relative;
          z-index: 1;
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        .sa-hero {
          padding: 14px 0 28px;
        }

        .sa-brand-row,
        .sa-results-head,
        .sa-pagination {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sa-brand-lockup {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sa-kicker,
        .sa-section-label,
        .sa-service-card span,
        .sa-product-meta span,
        .sa-stat-card span {
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .sa-kicker,
        .sa-section-label,
        .sa-service-card span,
        .sa-product-meta span,
        .sa-stat-card span {
          color: var(--sa-muted);
        }

        .sa-logo {
          max-width: 180px;
          max-height: 42px;
          object-fit: contain;
        }

        .sa-wordmark {
          font-size: 1.7rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .sa-hero-link,
        .sa-results-actions a,
        .sa-product-footer a,
        .sa-pagination a {
          color: var(--sa-text);
          text-decoration: none;
        }

        .sa-hero-link {
          align-self: flex-start;
          border: 1px solid var(--sa-line);
          border-radius: 999px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.04);
        }

        .sa-hero-grid {
          display: grid;
          gap: 18px;
          margin-top: 18px;
        }

        .sa-hero-copy,
        .sa-hero-stats,
        .sa-service-card,
        .sa-empty-state,
        .sa-stat-card,
        .sa-results-actions,
        .sa-filter-chip,
        .sa-category-tile,
        .sa-product-card {
          backdrop-filter: blur(10px);
        }

        .sa-hero-copy {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
          border: 1px solid var(--sa-line);
          border-radius: 28px;
          padding: 24px 20px;
          box-shadow: var(--sa-shadow);
        }

        .sa-hero-copy h1,
        .sa-results-head h2,
        .sa-empty-state h2 {
          margin: 10px 0 12px;
          font-size: clamp(2.2rem, 7vw, 4.2rem);
          line-height: 0.98;
          text-transform: uppercase;
        }

        .sa-results-head h2,
        .sa-empty-state h2 {
          font-size: clamp(1.6rem, 4.8vw, 2.4rem);
        }

        .sa-hero-copy p,
        .sa-service-card p,
        .sa-results-head p,
        .sa-empty-state p,
        .sa-category-copy p,
        .sa-product-body p,
        .sa-stat-card small {
          margin: 0;
          color: var(--sa-muted);
          line-height: 1.55;
        }

        .sa-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }

        .sa-primary-action,
        .sa-secondary-action {
          border-radius: 999px;
          padding: 12px 18px;
          text-decoration: none;
          font-weight: 600;
        }

        .sa-primary-action {
          background: var(--sa-orange);
          color: #111;
        }

        .sa-secondary-action {
          border: 1px solid var(--sa-line);
          color: var(--sa-text);
          background: rgba(255, 255, 255, 0.03);
        }

        .sa-hero-stats {
          display: grid;
          gap: 12px;
        }

        .sa-stat-card {
          border-radius: 24px;
          border: 1px solid var(--sa-line);
          background: var(--sa-panel);
          padding: 18px;
        }

        .sa-stat-card strong {
          display: block;
          margin-top: 10px;
          font-size: 1.15rem;
        }

        .sa-stat-card-accent {
          background: linear-gradient(180deg, rgba(255, 102, 0, 0.2), rgba(24, 24, 24, 0.92));
        }

        .sa-category-strip,
        .sa-service-panels,
        .sa-product-grid {
          display: grid;
          gap: 14px;
        }

        .sa-category-strip {
          margin-top: 6px;
        }

        .sa-category-tile {
          display: grid;
          grid-template-columns: 92px 1fr;
          gap: 14px;
          align-items: center;
          text-decoration: none;
          color: var(--sa-text);
          background: var(--sa-panel-alt);
          border: 1px solid var(--sa-line);
          border-radius: 24px;
          padding: 14px;
          box-shadow: var(--sa-shadow);
        }

        .sa-category-visual {
          width: 92px;
          aspect-ratio: 1 / 1;
          border-radius: 18px;
          overflow: hidden;
          display: grid;
          place-items: center;
          background:
            linear-gradient(145deg, rgba(255, 102, 0, 0.32), rgba(255, 255, 255, 0.02)),
            #111;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .sa-category-visual img,
        .sa-product-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sa-category-copy {
          display: grid;
          gap: 6px;
        }

        .sa-category-copy strong,
        .sa-product-body h3,
        .sa-service-card h2 {
          margin: 0;
        }

        .sa-service-panels {
          margin-top: 16px;
        }

        .sa-service-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--sa-line);
          border-radius: 24px;
          padding: 18px;
        }

        .sa-service-card h2 {
          margin: 8px 0 10px;
          font-size: 1.4rem;
          text-transform: uppercase;
        }

        .sa-results-head {
          margin-top: 26px;
        }

        .sa-results-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .sa-results-actions a {
          border-radius: 999px;
          border: 1px solid var(--sa-line);
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.04);
        }

        .sa-filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .sa-filter-chip {
          display: inline-flex;
          gap: 10px;
          align-items: center;
          border-radius: 999px;
          padding: 10px 14px;
          border: 1px solid rgba(255, 102, 0, 0.26);
          background: var(--sa-orange-soft);
        }

        .sa-filter-chip strong {
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .sa-product-grid {
          margin-top: 16px;
        }

        .sa-product-card {
          border-radius: 28px;
          border: 1px solid var(--sa-line);
          background: var(--sa-panel);
          overflow: hidden;
          box-shadow: var(--sa-shadow);
        }

        .sa-product-media {
          display: block;
          aspect-ratio: 4 / 3;
          background: linear-gradient(180deg, rgba(255, 102, 0, 0.15), rgba(255, 255, 255, 0.02));
        }

        .sa-product-placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          font-size: 3rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.24);
        }

        .sa-product-body {
          padding: 18px;
        }

        .sa-product-meta,
        .sa-product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .sa-product-meta strong {
          color: var(--sa-orange);
        }

        .sa-product-body h3 {
          margin: 10px 0 8px;
          font-size: 1.2rem;
        }

        .sa-product-footer {
          margin-top: 18px;
        }

        .sa-availability {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 0.82rem;
          background: rgba(255, 255, 255, 0.06);
          color: var(--sa-muted);
        }

        .sa-product-footer a {
          font-weight: 600;
        }

        .sa-empty-state {
          margin-top: 16px;
          border-radius: 28px;
          border: 1px solid var(--sa-line);
          background: var(--sa-panel);
          padding: 28px 22px;
          text-align: left;
        }

        .sa-pagination {
          margin-top: 18px;
          align-items: center;
          justify-content: space-between;
          border-radius: 24px;
          border: 1px solid var(--sa-line);
          background: rgba(255, 255, 255, 0.03);
          padding: 16px 18px;
        }

        .sa-pagination span {
          color: var(--sa-muted);
        }

        .sa-pagination a.is-disabled {
          pointer-events: none;
          opacity: 0.42;
        }

        @media (min-width: 768px) {
          .sa-catalog-shell {
            padding: 28px 24px 56px;
          }

          .sa-brand-row,
          .sa-results-head,
          .sa-pagination {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .sa-hero-grid {
            grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.8fr);
            align-items: stretch;
          }

          .sa-category-strip,
          .sa-service-panels,
          .sa-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1100px) {
          .sa-catalog-shell {
            padding-inline: 32px;
          }

          .sa-category-strip {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .sa-service-panels {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .sa-product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}
