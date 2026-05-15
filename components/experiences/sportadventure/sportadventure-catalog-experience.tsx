"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import type {
  StorefrontBootstrap,
  StorefrontCatalog,
  StorefrontCatalogProduct,
  StorefrontCatalogQuery,
  StorefrontCategory,
} from "@/lib/storefront-api";
import {
  CatalogToolbar,
  CatalogPagination,
  FilterSidebar,
} from "@/components/templates/catalog-layout/catalog-layout-shared";

import { withLocalDevTenantSlugHref } from "@/lib/marketing/pyme-store-host";
import { buildProductWhatsAppUrl } from "@/lib/experiences/sportadventure/whatsapp";

gsap.registerPlugin();

// ─── Tipografía SA (idéntica a la home) ───────────────────────────────────────
const DISPLAY = '"Eurostile", "Microgramma D Extended", "Arial Narrow", sans-serif';
const BODY = '"Avenir Next Condensed", "Franklin Gothic Medium", "Helvetica Neue", sans-serif';

// ─── Motion variants ──────────────────────────────────────────────────────────
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────
type SportAdventureCatalogExperienceProps = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
  catalog: StorefrontCatalog | null;
  categories?: StorefrontCategory[] | null;
  query?: Partial<StorefrontCatalogQuery>;
  className?: string;
};

// ─── Helpers de datos ─────────────────────────────────────────────────────────
function getDisplayName(bootstrap: StorefrontBootstrap | null, host: string) {
  const candidate =
    bootstrap?.branding?.storeName?.trim() ||
    bootstrap?.branding?.name?.trim() ||
    bootstrap?.tenant?.tenantSlug?.trim() ||
    host;
  return candidate || "SportAdventure";
}

function getLogoUrl(bootstrap: StorefrontBootstrap | null) {
  return bootstrap?.branding?.logoUrl?.trim() || null;
}

function formatPrice(product: StorefrontCatalogProduct) {
  const amount = product.price?.amount;
  const currency = product.price?.currency || "ARS";
  if (typeof amount !== "number") return "Consultar";
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
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (typeof raw === "boolean") return raw ? "Disponible" : "Sin stock";
  if (raw && typeof raw === "object") {
    const l = normalizeText((raw as { label?: string }).label);
    if (l) return l;
    const s = normalizeText((raw as { status?: string }).status);
    if (s) return s;
  }
  return "Consultar";
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({
  navigation,
  product,
}: {
  navigation: { host: string; tenantSlug: string | null };
  product: StorefrontCatalogProduct;
}) {
  const reducedMotion = useReducedMotion();
  const inner = (product.slug ? `/producto/${product.slug}` : "/catalogo") as Route;
  const href = withLocalDevTenantSlugHref(navigation.host, navigation.tenantSlug, inner) as Route;
  const title = product.name?.trim() || "Producto";
  const overline = product.brand?.trim() || product.category?.trim() || "SportAdventure";
  const price = formatPrice(product);
  const availability = getAvailabilityLabel(product);
  const waUrl = buildProductWhatsAppUrl({
    name: product.name,
    category: product.category,
    brand: product.brand,
    slug: product.slug,
  });

  return (
    <motion.article
      className="sa-card"
      variants={cardVariants}
      whileHover={reducedMotion ? {} : { y: -7, scale: 1.022 }}
      whileTap={reducedMotion ? {} : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <Link href={href} className="sa-card-media" aria-label={title}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={title} loading="lazy" />
        ) : (
          <div className="sa-card-placeholder" aria-hidden="true">
            {title.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="sa-card-media-overlay" aria-hidden="true" />
      </Link>

      <div className="sa-card-body">
        <p className="sa-card-overline">{overline}</p>
        <h3 className="sa-card-title">{title}</h3>
        <p className="sa-card-price">{price}</p>

        <div className="sa-card-footer">
          <span className="sa-card-availability">{availability}</span>
          <Link href={href} className="sa-card-cta">
            Ver detalle →
          </Link>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sa-card-wa"
          aria-label={`Consultar ${title} por WhatsApp`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.553 4.082 1.517 5.797L.057 23.856a.5.5 0 0 0 .611.611l6.059-1.46A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.961a9.935 9.935 0 0 1-5.058-1.379l-.362-.214-3.747.902.919-3.659-.236-.376A9.94 9.94 0 0 1 2.039 12C2.039 6.488 6.488 2.039 12 2.039S21.961 6.488 21.961 12 17.512 21.961 12 21.961z"/>
          </svg>
          Consultar por WhatsApp
        </a>
      </div>
    </motion.article>
  );
}


// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({
  navigation,
}: {
  navigation: { host: string; tenantSlug: string | null };
}) {
  const catalogHref = withLocalDevTenantSlugHref(
    navigation.host,
    navigation.tenantSlug,
    "/catalogo",
  ) as Route;

  return (
    <motion.div
      className="sa-empty"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
    >
      <div className="sa-empty-icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <h2 className="sa-empty-title">Sin resultados para esta búsqueda</h2>
      <p className="sa-empty-desc">
        Probá limpiar filtros o explorá otras familias del catálogo.
      </p>
      <Link href={catalogHref} className="sa-btn-primary">
        Ver catálogo completo
      </Link>
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function SportAdventureCatalogExperience({
  bootstrap,
  host,
  catalog,
  categories,
  query,
  className,
}: SportAdventureCatalogExperienceProps) {
  const shellRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const tenantNavSlug = bootstrap?.tenant?.tenantSlug ?? null;
  const navigation = { host, tenantSlug: tenantNavSlug };
  const displayName = getDisplayName(bootstrap, host);
  const logoUrl = getLogoUrl(bootstrap);
  const products = catalog?.products ?? [];
  const pagination = catalog?.pagination;
  const facets = catalog?.facets ?? (catalog as unknown as { filters?: StorefrontCatalog["facets"] })?.filters;
  const categoriesList = categories ?? [];
  const totalResults =
    typeof pagination?.total === "number"
      ? pagination.total
      : typeof pagination?.totalItems === "number"
        ? pagination.totalItems
        : products.length;

  const activeQueryFilters = {
    category: true,
    brand: true,
  } as const;

  // ─── GSAP: entrada del header ────────────────────────────────────────────
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.defaults({ ease: "power3.out" });
        const tl = gsap.timeline();
        tl.fromTo(
          ".sa-header",
          { autoAlpha: 0, y: -18 },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          0,
        );
        tl.fromTo(
          ".sa-sidebar",
          { autoAlpha: 0, x: -22 },
          { autoAlpha: 1, x: 0, duration: 0.65 },
          0.15,
        );
        tl.fromTo(
          ".sa-toolbar-wrap",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          0.25,
        );
      });
    },
    { scope: shellRef },
  );

  return (
    <section
      ref={shellRef}
      className={["sa-catalog-shell", className].filter(Boolean).join(" ")}
    >
      {/* Fondo reticulado + gradiente */}
      <div className="sa-bg-grid" aria-hidden="true" />

      {/* ─── Header compacto ──────────────────────────────────────────────── */}
      <header className="sa-header">
        <div className="sa-header-brand">
          {logoUrl ? (
            <img src={logoUrl} alt={displayName} className="sa-header-logo" />
          ) : (
            <span className="sa-header-wordmark">{displayName}</span>
          )}
          <div className="sa-header-divider" aria-hidden="true" />
          <div>
            <p className="sa-header-eyebrow">Catálogo público</p>
            <h1 className="sa-header-title">Explorar productos</h1>
          </div>
        </div>

        <div className="sa-header-actions">
          <AnimatePresence>
            {totalResults > 0 && (
              <motion.span
                key="count"
                className="sa-header-count"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                {totalResults} {totalResults === 1 ? "resultado" : "resultados"}
              </motion.span>
            )}
          </AnimatePresence>
          <Link
            href={withLocalDevTenantSlugHref(host, tenantNavSlug, "/") as Route}
            className="sa-header-back"
          >
            ← Inicio
          </Link>
        </div>
      </header>

      {/* ─── Layout principal: sidebar + contenido ───────────────────────── */}
      <div className="sa-layout">
        {/* Sidebar de filtros */}
        <aside className="sa-sidebar">
          <FilterSidebar
            activeFilters={activeQueryFilters}
            categories={categoriesList}
            facets={facets}
            density="compact"
          />
        </aside>

        {/* Área de contenido */}
        <div className="sa-content">
          {/* Toolbar con ordenamiento */}
          <div className="sa-toolbar-wrap">
            <CatalogToolbar count={totalResults} density="compact" tone="dark" />
          </div>

          {/* Grid de productos */}
          {products.length > 0 ? (
            <motion.div
              className="sa-product-grid"
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {products.map((product, index) => (
                <ProductCard
                  key={product.slug ?? product.productId ?? product.sku ?? `product-${index}`}
                  navigation={navigation}
                  product={product}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState navigation={navigation} />
          )}

          {/* Paginación */}
          {pagination ? (
            <CatalogPagination pagination={pagination} />
          ) : null}
        </div>
      </div>

      {/* ─── Estilos SA ──────────────────────────────────────────────────── */}
      <style jsx>{`
        /* CSS custom properties para que los componentes BYM se vean con skin SA */
        .sa-catalog-shell {
          --accent: #ff6600;
          --accent-soft: rgba(255, 102, 0, 0.14);
          --action-contrast: #111;
          --bg: #050505;
          --focus-ring: rgba(255, 102, 0, 0.26);
          --ink: #f7f5f1;
          --line: rgba(255, 255, 255, 0.11);
          --module-accent: #ff6600;
          --module-accent-soft: rgba(255, 102, 0, 0.12);
          --muted: rgba(247, 245, 241, 0.62);
          --paper: #0b0b0b;
          --panel: rgba(14, 14, 14, 0.94);
          --panel-strong: rgba(21, 21, 21, 0.98);
          --surface-muted: rgba(21, 21, 21, 0.84);
          --surface-overlay: rgba(12, 12, 14, 0.94);
          --surface-raised: rgba(18, 18, 20, 0.96);

          font-family: ${BODY};
          color: #f7f5f1;
          background:
            radial-gradient(circle at top left, rgba(255, 102, 0, 0.18), transparent 28%),
            linear-gradient(180deg, #0b0b0b 0%, #050505 54%, #0f0f0f 100%);
          min-height: 100dvh;
          padding: 0 16px 60px;
          position: relative;
          overflow-x: hidden;
        }

        .sa-bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
          z-index: 0;
          mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85), transparent 60%);
        }

        /* ─── Header ─────────────────────────────────────────────────────── */
        .sa-header {
          position: relative;
          z-index: 2;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 20px 0 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 24px;
          width: min(1200px, 100%);
          margin-left: auto;
          margin-right: auto;
        }

        .sa-header-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .sa-header-logo {
          height: 30px;
          max-width: 110px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .sa-header-wordmark {
          font-family: ${DISPLAY};
          font-size: 1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f7f5f1;
          flex-shrink: 0;
        }

        .sa-header-divider {
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.14);
          flex-shrink: 0;
        }

        .sa-header-eyebrow {
          font-size: 0.66rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(247, 245, 241, 0.45);
          margin: 0;
        }

        .sa-header-title {
          font-family: ${DISPLAY};
          font-size: clamp(1.2rem, 2.8vw, 2rem);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          line-height: 1;
          color: #f7f5f1;
          margin: 2px 0 0;
        }

        .sa-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .sa-header-count {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(247, 245, 241, 0.7);
          background: rgba(255, 102, 0, 0.12);
          border: 1px solid rgba(255, 102, 0, 0.28);
          border-radius: 999px;
          padding: 6px 13px;
          display: inline-flex;
          align-items: center;
        }

        .sa-header-back {
          font-size: 0.7rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(247, 245, 241, 0.55);
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.04);
          transition: color 0.2s, border-color 0.2s;
        }

        .sa-header-back:hover {
          color: #f7f5f1;
          border-color: rgba(255, 255, 255, 0.22);
        }

        /* ─── Layout ──────────────────────────────────────────────────────── */
        .sa-layout {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 22px;
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        .sa-sidebar {
          min-width: 0;
        }

        .sa-content {
          display: grid;
          gap: 18px;
          min-width: 0;
        }

        .sa-toolbar-wrap {
          /* slot para CatalogToolbar de BYM (usa tokens CSS custom props) */
        }

        /* ─── Product grid ────────────────────────────────────────────────── */
        .sa-product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        /* ─── Product card ────────────────────────────────────────────────── */
        .sa-card {
          background: rgba(14, 14, 14, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          will-change: transform;
          display: flex;
          flex-direction: column;
        }

        /* Línea de acento superior en hover — via ::before pseudo */
        .sa-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #ff6600;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.28s ease;
          z-index: 1;
        }

        .sa-card:hover::before {
          transform: scaleX(1);
        }

        .sa-card-media {
          display: block;
          aspect-ratio: 3 / 2;
          background: linear-gradient(
            155deg,
            rgba(255, 102, 0, 0.14) 0%,
            rgba(255, 255, 255, 0.02) 100%
          );
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }

        .sa-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }

        .sa-card:hover .sa-card-media img {
          transform: scale(1.04);
        }

        .sa-card-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(14, 14, 14, 0.38), transparent 55%);
          pointer-events: none;
        }

        .sa-card-placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          font-family: ${DISPLAY};
          font-size: 3rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.16);
          letter-spacing: 0.04em;
        }

        .sa-card-body {
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }

        .sa-card-overline {
          font-size: 0.67rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(247, 245, 241, 0.45);
          margin: 0;
        }

        .sa-card-title {
          font-family: ${DISPLAY};
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: #f7f5f1;
          line-height: 1.18;
          margin: 0;
        }

        .sa-card-price {
          font-size: 1.08rem;
          font-weight: 700;
          color: #ff6600;
          margin: 3px 0 0;
        }

        .sa-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .sa-card-availability {
          font-size: 0.72rem;
          color: rgba(247, 245, 241, 0.48);
          background: rgba(255, 255, 255, 0.05);
          border-radius: 999px;
          padding: 5px 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .sa-card-cta {
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #ff6600;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color 0.2s;
        }

        .sa-card-cta:hover {
          color: #ff8833;
        }

        .sa-card-wa {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(37, 211, 102, 0.75);
          text-decoration: none;
          margin-top: 10px;
          transition: color 0.2s;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 10px;
        }

        .sa-card-wa:hover {
          color: rgba(37, 211, 102, 1);
        }

        /* ─── Empty state ─────────────────────────────────────────────────── */
        .sa-empty {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          padding: 36px 28px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(14, 14, 14, 0.94);
        }

        .sa-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 102, 0, 0.12);
          border: 1px solid rgba(255, 102, 0, 0.22);
          display: grid;
          place-items: center;
          color: #ff6600;
        }

        .sa-empty-title {
          font-family: ${DISPLAY};
          font-size: 1.3rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: #f7f5f1;
          margin: 0;
        }

        .sa-empty-desc {
          color: rgba(247, 245, 241, 0.6);
          font-size: 0.9rem;
          line-height: 1.55;
          margin: 0;
          max-width: 38ch;
        }

        .sa-btn-primary {
          display: inline-flex;
          align-items: center;
          background: #ff6600;
          color: #111;
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 999px;
          padding: 11px 22px;
          transition: background 0.2s;
        }

        .sa-btn-primary:hover {
          background: #ff7a1a;
        }

        /* ─── Responsive ──────────────────────────────────────────────────── */
        @media (min-width: 640px) {
          .sa-catalog-shell {
            padding-left: 20px;
            padding-right: 20px;
          }
        }

        @media (min-width: 768px) {
          .sa-catalog-shell {
            padding-left: 28px;
            padding-right: 28px;
          }

          .sa-layout {
            grid-template-columns: 248px minmax(0, 1fr);
            align-items: start;
          }

          .sa-sidebar {
            position: sticky;
            top: 20px;
          }

          .sa-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1100px) {
          .sa-catalog-shell {
            padding-left: 36px;
            padding-right: 36px;
          }

          .sa-product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sa-card,
          .sa-card-media img {
            will-change: auto;
            transition: none;
          }

          .sa-card::before {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
