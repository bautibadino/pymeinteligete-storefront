"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";

import type {
  SportAdventureHomeProps,
  SportAdventureBrand,
} from "@/lib/experiences/sportadventure";

gsap.registerPlugin();

// ─── Fonts ────────────────────────────────────────────────────────────────────
const DISPLAY =
  '"Eurostile", "Microgramma D Extended", "Arial Narrow", sans-serif';
const BODY =
  '"Avenir Next Condensed", "Franklin Gothic Medium", "Helvetica Neue", sans-serif';

// ─── Responsive CSS ───────────────────────────────────────────────────────────
// Injected via <style> para evitar CSS modules.
// Mobile: bike arriba, info abajo.
// Desktop (≥768px): split — info izq 42%, bike der 58%.
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
`;

// ─── Bike silhouette ──────────────────────────────────────────────────────────
function BikeSilhouette({
  accent,
  contrast,
}: {
  accent: string;
  contrast: string;
}) {
  return (
    <svg
      viewBox="0 0 960 520"
      aria-hidden="true"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <circle cx="250" cy="352" r="108" fill="none" stroke={contrast} strokeOpacity="0.14" strokeWidth="26" />
      <circle cx="710" cy="352" r="108" fill="none" stroke={contrast} strokeOpacity="0.14" strokeWidth="26" />
      <circle cx="250" cy="352" r="62"  fill="none" stroke={contrast} strokeOpacity="0.3"  strokeWidth="10" />
      <circle cx="710" cy="352" r="62"  fill="none" stroke={contrast} strokeOpacity="0.3"  strokeWidth="10" />
      <circle cx="250" cy="352" r="12"  fill={contrast} fillOpacity="0.2" />
      <circle cx="710" cy="352" r="12"  fill={contrast} fillOpacity="0.2" />

      <path d="M246 349 L354 228 L520 230 L645 186 L748 198 L678 315 L530 310 L438 352 Z"
        fill={accent} fillOpacity="0.9" />
      <path d="M338 214 L396 154 L503 154 L564 205 Z"
        fill={contrast} fillOpacity="0.12" />
      <path d="M514 210 L590 162 L706 176 L671 229 L579 236 Z"
        fill={contrast} fillOpacity="0.18" />
      <path d="M222 342 L358 234"
        fill="none" stroke={contrast} strokeOpacity="0.45" strokeWidth="18" strokeLinecap="round" />
      <path d="M358 234 L523 236 L609 286"
        fill="none" stroke={contrast} strokeOpacity="0.45" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M523 236 L601 172"
        fill="none" stroke={contrast} strokeOpacity="0.45" strokeWidth="14" strokeLinecap="round" />
      <path d="M530 186 L622 172 L668 180 L645 206 L555 212 Z"
        fill={contrast} fillOpacity="0.14" />
      <path d="M696 214 L815 126"
        fill="none" stroke={accent} strokeOpacity="1" strokeWidth="14" strokeLinecap="round" />
      <path d="M815 126 L872 126"
        fill="none" stroke={contrast} strokeOpacity="0.55" strokeWidth="8" strokeLinecap="round" />
      <path d="M619 310 L720 338 L826 348"
        fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

// ─── Section dots nav ─────────────────────────────────────────────────────────
function SectionDots({
  total,
  active,
  brands,
}: {
  total: number;
  active: number;
  brands: SportAdventureBrand[];
}) {
  const accents = ["rgba(255,255,255,0.5)", ...brands.map((b) => b.accent)];
  return (
    <div
      style={{
        position: "fixed",
        right: "clamp(16px, 2.5vw, 28px)",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center",
      }}
    >
      {accents.map((color, i) => (
        <div
          key={i}
          style={{
            width: i === active ? 8 : 5,
            height: i === active ? 8 : 5,
            borderRadius: "50%",
            background: i === active ? color : "rgba(255,255,255,0.18)",
            transition: "all 0.35s ease",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── Hero panel ───────────────────────────────────────────────────────────────
function HeroPanel({
  brand,
  logoUrl,
  brandSections,
}: {
  brand: string;
  logoUrl?: string;
  brandSections: SportAdventureBrand[];
}) {
  const lines = brand.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#050505",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 clamp(24px, 5vw, 72px) clamp(40px, 8vh, 80px)",
      }}
    >
      {/* Grid texture */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
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
        }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={brand} style={{ height: 28, objectFit: "contain" }} />
        ) : (
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: "0.78rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.42)",
            }}
          >
            {brand}
          </span>
        )}
        <a
          href="/catalogo"
          style={{
            fontFamily: BODY,
            fontSize: "0.72rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
          }}
        >
          Catálogo
        </a>
      </div>

      {/* Brand pips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(12px, 3vw, 24px)",
          marginBottom: "clamp(20px, 4vh, 36px)",
          flexWrap: "wrap",
        }}
      >
        {brandSections.map((b) => (
          <span
            key={b.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(255,255,255,0.38)",
              fontFamily: BODY,
              fontSize: "0.72rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: b.accent,
                display: "block",
                flexShrink: 0,
              }}
            />
            {b.name}
          </span>
        ))}
      </div>

      {/* Title */}
      <h1
        style={{
          margin: 0,
          fontFamily: DISPLAY,
          fontSize: "clamp(3.6rem, 13vw, 11rem)",
          lineHeight: 0.82,
          letterSpacing: "-0.06em",
          textTransform: "uppercase",
          color: "#f3f1ec",
        }}
      >
        {lines.map((line, i) => (
          <span key={i} style={{ display: "block" }}>
            {line}
          </span>
        ))}
      </h1>

      {/* Descriptor */}
      <p
        style={{
          margin: "clamp(14px, 2.5vh, 22px) 0 0",
          fontFamily: BODY,
          fontSize: "clamp(0.88rem, 1.6vw, 1rem)",
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          lineHeight: 1.5,
        }}
      >
        Motos &middot; Indumentaria &middot; Repuestos &middot; Taller
      </p>

      {/* Scroll cue */}
      <div
        style={{
          position: "absolute",
          right: "clamp(24px, 5vw, 72px)",
          bottom: "clamp(32px, 6vh, 60px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 1,
            height: 40,
            background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.22))",
          }}
        />
        <span
          style={{
            fontFamily: BODY,
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.24)",
            writingMode: "vertical-rl",
          }}
        >
          Scroll
        </span>
      </div>
    </div>
  );
}

// ─── Brand panel ──────────────────────────────────────────────────────────────
function BrandPanel({ brand }: { brand: SportAdventureBrand }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: brand.surface,
        overflow: "hidden",
      }}
    >
      {/* Accent radial */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 55% at 60% 38%, ${brand.accent}1c 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      {/* Watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-0.08em",
          left: "-0.02em",
          fontFamily: DISPLAY,
          fontSize: "clamp(22vw, 30vw, 42vw)",
          lineHeight: 1,
          letterSpacing: "-0.08em",
          textTransform: "uppercase",
          color: brand.accent,
          opacity: 0.055,
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {brand.name}
      </div>

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: brand.accent,
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(18px, 3.5vh, 28px) clamp(24px, 5vw, 64px)",
          zIndex: 1,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: BODY,
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: `${brand.contrast}60`,
          }}
        >
          <span
            style={{
              width: 16,
              height: 1,
              background: brand.accent,
              opacity: 0.7,
            }}
          />
          {brand.eyebrow}
        </span>
        <a
          href={`/catalogo?marca=${brand.id}`}
          style={{
            fontFamily: BODY,
            fontSize: "0.7rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: brand.accent,
            textDecoration: "none",
          }}
        >
          Ver modelos →
        </a>
      </div>

      {/* Responsive content grid */}
      <div className="sa-brand-content">
        <div className="sa-bike-side">
          <BikeSilhouette accent={brand.accent} contrast={brand.contrast} />
        </div>

        <div className="sa-info-side">
          <div
            style={{
              width: "clamp(28px, 4vw, 44px)",
              height: 3,
              background: brand.accent,
              marginBottom: 16,
            }}
          />
          <h2
            style={{
              margin: 0,
              fontFamily: DISPLAY,
              fontSize: "clamp(4rem, 11vw, 9.5rem)",
              lineHeight: 0.82,
              letterSpacing: "-0.06em",
              textTransform: "uppercase",
              color: brand.contrast,
            }}
          >
            {brand.name}
          </h2>
          <p
            style={{
              margin: "clamp(10px, 1.8vh, 18px) 0 0",
              fontFamily: BODY,
              fontSize: "clamp(0.9rem, 1.4vw, 1rem)",
              color: `${brand.contrast}88`,
              maxWidth: "34ch",
              lineHeight: 1.52,
              letterSpacing: "0.02em",
            }}
          >
            {brand.tagline}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SportAdventureHome({
  content,
  className,
}: SportAdventureHomeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const currentIdxRef = useRef(0);
  const animatingRef = useRef(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const totalSections = 1 + content.brandSections.length; // hero + marcas

  // Bloquear scroll nativo mientras el componente está montado
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useGSAP(
    (_ctx, contextSafe) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      // Todas las secciones en el DOM
      const sections = gsap.utils.toArray<HTMLElement>(".sa-section", wrapper);
      const activeZIndex = totalSections + 20;

      const syncSectionStack = (activeIdx: number) => {
        sections.forEach((section, index) => {
          if (index < activeIdx) {
            gsap.set(section, { y: "-7%", zIndex: index + 1 });
            return;
          }

          if (index === activeIdx) {
            gsap.set(section, { y: "0%", zIndex: activeZIndex });
            return;
          }

          gsap.set(section, { y: "100%", zIndex: index + 1 });
        });
      };

      // Estado base: activas y previas arriba, futuras fuera del viewport.
      syncSectionStack(currentIdxRef.current);

      // Función de navegación — contextSafe para que GSAP limpie en unmount
      const navigate = contextSafe!((dir: number) => {
        if (animatingRef.current) return;
        const nextIdx = Math.max(
          0,
          Math.min(totalSections - 1, currentIdxRef.current + dir),
        );
        if (nextIdx === currentIdxRef.current) return;

        const fromEl = sections[currentIdxRef.current];
        const toEl = sections[nextIdx];
        if (!fromEl || !toEl) return;

        animatingRef.current = true;
        const prevIdx = currentIdxRef.current;
        currentIdxRef.current = nextIdx;
        setActiveIdx(nextIdx);

        // El entrante siempre viene de abajo (forward) o de arriba (backward)
        gsap.set(toEl, { y: dir > 0 ? "100%" : "-100%", zIndex: nextIdx + 10 });
        gsap.set(fromEl, { zIndex: prevIdx + 5 });

        gsap
          .timeline({
            onComplete: () => {
              syncSectionStack(currentIdxRef.current);
              animatingRef.current = false;
            },
          })
          // Saliente: empujado hacia atrás (leve)
          .to(fromEl, { y: dir > 0 ? "-7%" : "7%", duration: 0.82, ease: "power2.in" }, 0)
          // Entrante: irrumpe desde el borde, frena al llegar — efecto masa
          .to(toEl, { y: "0%", duration: 0.82, ease: "power3.out" }, 0);
      });

      // Wheel / trackpad — acumulador con normalización por deltaMode
      // deltaMode 0 = píxeles (trackpad macOS), 1 = líneas (rueda de mouse)
      // Normalizamos para que el umbral sea el mismo en ambos dispositivos.
      let wheelAcc = 0;
      let wheelIdle: ReturnType<typeof setTimeout> | null = null;
      const WHEEL_THRESHOLD = 150;

      const onWheel = (e: Event) => {
        const we = e as WheelEvent;
        we.preventDefault();

        if (animatingRef.current) {
          wheelAcc = 0;
          return;
        }

        // Normalizar: líneas (~40px) y páginas (~800px) → píxeles equivalentes
        const normalized =
          we.deltaMode === 1
            ? we.deltaY * 40
            : we.deltaMode === 2
              ? we.deltaY * 800
              : we.deltaY;

        if (wheelIdle) clearTimeout(wheelIdle);
        wheelIdle = setTimeout(() => { wheelAcc = 0; }, 400);

        wheelAcc += normalized;

        if (Math.abs(wheelAcc) >= WHEEL_THRESHOLD) {
          const dir = wheelAcc > 0 ? 1 : -1;
          wheelAcc = 0;
          if (wheelIdle) { clearTimeout(wheelIdle); wheelIdle = null; }
          navigate(dir);
        }
      };

      // Teclado
      const onKey = (e: Event) => {
        const ke = e as KeyboardEvent;
        if (["ArrowDown", "PageDown", " "].includes(ke.key)) {
          ke.preventDefault();
          navigate(1);
        } else if (["ArrowUp", "PageUp"].includes(ke.key)) {
          ke.preventDefault();
          navigate(-1);
        }
      };

      // Touch / swipe
      let touchStartY = 0;
      const onTouchStart = (e: Event) => {
        touchStartY = (e as TouchEvent).touches[0]?.clientY ?? 0;
      };
      const onTouchEnd = (e: Event) => {
        const diff =
          touchStartY - ((e as TouchEvent).changedTouches[0]?.clientY ?? 0);
        if (Math.abs(diff) < 44) return;
        navigate(diff > 0 ? 1 : -1);
      };

      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("keydown", onKey);
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });

      return () => {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
        if (wheelIdle) clearTimeout(wheelIdle);
      };
    },
    { scope: wrapperRef, dependencies: [totalSections] },
  );

  return (
    <>
      {/* Estilos responsive inyectados — sin CSS modules */}
      <style>{STYLES}</style>

      <div
        ref={wrapperRef}
        className={className}
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          fontFamily: BODY,
          color: "#f3f1ec",
        }}
      >
        {/* Hero */}
        <div className="sa-section" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <HeroPanel
            brand={content.brand}
            {...(content.logoUrl !== undefined ? { logoUrl: content.logoUrl } : {})}
            brandSections={content.brandSections}
          />
        </div>

        {/* Secciones de marca
            zIndex: 1 por defecto (igual que el hero).
            transform CSS: translateY(100%) — off-screen hasta que GSAP toma control.
            Si GSAP revierte al desmontar, la sección queda debajo del viewport
            en lugar de cubrir el hero (bug Morini al volver a la tab). */}
        {content.brandSections.map((brand, i) => (
          <div
            key={brand.id}
            id={brand.id}
            className="sa-section"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              transform: "translateY(100%)",
            }}
          >
            <BrandPanel brand={brand} />
          </div>
        ))}

        {/* Nav dots */}
        <SectionDots
          total={totalSections}
          active={activeIdx}
          brands={content.brandSections}
        />
      </div>
    </>
  );
}
