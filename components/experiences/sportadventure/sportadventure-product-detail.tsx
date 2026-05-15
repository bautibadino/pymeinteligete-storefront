"use client";

import { useMemo, useState } from "react";

import type { StorefrontProductDetail } from "@/lib/storefront-api";
import { sportAdventurePalette } from "@/lib/experiences/sportadventure";
import { appendTenantSlugForLocalDevHref } from "@/lib/marketing/pyme-store-host";
import { buildProductWhatsAppUrl } from "@/lib/experiences/sportadventure/whatsapp";

type SportAdventureProductDetailProps = {
  product: StorefrontProductDetail | null;
  /** Host solicitado (`runtime.context.host`); sólo localhost / loopback añaden `tenantSlug` en URLs. */
  host: string;
  tenantSlug?: string | null;
  className?: string;
};

const DISPLAY_FONT =
  '"Eurostile", "Microgramma D Extended", "Arial Narrow", sans-serif';
const BODY_FONT =
  '"Avenir Next Condensed", "Franklin Gothic Medium", "Helvetica Neue", sans-serif';

const STYLES = `
  .sa-product-root {
    --sa-bg: #050505;
    --sa-panel: rgba(14, 14, 14, 0.94);
    --sa-panel-alt: rgba(255, 255, 255, 0.05);
    --sa-line: rgba(255, 255, 255, 0.1);
    --sa-text: #f5f1eb;
    --sa-muted: rgba(245, 241, 235, 0.68);
    --sa-accent: ${sportAdventurePalette.orange};
    --sa-accent-soft: rgba(255, 106, 0, 0.16);
    --sa-shadow: 0 30px 80px rgba(0, 0, 0, 0.38);
    position: relative;
    overflow: hidden;
    border-radius: 32px;
    background:
      radial-gradient(circle at top left, rgba(255, 106, 0, 0.16), transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 34%),
      var(--sa-bg);
    color: var(--sa-text);
    box-shadow: var(--sa-shadow);
  }
  .sa-product-root::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 72px 72px;
    opacity: 0.38;
    pointer-events: none;
  }
  .sa-product-shell {
    position: relative;
    display: grid;
    gap: 24px;
    padding: clamp(20px, 3vw, 36px);
  }
  .sa-product-hero {
    display: grid;
    gap: 20px;
  }
  .sa-product-gallery,
  .sa-product-summary,
  .sa-product-block {
    border: 1px solid var(--sa-line);
    background: var(--sa-panel);
    backdrop-filter: blur(16px);
  }
  .sa-product-gallery {
    padding: 14px;
    border-radius: 28px;
  }
  .sa-product-frame {
    position: relative;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: 22px;
    background:
      linear-gradient(160deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01)),
      linear-gradient(180deg, #0f0f0f, #050505);
  }
  .sa-product-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .sa-product-placeholder {
    height: 100%;
    display: grid;
    place-items: center;
    color: rgba(255, 255, 255, 0.34);
    font-family: ${DISPLAY_FONT};
    font-size: clamp(2rem, 7vw, 4.5rem);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .sa-product-badge {
    position: absolute;
    left: 16px;
    bottom: 16px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border-radius: 999px;
    padding: 10px 14px;
    background: rgba(5, 5, 5, 0.82);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font: 600 0.72rem/1 ${BODY_FONT};
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .sa-product-badge::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--sa-accent);
    box-shadow: 0 0 18px rgba(255, 106, 0, 0.65);
  }
  .sa-product-thumbs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(74px, 1fr));
    gap: 10px;
    margin-top: 12px;
  }
  .sa-product-thumb {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
    background: #0d0d0d;
    padding: 0;
    cursor: pointer;
    transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
  }
  .sa-product-thumb:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 106, 0, 0.4);
  }
  .sa-product-thumb[data-active="true"] {
    border-color: rgba(255, 106, 0, 0.92);
    background: rgba(255, 106, 0, 0.12);
  }
  .sa-product-thumb img,
  .sa-product-thumb span {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }
  .sa-product-thumb span {
    display: grid;
    place-items: center;
    color: rgba(255, 255, 255, 0.45);
    font-family: ${DISPLAY_FONT};
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .sa-product-summary {
    padding: clamp(22px, 3vw, 34px);
    border-radius: 28px;
  }
  .sa-product-kicker {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .sa-product-chip,
  .sa-product-meta-chip {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    border-radius: 999px;
    padding: 0 14px;
    font: 600 0.72rem/1 ${BODY_FONT};
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .sa-product-chip {
    background: var(--sa-accent-soft);
    color: #ffd4b3;
    border: 1px solid rgba(255, 106, 0, 0.3);
  }
  .sa-product-meta-chip {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.74);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .sa-product-title {
    margin: 0;
    font-family: ${DISPLAY_FONT};
    font-size: clamp(2rem, 4vw, 4.15rem);
    line-height: 0.98;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .sa-product-description {
    max-width: 58ch;
    margin: 16px 0 0;
    color: var(--sa-muted);
    font: 500 1.02rem/1.65 ${BODY_FONT};
  }
  .sa-product-price-row {
    display: grid;
    gap: 18px;
    margin-top: 24px;
    padding-top: 22px;
    border-top: 1px solid var(--sa-line);
  }
  .sa-product-price {
    display: grid;
    gap: 6px;
  }
  .sa-product-price-label {
    color: rgba(255, 255, 255, 0.48);
    font: 600 0.72rem/1 ${BODY_FONT};
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .sa-product-price-value {
    font-family: ${DISPLAY_FONT};
    font-size: clamp(2rem, 4vw, 3.3rem);
    line-height: 0.95;
    letter-spacing: 0.02em;
  }
  .sa-product-price-note {
    color: var(--sa-muted);
    font: 500 0.95rem/1.5 ${BODY_FONT};
  }
  .sa-product-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .sa-product-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    border-radius: 999px;
    padding: 0 20px;
    text-decoration: none;
    font: 700 0.82rem/1 ${BODY_FONT};
    letter-spacing: 0.14em;
    text-transform: uppercase;
    transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
  }
  .sa-product-action:hover {
    transform: translateY(-2px);
  }
  .sa-product-action[data-variant="primary"] {
    background: var(--sa-accent);
    color: #050505;
  }
  .sa-product-action[data-variant="secondary"] {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: var(--sa-text);
  }
  .sa-product-grid {
    display: grid;
    gap: 20px;
  }
  .sa-product-block {
    border-radius: 24px;
    padding: 22px;
  }
  .sa-product-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  .sa-product-block-title {
    margin: 0;
    font-family: ${DISPLAY_FONT};
    font-size: 1rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .sa-product-block-index {
    color: rgba(255, 255, 255, 0.38);
    font: 600 0.72rem/1 ${BODY_FONT};
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .sa-product-highlights {
    display: grid;
    gap: 12px;
  }
  .sa-product-highlight {
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: var(--sa-panel-alt);
    padding: 16px;
  }
  .sa-product-highlight dt {
    margin: 0 0 8px;
    color: rgba(255, 255, 255, 0.48);
    font: 600 0.7rem/1 ${BODY_FONT};
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .sa-product-highlight dd {
    margin: 0;
    color: var(--sa-text);
    font: 500 1rem/1.55 ${BODY_FONT};
  }
  .sa-product-story {
    color: var(--sa-muted);
    font: 500 1rem/1.7 ${BODY_FONT};
  }
  .sa-product-story p {
    margin: 0;
  }
  .sa-product-story p + p {
    margin-top: 14px;
  }
  .sa-product-insights {
    display: grid;
    gap: 12px;
  }
  .sa-product-insight {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding-top: 12px;
  }
  .sa-product-insight:first-child {
    border-top: 0;
    padding-top: 0;
  }
  .sa-product-insight-mark {
    width: 10px;
    height: 10px;
    margin-top: 6px;
    border-radius: 50%;
    background: var(--sa-accent);
    flex: 0 0 auto;
  }
  .sa-product-insight strong,
  .sa-product-insight span {
    display: block;
  }
  .sa-product-insight strong {
    margin-bottom: 4px;
    font: 700 0.74rem/1 ${BODY_FONT};
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.54);
  }
  .sa-product-insight span {
    color: var(--sa-text);
    font: 500 0.98rem/1.5 ${BODY_FONT};
  }
  .sa-product-empty {
    padding: clamp(28px, 5vw, 52px);
  }
  .sa-product-empty h2 {
    margin: 14px 0 10px;
    font-family: ${DISPLAY_FONT};
    font-size: clamp(1.8rem, 4vw, 3rem);
    line-height: 1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .sa-product-empty p {
    max-width: 46ch;
    margin: 0;
    color: var(--sa-muted);
    font: 500 1rem/1.65 ${BODY_FONT};
  }
  @media (min-width: 980px) {
    .sa-product-hero {
      grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
      align-items: stretch;
    }
    .sa-product-price-row {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
    }
    .sa-product-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
`;

type DetailItem = {
  label: string;
  value: string;
};

function formatPrice(product: StorefrontProductDetail | null) {
  if (typeof product?.price?.amount !== "number") {
    return null;
  }

  const currency = product.price?.currency ?? "ARS";

  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(product.price.amount);
  } catch {
    return `${currency} ${product.price.amount}`;
  }
}

function normalizeText(value: unknown): string | null {
  if (typeof value === "string") {
    const compact = value.trim().replace(/\s+/g, " ");
    return compact.length > 0 ? compact : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}

function toSentenceCase(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function flattenUnknownRecord(input: unknown, limit = 4): DetailItem[] {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const text = normalizeText(input);
    return text ? [{ label: "Detalle", value: text }] : [];
  }

  const entries = Object.entries(input as Record<string, unknown>);

  return entries.flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      const printable = value
        .map((item) => normalizeText(item))
        .filter((item): item is string => Boolean(item))
        .slice(0, limit)
        .join(" · ");

      return printable ? [{ label: toSentenceCase(key), value: printable }] : [];
    }

    const text = normalizeText(value);
    return text ? [{ label: toSentenceCase(key), value: text }] : [];
  });
}

function buildHighlights(product: StorefrontProductDetail | null): DetailItem[] {
  if (!product) {
    return [];
  }

  const items: DetailItem[] = [];

  if (product.brand) {
    items.push({ label: "Marca", value: product.brand });
  }

  if (product.category) {
    items.push({ label: "Categoría", value: product.category });
  }

  if (product.sku) {
    items.push({ label: "Código", value: product.sku });
  }

  flattenUnknownRecord(product.availability, 2).forEach((item) => {
    if (items.length < 4) {
      items.push({
        label: item.label === "Detalle" ? "Disponibilidad" : item.label,
        value: item.value,
      });
    }
  });

  if (items.length < 4) {
    const delivery = flattenUnknownRecord(product.deliveryInfo, 2);
    delivery.forEach((item) => {
      if (items.length < 4) {
        items.push({
          label: item.label === "Detalle" ? "Entrega" : item.label,
          value: item.value,
        });
      }
    });
  }

  return items.slice(0, 4);
}

function buildCommercialInsights(product: StorefrontProductDetail | null): DetailItem[] {
  if (!product) {
    return [];
  }

  const sections = [
    ...flattenUnknownRecord(product.commercialInfo, 6),
    ...flattenUnknownRecord(product.deliveryInfo, 3),
    ...flattenUnknownRecord(product.availability, 3),
  ];

  const seen = new Set<string>();

  return sections.filter((item) => {
    const signature = `${item.label}:${item.value}`;
    if (seen.has(signature)) {
      return false;
    }
    seen.add(signature);
    return true;
  }).slice(0, 5);
}

function splitDescription(description: string | null | undefined) {
  const text = normalizeText(description);

  if (!text) {
    return [
      "Una propuesta pensada para quienes priorizan presencia, confianza y una compra simple desde la primera mirada.",
    ];
  }

  return text
    .split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function initialsFromName(name: string | null | undefined) {
  const fallback = normalizeText(name) ?? "Producto";
  return fallback
    .split(" ")
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join("")
    .toUpperCase();
}

export function SportAdventureProductDetail({
  product,
  host,
  tenantSlug,
  className,
}: SportAdventureProductDetailProps) {
  const images = useMemo(
    () => (product?.images ?? []).filter((image): image is string => Boolean(normalizeText(image))),
    [product?.images],
  );
  const [activeImage, setActiveImage] = useState(0);

  const currentImage = images[activeImage] ?? images[0] ?? null;
  const price = formatPrice(product);
  const highlights = buildHighlights(product);
  const insights = buildCommercialInsights(product);
  const paragraphs = splitDescription(product?.description);
  const waUrl = buildProductWhatsAppUrl({
    name: product?.name,
    category: product?.category,
    brand: product?.brand,
  });

  if (!product) {
    return (
      <section className={className}>
        <style>{STYLES}</style>
        <div className="sa-product-root sa-product-empty">
          <span className="sa-product-chip">SportAdventure</span>
          <h2>Producto no disponible</h2>
          <p>
            Este artículo ya no está visible o todavía no tiene información comercial cargada para
            mostrarse en la tienda.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <style>{STYLES}</style>

      <div className="sa-product-root">
        <div className="sa-product-shell">
          <div className="sa-product-hero">
            <div className="sa-product-gallery">
              <div className="sa-product-frame">
                {currentImage ? (
                  <img src={currentImage} alt={product.name ?? "Producto SportAdventure"} />
                ) : (
                  <div className="sa-product-placeholder">{initialsFromName(product.name)}</div>
                )}
                <div className="sa-product-badge">{product.brand ?? "SportAdventure"}</div>
              </div>

              {images.length > 1 ? (
                <div className="sa-product-thumbs" aria-label="Galería de producto">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className="sa-product-thumb"
                      data-active={index === activeImage}
                      onClick={() => setActiveImage(index)}
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      <img src={image} alt="" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="sa-product-summary">
              <div className="sa-product-kicker">
                <span className="sa-product-chip">{product.category ?? "Selección premium"}</span>
                {product.sku ? <span className="sa-product-meta-chip">Cod. {product.sku}</span> : null}
              </div>

              <h1 className="sa-product-title">{product.name ?? "Producto SportAdventure"}</h1>

              <p className="sa-product-description">{paragraphs[0]}</p>

              <div className="sa-product-price-row">
                <div className="sa-product-price">
                  <span className="sa-product-price-label">Valor</span>
                  <strong className="sa-product-price-value">
                    {price ?? "Consultar valor"}
                  </strong>
                  <span className="sa-product-price-note">
                    {price
                      ? "Disponibilidad y condiciones sujetas a confirmación al momento de la compra."
                      : "Consultá disponibilidad y condiciones comerciales con el equipo."}
                  </span>
                </div>

                <div className="sa-product-actions">
                  <a
                    className="sa-product-action"
                    data-variant="primary"
                    href={appendTenantSlugForLocalDevHref("/checkout", host, tenantSlug)}
                  >
                    Comprar
                  </a>
                  <a
                    className="sa-product-action"
                    data-variant="secondary"
                    href={appendTenantSlugForLocalDevHref("/catalogo", host, tenantSlug)}
                  >
                    Seguir viendo
                  </a>
                  <a
                    className="sa-product-action"
                    data-variant="secondary"
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "rgba(37,211,102,0.85)", borderColor: "rgba(37,211,102,0.22)" }}
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="sa-product-grid">
            <article className="sa-product-block">
              <div className="sa-product-block-header">
                <h2 className="sa-product-block-title">Resumen</h2>
                <span className="sa-product-block-index">01</span>
              </div>
              <dl className="sa-product-highlights">
                {highlights.length > 0 ? (
                  highlights.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="sa-product-highlight">
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))
                ) : (
                  <div className="sa-product-highlight">
                    <dt>Presentación</dt>
                    <dd>Información comercial próxima a publicarse.</dd>
                  </div>
                )}
              </dl>
            </article>

            <article className="sa-product-block">
              <div className="sa-product-block-header">
                <h2 className="sa-product-block-title">Lo esencial</h2>
                <span className="sa-product-block-index">02</span>
              </div>
              <div className="sa-product-story">
                {paragraphs.slice(1).length > 0 ? (
                  paragraphs.slice(1).map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)
                ) : (
                  <p>
                    Una pieza seleccionada para integrarse con naturalidad a la experiencia de
                    manejo y compra, con una presencia sobria y foco total en claridad comercial.
                  </p>
                )}
              </div>
            </article>

            <article className="sa-product-block">
              <div className="sa-product-block-header">
                <h2 className="sa-product-block-title">Condiciones</h2>
                <span className="sa-product-block-index">03</span>
              </div>
              <div className="sa-product-insights">
                {insights.length > 0 ? (
                  insights.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="sa-product-insight">
                      <span className="sa-product-insight-mark" aria-hidden="true" />
                      <div>
                        <strong>{item.label}</strong>
                        <span>{item.value}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sa-product-insight">
                    <span className="sa-product-insight-mark" aria-hidden="true" />
                    <div>
                      <strong>Atención</strong>
                      <span>Las condiciones comerciales se informan durante el proceso de compra.</span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
