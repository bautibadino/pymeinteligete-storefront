"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent, type MotionValue } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}
import type { Route } from "next";

import type {
  SportAdventureBrand,
  SportAdventureHomeProps,
  SportAdventureNavContext,
} from "@/lib/experiences/sportadventure";
import type { StorefrontCatalogProduct } from "@/lib/storefront-api";
import { appendTenantSlugForLocalDevHref, withLocalDevTenantSlugHref } from "@/lib/marketing/pyme-store-host";
import { buildGeneralWhatsAppUrl, buildProductWhatsAppUrl } from "@/lib/experiences/sportadventure/whatsapp";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const DISPLAY = '"Eurostile", "Microgramma D Extended", "Arial Narrow", sans-serif';
const BODY = '"Avenir Next Condensed", "Franklin Gothic Medium", "Helvetica Neue", sans-serif';

// ─── Responsive CSS ───────────────────────────────────────────────────────────
const STYLES = `
  .sa-brand-content {
    position: absolute;
    inset: 0;
    padding-top: clamp(58px, 9vh, 76px);
    display: flex;
    flex-direction: column;
  }
  .sa-bike-side {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    align-items: center;
    padding: 0 clamp(16px, 5vw, 56px);
  }
  .sa-info-side {
    flex-shrink: 0;
    padding: 0 clamp(24px, 5vw, 64px) clamp(32px, 6vh, 60px);
  }
  @media (min-width: 768px) {
    .sa-brand-content {
      flex-direction: row;
      align-items: stretch;
    }
    .sa-bike-side {
      flex: 0 0 56%;
      order: 2;
      padding: 48px 56px 48px 24px;
    }
    .sa-info-side {
      flex: 0 0 44%;
      order: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0 48px clamp(40px, 7vh, 72px) clamp(32px, 5vw, 72px);
    }
  }

  /* Products Grid */
  .sa-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 40px;
  }
  .sa-product-card {
    background: rgba(20, 20, 20, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.3s ease, border-color 0.3s ease;
    display: flex;
    flex-direction: column;
    text-decoration: none;
  }
  .sa-product-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 102, 0, 0.4);
  }
  .sa-product-img {
    aspect-ratio: 1;
    background: #0a0a0a;
    position: relative;
    overflow: hidden;
  }
  .sa-product-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .sa-product-placeholder {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-family: ${DISPLAY};
    font-size: 3rem;
    color: rgba(255, 255, 255, 0.1);
  }
  .sa-product-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }
  .sa-product-brand {
    font-size: 0.7rem;
    color: #ff6600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 600;
  }
  .sa-product-name {
    margin: 0;
    font-size: 1.1rem;
    color: #f3f1ec;
    font-family: ${DISPLAY};
    letter-spacing: 0.04em;
    line-height: 1.2;
  }
  .sa-product-price {
    margin: 0;
    margin-top: auto;
    font-size: 1.05rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }
`;

// ─── Bike silhouette ──────────────────────────────────────────────────────────
function BikeSilhouette({ accent, contrast }: { accent: string | MotionValue<string>; contrast: string | MotionValue<string> }) {
  return (
    <motion.svg viewBox="0 0 960 520" aria-hidden="true" style={{ width: "100%", height: "auto", display: "block" }}>
      <motion.circle cx="250" cy="352" r="108" fill="none" stroke={contrast} strokeOpacity="0.14" strokeWidth="26" />
      <motion.circle cx="710" cy="352" r="108" fill="none" stroke={contrast} strokeOpacity="0.14" strokeWidth="26" />
      <motion.circle cx="250" cy="352" r="62"  fill="none" stroke={contrast} strokeOpacity="0.3"  strokeWidth="10" />
      <motion.circle cx="710" cy="352" r="62"  fill="none" stroke={contrast} strokeOpacity="0.3"  strokeWidth="10" />
      <motion.circle cx="250" cy="352" r="12"  fill={contrast} fillOpacity="0.2" />
      <motion.circle cx="710" cy="352" r="12"  fill={contrast} fillOpacity="0.2" />
      <motion.path d="M246 349 L354 228 L520 230 L645 186 L748 198 L678 315 L530 310 L438 352 Z" fill={accent} fillOpacity="0.9" />
      <motion.path d="M338 214 L396 154 L503 154 L564 205 Z" fill={contrast} fillOpacity="0.12" />
      <motion.path d="M514 210 L590 162 L706 176 L671 229 L579 236 Z" fill={contrast} fillOpacity="0.18" />
      <motion.path d="M222 342 L358 234" fill="none" stroke={contrast} strokeOpacity="0.45" strokeWidth="18" strokeLinecap="round" />
      <motion.path d="M358 234 L523 236 L609 286" fill="none" stroke={contrast} strokeOpacity="0.45" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <motion.path d="M523 236 L601 172" fill="none" stroke={contrast} strokeOpacity="0.45" strokeWidth="14" strokeLinecap="round" />
      <motion.path d="M530 186 L622 172 L668 180 L645 206 L555 212 Z" fill={contrast} fillOpacity="0.14" />
      <motion.path d="M696 214 L815 126" fill="none" stroke={accent} strokeOpacity="1" strokeWidth="14" strokeLinecap="round" />
      <motion.path d="M815 126 L872 126" fill="none" stroke={contrast} strokeOpacity="0.55" strokeWidth="8" strokeLinecap="round" />
      <motion.path d="M619 310 L720 338 L826 348" fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="7" strokeLinecap="round" />
    </motion.svg>
  );
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
function formatPrice(product: StorefrontCatalogProduct) {
  const amount = product.price?.amount;
  const currency = product.price?.currency || "ARS";
  if (typeof amount !== "number") return "Consultar valor";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}


// ─── Animated Brands Ticker ───────────────────────────────────────────────────
function AnimatedBrandsRow({ brands }: { brands: SportAdventureBrand[] }) {
  const SLOTS_COUNT = 4;
  const [slots, setSlots] = useState<SportAdventureBrand[]>(() => {
    return brands.slice(0, SLOTS_COUNT);
  });

  useEffect(() => {
    if (brands.length <= SLOTS_COUNT) return;
    
    const interval = setInterval(() => {
      setSlots(currentSlots => {
        const newSlots = [...currentSlots];
        
        // Pick 1 or 2 slots to change randomly
        const numToChange = Math.random() > 0.6 ? 2 : 1;
        
        const indicesToChange: number[] = [];
        while(indicesToChange.length < numToChange) {
           const randIdx = Math.floor(Math.random() * SLOTS_COUNT);
           if (!indicesToChange.includes(randIdx)) {
              indicesToChange.push(randIdx);
           }
        }
        
        // Available pool of brands not currently displayed
        const availableBrands = brands.filter(b => !newSlots.some(s => s.id === b.id));
        
        indicesToChange.forEach(idx => {
           if (availableBrands.length === 0) return;
           const brandIdx = Math.floor(Math.random() * availableBrands.length);
           newSlots[idx] = availableBrands[brandIdx];
           availableBrands.splice(brandIdx, 1); // remove so we don't pick it again this cycle
        });
        
        return newSlots;
      });
    }, 2500);
    
    return () => clearInterval(interval);
  }, [brands]);

  if (!brands.length) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 4vw, 32px)", marginBottom: "clamp(20px, 4vh, 36px)", flexWrap: "wrap", perspective: 1000, minHeight: 24 }}>
      <div style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
        { "{ Universos }" }
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 3vw, 24px)" }}>
        {slots.map((b, i) => {
          // Alternar la dirección de rotación y despliegue según el índice par/impar
          const dir = i % 2 === 0 ? 1 : -1;
          // Agregamos un ligero delay basado en el índice para que si cambian dos juntos, no sean exactos
          const delay = (i % 2) * 0.15;
          
          return (
            <div key={i} style={{ position: "relative", display: "inline-flex", minWidth: 100 }}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={b.id}
                  initial={{ opacity: 0, y: dir * 25, rotateX: dir * -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: dir * -25, rotateX: dir * 90 }}
                  transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.7)", fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap" }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: b.accent, display: "block", flexShrink: 0 }} />
                  {b.name}
                </motion.span>
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Hero panel ───────────────────────────────────────────────────────────────
function HeroPanel({
  brand,
  logoUrl,
  brandSections,
  navigationContext,
  introHint,
  introActions,
  introEyebrow,
}: {
  brand: string;
  logoUrl?: string;
  brandSections: SportAdventureBrand[];
  navigationContext?: SportAdventureNavContext | undefined;
  introHint?: string;
  introActions?: SportAdventureHomeProps["content"]["introActions"];
  introEyebrow?: string;
}) {
  const lines = brand.split(" ");
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#050505",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 clamp(24px, 5vw, 72px) clamp(40px, 8vh, 80px)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 70% 30%, rgba(255, 102, 0, 0.08), transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: "clamp(16px, 3vh, 28px)",
          left: "clamp(24px, 5vw, 72px)",
          right: "clamp(24px, 5vw, 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={brand} style={{ height: 28, objectFit: "contain" }} />
        ) : (
          <span style={{ fontFamily: DISPLAY, fontSize: "0.78rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)" }}>
            {brand}
          </span>
        )}
        <a
          href={navigationContext ? appendTenantSlugForLocalDevHref("/catalogo", navigationContext.host, navigationContext.tenantSlug) : "/catalogo"}
          style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
        >
          Catálogo
        </a>
      </div>

      {/* Content wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 800 }}
      >
        <AnimatedBrandsRow brands={brandSections} />

        <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "clamp(3.6rem, 13vw, 11rem)", lineHeight: 0.82, letterSpacing: "-0.06em", textTransform: "uppercase", color: "#f3f1ec" }}>
          {lines.map((line, i) => (
            <span key={i} style={{ display: "block" }}>{line}</span>
          ))}
        </h1>

        <p style={{ margin: "clamp(14px, 2.5vh, 22px) 0 0", fontFamily: BODY, fontSize: "clamp(0.88rem, 1.6vw, 1rem)", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.5 }}>
          {introEyebrow ?? "Motos \u00b7 Indumentaria \u00b7 Repuestos \u00b7 Taller"}
        </p>

        {introHint ? (
          <p style={{ margin: "clamp(10px, 1.8vh, 16px) 0 0", fontFamily: BODY, fontSize: "clamp(0.82rem, 1.3vw, 0.94rem)", color: "rgba(255,255,255,0.22)", lineHeight: 1.6, maxWidth: "44ch" }}>
            {introHint}
          </p>
        ) : null}

        {introActions && introActions.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(8px, 1.5vw, 12px)", marginTop: "clamp(20px, 3.5vh, 32px)" }}>
            {introActions.map((action) => {
              const isExternal = action.href.startsWith("http");
              const resolvedHref = !isExternal && navigationContext
                ? appendTenantSlugForLocalDevHref(action.href, navigationContext.host, navigationContext.tenantSlug)
                : action.href;
              const isPrimary = action.variant === "primary";
              const isSecondary = action.variant === "secondary";
              return (
                <a
                  key={action.href}
                  href={resolvedHref}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "clamp(38px, 5vh, 44px)",
                    padding: "0 clamp(14px, 2.5vw, 20px)",
                    fontFamily: BODY,
                    fontSize: "0.72rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    borderRadius: 999,
                    fontWeight: 700,
                    transition: "background 0.2s, transform 0.2s",
                    ...(isPrimary
                      ? { background: "#ff6a00", color: "#050505", border: "none" }
                      : isSecondary
                      ? { background: "transparent", color: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.28)" }
                      : { background: "transparent", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.12)" }),
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {action.label}
                </a>
              );
            })}
          </div>
        ) : null}
      </motion.div>

      {/* Scroll cue (points down to products) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ 
          opacity: { delay: 1, duration: 1 },
          y: { delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ 
          position: "absolute", 
          right: "clamp(24px, 5vw, 72px)", 
          bottom: "clamp(24px, 5vh, 40px)", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: 12,
          cursor: "pointer"
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <span style={{ fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
          Explorar
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      </motion.div>
    </div>
  );
}

// ─── Products & Categories ────────────────────────────────────────────────────
function ProductsSection({
  products,
  navigationContext,
}: {
  products: StorefrontCatalogProduct[];
  navigationContext?: SportAdventureNavContext | undefined;
}) {
  if (!products || products.length === 0) return null;
  
  // Show max 4 products
  const featured = products.slice(0, 4);
  const catalogUrl = navigationContext ? appendTenantSlugForLocalDevHref("/catalogo", navigationContext.host, navigationContext.tenantSlug) : "/catalogo";

  return (
    <div style={{ padding: "clamp(60px, 10vh, 120px) clamp(24px, 5vw, 72px)", background: "#050505", position: "relative" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}
        >
          <div>
            <span style={{ fontFamily: BODY, fontSize: "0.8rem", color: "#ff6600", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>Descubrí</span>
            <h2 style={{ margin: "8px 0 0", fontFamily: DISPLAY, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#f3f1ec", textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Destacados
            </h2>
          </div>
          <a href={catalogUrl} style={{ fontFamily: BODY, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 4 }}>
            Ver todo el catálogo →
          </a>
        </motion.div>

        <div className="sa-products-grid">
          {featured.map((product, i) => {
            const inner = (product.slug ? `/producto/${product.slug}` : "/catalogo") as Route;
            const href = navigationContext ? withLocalDevTenantSlugHref(navigationContext.host, navigationContext.tenantSlug, inner) as Route : inner;
            const title = product.name?.trim() || "Producto";
            
            return (
              <motion.div
                key={product.slug || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{ display: "flex" }}
              >
                <Link href={href} className="sa-product-card" style={{ width: "100%" }}>
                  <div className="sa-product-img">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={title} loading="lazy" />
                    ) : (
                      <div className="sa-product-placeholder">{title.charAt(0)}</div>
                    )}
                  </div>
                  <div className="sa-product-body">
                    <span className="sa-product-brand">{product.brand || product.category || "SportAdventure"}</span>
                    <h3 className="sa-product-name">{title}</h3>
                    <p className="sa-product-price">{formatPrice(product)}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Text Animation Helpers ──────────────────────────────────────────────────
function AnimatedText({ text, className }: { text: string; className?: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={text} className={className} style={{ display: "flex", flexWrap: "wrap" }}>
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 15, rotateX: 90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -15, rotateX: -90 }}
            transition={{ duration: 0.4, delay: i * 0.03, ease: "easeOut" }}
            style={{ display: "inline-block", whiteSpace: "pre", transformOrigin: "center center" }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Brand panel ──────────────────────────────────────────────────────────────
// ─── Bike Build Sequence (KTM) ────────────────────────────────────────────────
function BikeBuildSequence({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [currentFrame, setCurrentFrame] = useState(24);

  // Mapeamos el progreso del scroll a los frames 1-24 (ajustado para que dure la mitad del scroll de 200vh)
  const frameValue = useTransform(scrollYProgress, [0, 0.4], [1, 24]);

  useMotionValueEvent(frameValue, "change", (latest) => {
    setCurrentFrame(Math.round(latest));
  });

  // Pre-cargar imágenes para que no parpadee
  useEffect(() => {
    for (let i = 1; i <= 24; i++) {
      const img = new Image();
      img.src = `/ktm-build/${i}.png`;
    }
  }, []);

  return (
    <div style={{ 
      position: "relative", width: "100%", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center",
      WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 95%)",
      maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 95%)"
    }}>
      <img
        src={`/ktm-build/${currentFrame}.png`}
        alt={`KTM Build Sequence`}
        style={{ 
          width: "140%", 
          height: "140%", 
          objectFit: "contain",
          transform: "scale(1.2) translateY(5%)" // Agrandada y ajustada visualmente
        }}
      />
    </div>
  );
}

function BrandsMorphSection({
  brands,
  navigationContext,
}: {
  brands: SportAdventureBrand[];
  navigationContext?: SportAdventureNavContext | undefined;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Map 0-1 to 0-(N-1)
    let idx = Math.floor(latest * brands.length);
    if (idx >= brands.length) idx = brands.length - 1;
    if (idx < 0) idx = 0;
    setActiveIndex(idx);
  });

  const activeBrand = brands[activeIndex] ?? brands[0];
  if (!activeBrand) return null;

  const stops = brands.map((_, i) => i / Math.max(1, brands.length - 1));

  const surfaceColor = useTransform(scrollYProgress, stops, brands.map(b => b.surface));
  const accentColor = useTransform(scrollYProgress, stops, brands.map(b => b.accent));
  const contrastColor = useTransform(scrollYProgress, stops, brands.map(b => b.contrast));

  const catalogHref = navigationContext 
    ? appendTenantSlugForLocalDevHref(`/catalogo?marca=${encodeURIComponent(activeBrand.id)}`, navigationContext.host, navigationContext.tenantSlug) 
    : `/catalogo?marca=${encodeURIComponent(activeBrand.id)}`;

  const heightMultiplier = Math.max(2, brands.length);

  return (
    <div ref={containerRef} style={{ height: `${heightMultiplier * 100}vh`, position: "relative" }}>
      <motion.div style={{ position: "sticky", top: 0, height: "100vh", backgroundColor: surfaceColor, overflow: "hidden" }}>
        
        {/* Accent Radial */}
        <motion.div 
          aria-hidden="true" 
          style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: useTransform(accentColor, c => `radial-gradient(ellipse 70% 55% at 60% 38%, ${c}1c 0%, transparent 65%)`) }} 
        />
        
        {/* Watermark Scramble */}
        <div aria-hidden="true" style={{ position: "absolute", bottom: "-0.08em", left: "-0.02em", fontFamily: DISPLAY, fontSize: "clamp(22vw, 30vw, 42vw)", lineHeight: 1, letterSpacing: "-0.08em", textTransform: "uppercase", opacity: 0.055, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>
          <motion.div style={{ color: accentColor }}>
            <AnimatePresence mode="wait">
              <motion.span key={activeBrand.name} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.4 }}>
                {activeBrand.name}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Top bar accent line */}
        <motion.div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: accentColor }} />

        {/* Top bar info */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(18px, 3.5vh, 28px) clamp(24px, 5vw, 64px)", zIndex: 1 }}>
          <motion.span style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: BODY, fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: useTransform(contrastColor, c => `${c}60`) }}>
            <motion.span style={{ width: 16, height: 1, backgroundColor: accentColor, opacity: 0.7 }} />
            <AnimatedText text={activeBrand.eyebrow} />
          </motion.span>
          <motion.a
            href={catalogHref}
            style={{ fontFamily: BODY, fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: accentColor, textDecoration: "none" }}
          >
            Ver modelos →
          </motion.a>
        </div>

        <div className="sa-brand-content">
          <div className="sa-bike-side">
            <motion.div style={{ width: "100%" }}>
              {activeBrand.id === "ktm" ? (
                <BikeBuildSequence scrollYProgress={scrollYProgress} />
              ) : (
                <BikeSilhouette accent={accentColor} contrast={contrastColor} />
              )}
            </motion.div>
          </div>

          <div className="sa-info-side">
            <motion.div>
              <motion.div style={{ width: "clamp(28px, 4vw, 44px)", height: 3, backgroundColor: accentColor, marginBottom: 16 }} />
              <div style={{ margin: 0, fontFamily: DISPLAY, fontSize: "clamp(4rem, 11vw, 9.5rem)", lineHeight: 0.82, letterSpacing: "-0.06em", textTransform: "uppercase" }}>
                <motion.div style={{ color: contrastColor }}>
                  <AnimatedText text={activeBrand.name} />
                </motion.div>
              </div>
              <motion.div style={{ margin: "clamp(10px, 1.8vh, 18px) 0 0", fontFamily: BODY, fontSize: "clamp(0.9rem, 1.4vw, 1rem)", color: useTransform(contrastColor, c => `${c}88`), maxWidth: "34ch", lineHeight: 1.52, letterSpacing: "0.02em" }}>
                <AnimatePresence mode="wait">
                  <motion.div key={activeBrand.tagline} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.4 }}>
                    {activeBrand.tagline}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Cinematic Brand Stage (Replaces Universos Spotlight) ─────────────────────
function CinematicBrandStage({ brands, navigationContext }: { brands: SportAdventureBrand[], navigationContext?: SportAdventureNavContext | undefined }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      const panels = gsap.utils.toArray<HTMLElement>(".brand-stage-panel");
      if (panels.length <= 1) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${brands.length * 100}vh`,
          scrub: 1,
          pin: true,
          anticipatePin: 1
        }
      });

      panels.forEach((panel, i) => {
        if (i === 0) return;
        const prevPanel = panels[i - 1];
        if (!prevPanel || !brands[i]) return;
        
        tl.to(prevPanel, {
          scale: 0.82,
          xPercent: -15,
          autoAlpha: 0,
          filter: "blur(8px)",
          duration: 1,
          ease: "power2.inOut"
        }, `transition-${i}`);

        tl.fromTo(panel, 
          { autoAlpha: 0, scale: 1.08, xPercent: 15, filter: "blur(12px)" },
          { autoAlpha: 1, scale: 1, xPercent: 0, filter: "blur(0px)", duration: 1, ease: "power2.inOut" }, 
          `transition-${i}`
        );
        
        tl.to(".brand-stage-bg", {
           backgroundColor: brands[i]?.surface,
           duration: 1,
           ease: "none"
        }, `transition-${i}`);
      });
    });
  }, { scope: containerRef });

  if (!brands || brands.length === 0) return null;

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
       <style>{`
         .sa-brand-stage-desktop { display: none; }
         .sa-brand-stage-mobile { 
            display: flex; 
            overflow-x: auto; 
            scroll-snap-type: x mandatory; 
            padding: 40px 24px; 
            gap: 16px; 
            background: #050505;
         }
         .sa-brand-stage-mobile::-webkit-scrollbar { display: none; }
         @media (min-width: 768px) {
            .sa-brand-stage-desktop { display: block; }
            .sa-brand-stage-mobile { display: none; }
         }
       `}</style>
       
       <div className="sa-brand-stage-desktop" ref={containerRef}>
          <div className="sa-pinned-container" style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
             <div className="brand-stage-bg" style={{ position: "absolute", inset: 0, backgroundColor: brands[0]?.surface }} />
             
             {/* Fixed Title */}
             <div style={{ position: "absolute", top: "clamp(24px, 5vh, 48px)", left: "clamp(24px, 5vw, 64px)", zIndex: 50 }}>
                <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                   Universos <span style={{ color: "#ff6a00" }}>Sport Adventure</span>
                </h2>
             </div>

             {brands.map((brand, i) => {
                const catalogHref = navigationContext 
                  ? appendTenantSlugForLocalDevHref(`/catalogo?marca=${encodeURIComponent(brand.id)}`, navigationContext.host, navigationContext.tenantSlug) 
                  : `/catalogo?marca=${encodeURIComponent(brand.id)}`;

                return (
                  <div key={brand.id} className="brand-stage-panel" style={{
                      position: "absolute", inset: 0,
                      zIndex: brands.length - i,
                      display: "flex", flexDirection: "column", justifyItems: "center", justifyContent: "center",
                      visibility: i === 0 ? "visible" : "hidden",
                      opacity: i === 0 ? 1 : 0,
                  }}>
                      {/* Ambient Glow */}
                      <div style={{ position: "absolute", top: 0, right: 0, width: "60%", height: "100%", background: `radial-gradient(circle at 80% 50%, ${brand.accent}15, transparent 60%)`, pointerEvents: "none" }} />
                      
                      {/* Bike Silhouette */}
                      <div style={{ position: "absolute", right: "-5%", bottom: "-15%", width: "60%", opacity: 0.15, pointerEvents: "none" }}>
                         <BikeSilhouette accent={brand.accent} contrast={brand.contrast} />
                      </div>

                      {/* Content */}
                      <div style={{ position: "relative", zIndex: 10, maxWidth: 650, marginLeft: "clamp(24px, 5vw, 120px)" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 2, background: brand.accent }} />
                            <span style={{ fontFamily: BODY, fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", color: brand.accent }}>
                               {brand.group || brand.eyebrow}
                            </span>
                         </div>
                         
                         <h3 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "clamp(4rem, 8vw, 7rem)", lineHeight: 0.85, letterSpacing: "-0.04em", textTransform: "uppercase", color: brand.contrast }}>
                            {brand.name}
                         </h3>
                         
                         <p style={{ margin: "32px 0 0", fontFamily: BODY, fontSize: "clamp(1rem, 1.5vw, 1.2rem)", color: "rgba(255,255,255,0.7)", maxWidth: "48ch", lineHeight: 1.6 }}>
                            {brand.tagline}
                         </p>

                         {brand.uses && brand.uses.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
                               {brand.uses.map(use => (
                                  <span key={use} style={{ background: "rgba(255,255,255,0.08)", padding: "6px 16px", borderRadius: 999, fontFamily: BODY, fontSize: "0.8rem", color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em", border: "1px solid rgba(255,255,255,0.1)" }}>
                                     {use}
                                  </span>
                               ))}
                            </div>
                         )}

                         <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
                            <motion.a
                               href={catalogHref}
                               whileHover={{ scale: 1.05, backgroundColor: brand.contrast, color: brand.surface }}
                               whileTap={{ scale: 0.95 }}
                               style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: brand.accent, color: brand.surface, padding: "0 32px", minHeight: 52, borderRadius: 999, fontFamily: BODY, fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", transition: "background 0.3s, color 0.3s" }}
                            >
                               Explorar Universo
                            </motion.a>
                            <motion.a
                               href={`${catalogHref}&categoria=indumentaria`}
                               whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                               whileTap={{ scale: 0.95 }}
                               style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid rgba(255,255,255,0.2)`, color: "rgba(255,255,255,0.8)", padding: "0 32px", minHeight: 52, borderRadius: 999, fontFamily: BODY, fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}
                            >
                               Indumentaria
                            </motion.a>
                         </div>
                      </div>
                  </div>
                );
             })}
          </div>
       </div>

       <div className="sa-brand-stage-mobile">
          {brands.map((brand, i) => {
             const catalogHref = navigationContext 
               ? appendTenantSlugForLocalDevHref(`/catalogo?marca=${encodeURIComponent(brand.id)}`, navigationContext.host, navigationContext.tenantSlug) 
               : `/catalogo?marca=${encodeURIComponent(brand.id)}`;

             return (
               <div key={brand.id} style={{ scrollSnapAlign: "center", flex: "0 0 88%", background: brand.surface, borderRadius: 24, padding: 32, position: "relative", overflow: "hidden", border: `1px solid ${brand.surfaceAlt}` }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: "80%", height: "100%", background: `radial-gradient(circle at 100% 50%, ${brand.accent}15, transparent 70%)`, pointerEvents: "none" }} />
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, position: "relative", zIndex: 2 }}>
                     <div style={{ width: 24, height: 2, background: brand.accent }} />
                     <span style={{ fontFamily: BODY, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: brand.accent }}>
                        {brand.group || brand.eyebrow}
                     </span>
                  </div>
                  
                  <h3 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "3rem", lineHeight: 0.9, letterSpacing: "-0.04em", textTransform: "uppercase", color: brand.contrast, position: "relative", zIndex: 2 }}>
                     {brand.name}
                  </h3>
                  
                  <p style={{ margin: "16px 0 0", fontFamily: BODY, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5, position: "relative", zIndex: 2 }}>
                     {brand.tagline}
                  </p>

                  <div style={{ marginTop: 32, position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 12 }}>
                     <a href={catalogHref} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: brand.accent, color: brand.surface, padding: "0 24px", minHeight: 48, borderRadius: 999, fontFamily: BODY, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
                        Ver Catálogo
                     </a>
                  </div>
                  
                  {/* Subtle bike shape */}
                  <div style={{ position: "absolute", right: "-20%", bottom: "-10%", width: "80%", opacity: 0.1, pointerEvents: "none" }}>
                     <BikeSilhouette accent={brand.accent} contrast={brand.contrast} />
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
}

const UniversesSpotlightSection = CinematicBrandStage;

// ─── Trust / Branches ─────────────────────────────────────────────────────────
function TrustSection({
  navigationContext
}: {
  navigationContext?: SportAdventureNavContext | undefined;
}) {
  const waUrl = buildGeneralWhatsAppUrl();
  return (
    <div style={{ padding: "clamp(80px, 15vh, 160px) clamp(24px, 5vw, 72px)", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 10 }}>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ maxWidth: 640 }}>
        <h2 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "#f3f1ec", textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 1 }}>
          Tu Aventura<br /><span style={{ color: "#ff6600" }}>Empieza Acá</span>
        </h2>
        <p style={{ margin: "24px 0 40px", fontFamily: BODY, fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
          Vení a conocernos a nuestro concesionario. Asesoramiento experto, servicio técnico oficial y todo el equipamiento que necesitás para tu próxima salida.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48, padding: "0 28px", background: "#25d366", color: "#000", fontFamily: BODY, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", borderRadius: 999 }}
          >
            Contactar Asesor
          </a>
          <a
            href={navigationContext ? appendTenantSlugForLocalDevHref("/catalogo", navigationContext.host, navigationContext.tenantSlug) : "/catalogo"}
            style={{ display: "inline-flex", alignItems: "center", minHeight: 48, padding: "0 28px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontFamily: BODY, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", borderRadius: 999 }}
          >
            Explorar Catálogo
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SportAdventureHome({
  content,
  className,
  navigationContext,
  products,
}: SportAdventureHomeProps) {
  const featuredBrands = content.brandSections.filter(b => b.featured);
  const spotlightBrands = content.brandSections.filter(b => !b.featured);

  return (
    <>
      <style>{STYLES}</style>
      <div className={className} style={{ fontFamily: BODY, color: "#f3f1ec", background: "#050505", minHeight: "100vh" }}>
        
        {/* 1. Hero */}
        <section style={{ height: "100vh", position: "relative" }}>
          <HeroPanel
            brand={content.brand}
            {...(content.logoUrl !== undefined ? { logoUrl: content.logoUrl } : {})}
            {...(navigationContext ? { navigationContext } : {})}
            brandSections={content.brandSections}
            {...(content.introHint ? { introHint: content.introHint } : {})}
            {...(content.introActions?.length ? { introActions: content.introActions } : {})}
            {...(content.introEyebrow ? { introEyebrow: content.introEyebrow } : {})}
          />
        </section>

        {/* 2. Products / Categories Commercial Entry */}
        <section style={{ position: "relative", zIndex: 10 }}>
          <ProductsSection products={products || []} navigationContext={navigationContext} />
        </section>

        {/* 3. Featured Brands (Morphing Scroll - p.ej. KTM) */}
        {featuredBrands.length > 0 && (
          <section style={{ position: "relative", zIndex: 20 }}>
            <BrandsMorphSection brands={featuredBrands} navigationContext={navigationContext} />
          </section>
        )}

        {/* 4. Universos Spotlight (Interactive Module for rest of brands) */}
        {spotlightBrands.length > 0 && (
          <section style={{ position: "relative", zIndex: 25 }}>
            <UniversesSpotlightSection brands={spotlightBrands} navigationContext={navigationContext} />
          </section>
        )}

        {/* 5. Trust / Close */}
        <section style={{ position: "relative", zIndex: 100 }}>
          <TrustSection navigationContext={navigationContext} />
        </section>
      </div>
    </>
  );
}
