"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionStyle,
} from "framer-motion";
import type { Route } from "next";

import type { SportAdventureHomeProps } from "@/lib/experiences/sportadventure";
import {
  SPORTADVENTURE_EDITORIAL_IMAGES,
  SPORTADVENTURE_LOGO_BLOB_URLS,
} from "@/lib/experiences/sportadventure/blob-assets";
import { appendTenantSlugForLocalDevHref } from "@/lib/marketing/pyme-store-host";

// ─── Design tokens ────────────────────────────────────────────────────────────
const DISPLAY =
  '"Eurostile", "Microgramma D Extended", "Arial Narrow", sans-serif';
const BODY =
  '"Avenir Next Condensed", "Franklin Gothic Medium", "Helvetica Neue", sans-serif';
const ORANGE = "#ff6a00";
const VIDEO_SCRUB_START = 0.15;
const VIDEO_SCRUB_END = 0.565;
const VIDEO_MAX_SCRUB_SECONDS = 6;
const VIDEO_SEEK_EPSILON_SECONDS = 1 / 24;
const VIDEO_SEEK_MIN_INTERVAL_MS = 48;

// Logos en Vercel Blob (subidos desde pymeinteligente)
const LOGO_MAP: Record<string, string> = SPORTADVENTURE_LOGO_BLOB_URLS;

function editorialPanelBackground(imageUrl: string) {
  return {
    backgroundImage: `linear-gradient(to top, rgba(0,0,0,.9) 0%, rgba(0,0,0,.5) 42%, rgba(0,0,0,.12) 100%), url("${imageUrl}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

const MOBILE_MAX_WIDTH = 768;

function subscribeMobileMq(onStoreChange: () => void) {
  const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMobileSnapshot() {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
}

/** Mobile-first: en SSR asumimos móvil hasta hidratar. */
function useIsMobile() {
  return useSyncExternalStore(subscribeMobileMq, getMobileSnapshot, () => true);
}

type BrandLogo = { id: string; name: string; src: string; accent: string };

const DARK_LOGO_IDS = new Set(["ktm", "cfmoto", "can-am", "super-soco"]);

const chipBrandStyle = (accent: string) =>
  ({ "--brand-accent": accent }) as MotionStyle;

function brandChipClassName(brand: BrandLogo, extraClassName = "") {
  return [
    "sa-brand-chip",
    DARK_LOGO_IDS.has(brand.id) ? "sa-brand-chip--dark-logo" : "",
    extraClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Desktop / carrusel — hover con estado explícito (evita capas que bloquean :hover). */
function BrandLogoChip({ brand, delay = 0 }: { brand: BrandLogo; delay?: number }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const active = hovered || pressed;

  const pressOn = useCallback(() => setPressed(true), []);
  const pressOff = useCallback(() => setPressed(false), []);

  return (
    <motion.div
      className={brandChipClassName(brand, active ? "sa-brand-chip--active" : "")}
      style={chipBrandStyle(brand.accent)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      animate={{
        y: active ? -10 : 0,
        scale: active ? 1.08 : 1,
      }}
      transition={{
        delay,
        duration: 0.35,
        y: { type: "spring", stiffness: 400, damping: 20 },
        scale: { type: "spring", stiffness: 400, damping: 20 },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={pressOn}
      onPointerUp={pressOff}
      onPointerCancel={pressOff}
    >
      <img src={brand.src} alt={brand.name} />
    </motion.div>
  );
}

/** Móvil — logos legibles con soporte neutral, sin glow cromático por badge. */
function ScrollBrandLogoChip({
  brand,
}: {
  brand: BrandLogo;
}) {
  return (
    <motion.div
      className={brandChipClassName(brand, "sa-brand-chip--scroll")}
      style={chipBrandStyle(brand.accent)}
    >
      <img src={brand.src} alt={brand.name} />
    </motion.div>
  );
}

function EditorialCatalogPanel({
  catalogUrl,
  className,
  style,
  title,
  body,
  compact = false,
}: {
  catalogUrl: string;
  className: string;
  style: CSSProperties;
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={catalogUrl as Route}
      className={`${className} sa-act4-panel--link`}
      style={{
        ...style,
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
      }}
      aria-label={`${title} — ir al catálogo`}
    >
      <motion.div
        style={{
          borderTop: `2px solid ${ORANGE}`,
          paddingTop: compact ? "clamp(12px,2vh,18px)" : "clamp(14px,2vh,22px)",
        }}
      >
        <h3
          style={{
            fontFamily: DISPLAY,
            fontSize: compact
              ? "clamp(1.5rem,3vw,2.4rem)"
              : "clamp(2rem,4vw,3.5rem)",
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
            margin: compact ? "0 0 10px" : "0 0 12px",
            color: "#fff",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: BODY,
            fontSize: compact
              ? "clamp(.7rem,1vw,.88rem)"
              : "clamp(.75rem,1.1vw,.95rem)",
            color: compact ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.45)",
            letterSpacing: ".06em",
            lineHeight: compact ? 1.6 : 1.65,
            margin: 0,
          }}
        >
          {body}
        </p>
      </motion.div>
    </Link>
  );
}

// ─── Act 5 CTA (reutilizado en sticky + cierre fijo) ─────────────────────────
function Act5Cta({ catalogUrl }: { catalogUrl: string }) {
  return (
    <>
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at center,rgba(255,106,0,.14) 0%,transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "0 clamp(24px,8vw,120px)",
          pointerEvents: "auto",
        }}
      >
        <h2
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(2.8rem,7.5vw,6rem)",
            lineHeight: 0.88,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
            margin: "0 0 clamp(32px,5vh,56px)",
            color: "#fff",
          }}
        >
          ¿LISTO PARA
          <br />
          LA PRÓXIMA SALIDA?
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "clamp(12px,2vw,18px)",
          }}
        >
          <Link
            href={catalogUrl as Route}
            style={{
              display: "inline-block",
              padding: "clamp(13px,1.8vh,17px) clamp(28px,4vw,48px)",
              background: ORANGE,
              color: "#000",
              fontFamily: BODY,
              fontSize: "clamp(.76rem,1.1vw,.92rem)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 999,
            }}
          >
            Explorar Catálogo
          </Link>
          <a
            href="https://wa.me/5493416476751"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "clamp(13px,1.8vh,17px) clamp(28px,4vw,48px)",
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.22)",
              fontFamily: BODY,
              fontSize: "clamp(.76rem,1.1vw,.92rem)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              textDecoration: "none",
              borderRadius: 999,
            }}
          >
            Consultar por WhatsApp
          </a>
        </div>
      </motion.div>
    </>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({
  brand,
  logoUrl,
  catalogUrl,
}: {
  brand: string;
  logoUrl?: string;
  catalogUrl: string;
}) {
  return (
    <nav
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "clamp(20px,4vh,36px) clamp(24px,5vw,64px)",
        pointerEvents: "none",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brand}
            style={{ height: 28, objectFit: "contain" }}
          />
        ) : (
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#fff",
            }}
          >
            {brand}
          </span>
        )}
      </div>
      <a
        href={catalogUrl}
        style={{
          pointerEvents: "auto",
          fontFamily: BODY,
          fontSize: "0.68rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.7)",
          textDecoration: "none",
        }}
      >
        Catálogo
      </a>
    </nav>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SportAdventureHome({
  content,
  navigationContext,
}: SportAdventureHomeProps) {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const act1Ref  = useRef<HTMLDivElement>(null);
  const act2Ref  = useRef<HTMLDivElement>(null);
  const act3Ref  = useRef<HTMLDivElement>(null);
  const pendingVideoProgressRef = useRef(0);
  const videoSeekRafRef = useRef<number | null>(null);
  const lastVideoSeekTimeRef = useRef(-1);
  const lastVideoSeekMsRef = useRef(0);

  // Progreso 0→1 ligado al canvas de 700vh (no al documento entero)
  const { scrollYProgress } = useScroll({
    target: canvasRef,
    offset: ["start start", "end end"],
  });

  const scheduleVideoScrub = useCallback((progress: number) => {
    pendingVideoProgressRef.current = progress;
    if (videoSeekRafRef.current !== null) return;

    videoSeekRafRef.current = window.requestAnimationFrame((now) => {
      videoSeekRafRef.current = null;

      const video = videoRef.current;
      if (!video || !(video.duration > 0)) return;

      const duration = Math.min(video.duration, VIDEO_MAX_SCRUB_SECONDS);
      const rawProgress =
        (pendingVideoProgressRef.current - VIDEO_SCRUB_START) /
        (VIDEO_SCRUB_END - VIDEO_SCRUB_START);
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      const targetTime = clampedProgress * duration;
      const currentTargetDelta = Math.abs(targetTime - lastVideoSeekTimeRef.current);

      if (
        currentTargetDelta < VIDEO_SEEK_EPSILON_SECONDS ||
        now - lastVideoSeekMsRef.current < VIDEO_SEEK_MIN_INTERVAL_MS
      ) {
        return;
      }

      lastVideoSeekTimeRef.current = targetTime;
      lastVideoSeekMsRef.current = now;
      video.currentTime = targetTime;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (videoSeekRafRef.current !== null) {
        window.cancelAnimationFrame(videoSeekRafRef.current);
      }
    };
  }, []);

  // ── Video scrubbing ───────────────────────────────────────────────────────
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scheduleVideoScrub(v);

    // Destroy Act 1 GPU layer the moment it's past its fade range.
    // Watching scrollYProgress (not a1Opacity) avoids the framer-motion
    // initialization-at-0 bug that caused display:"" to break flex layout.
    if (act1Ref.current) {
      act1Ref.current.style.display = v >= 0.14 ? "none" : "flex";
    }
    if (act2Ref.current) {
      act2Ref.current.style.display = v >= VIDEO_SCRUB_END ? "none" : "block";
    }
    if (act3Ref.current) {
      act3Ref.current.style.pointerEvents = v >= 0.92 ? "none" : "auto";
    }
  });

  // ── Act 1: Intro (0 → 14%) ────────────────────────────────────────────────
  const a1Opacity = useTransform(scrollYProgress, [0, 0.13], [1, 0]);
  // Scale: 1 → 2.8 durante el fade — efecto cinematográfico de atravesar el texto
  const a1Scale   = useTransform(scrollYProgress, [0, 0.14], [1, 2.8]);

  // ── Act 2: Video (12% → 56.5%) — sale exactamente cuando termina el scrub visible ─
  const a2Opacity = useTransform(
    scrollYProgress,
    [0.12, 0.19, 0.525, 0.565],
    [0, 1, 1, 0]
  );
  const t1 = useTransform(scrollYProgress, [0.21, 0.27, 0.30, 0.35], [0, 1, 1, 0]);
  const t2 = useTransform(scrollYProgress, [0.35, 0.40, 0.44, 0.49], [0, 1, 1, 0]);
  const t3 = useTransform(scrollYProgress, [0.465, 0.5, 0.535, 0.56], [0, 1, 1, 0]);

  // ── Act 3: Brands (48% → 92%) — precarga detrás del video para evitar negro al corte ─
  const a3Opacity = useTransform(
    scrollYProgress,
    [0.48, 0.52, 0.84, 0.92],
    [0, 1, 1, 0]
  );
  // ── Act 4: Editorial (80% → 98%) — entra debajo del fade de logos, sin tramo negro ─
  const a4Opacity = useTransform(
    scrollYProgress,
    [0.8, 0.825, 0.955, 0.985],
    [0, 1, 1, 0]
  );

  // ── Act 5: CTA (94% → 100%) ───────────────────────────────────────────────
  const a5Opacity = useTransform(
    scrollYProgress,
    [0.94, 0.97, 1, 1],
    [0, 1, 1, 1]
  );

  // ── Scroll hint arrow ─────────────────────────────────────────────────────
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.03, 0.10], [1, 1, 0]);

  const catalogUrl = navigationContext
    ? appendTenantSlugForLocalDevHref(
        "/catalogo",
        navigationContext.host,
        navigationContext.tenantSlug
      )
    : "/catalogo";

  const logos = content.brandSections
    .slice(0, 12)
    .map((b) => ({
      id: b.id,
      name: b.name,
      src: LOGO_MAP[b.id],
      accent: b.accent,
    }))
    .filter(
      (b): b is BrandLogo => Boolean(b.src)
    );

  const row1Logos = logos.slice(0, 6);
  const row2Logos = logos.slice(6);

  const editorialImages = isMobile
    ? {
        indumentaria: SPORTADVENTURE_EDITORIAL_IMAGES.indumentariaMobile,
        repuestos: SPORTADVENTURE_EDITORIAL_IMAGES.repuestosMobile,
        taller: SPORTADVENTURE_EDITORIAL_IMAGES.tallerMobile,
      }
    : {
        indumentaria: SPORTADVENTURE_EDITORIAL_IMAGES.indumentariaDesktop,
        repuestos: SPORTADVENTURE_EDITORIAL_IMAGES.repuestosDesktop,
        taller: SPORTADVENTURE_EDITORIAL_IMAGES.tallerDesktop,
      };

  return (
    <>
    {/*
     * 700vh canvas — scroll distance de la experiencia.
     * globals.css: .tenant-theme:has(.custom-experience-root) → overflow:visible; height:auto
     */}
    <div
      ref={canvasRef}
      style={{
        position: "relative",
        height: "700vh",
        background: "#000",
        color: "#fff",
      }}
    >
      {/* Sticky viewport — all acts stacked absolutely inside */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          overflow: "hidden",
        }}
      >
        <Navbar
          brand={content.brand}
          {...(content.logoUrl ? { logoUrl: content.logoUrl } : {})}
          catalogUrl={catalogUrl}
        />

        {/* ── ACT 1: La Entrada ──────────────────────────────────────────── */}
        <motion.div
          ref={act1Ref}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            zIndex: 10,
            opacity: a1Opacity,
            scale: a1Scale,
          }}
        >
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(3.5rem, 11vw, 9rem)",
              lineHeight: 0.88,
              letterSpacing: "-0.04em",
              textAlign: "center",
              textTransform: "uppercase",
              margin: 0,
              color: "#fff",
            }}
          >
            SPORT
            <br />
            ADVENTURE
          </h1>
          <p
            style={{
              margin: "clamp(16px,2.5vh,28px) 0 0",
              fontFamily: BODY,
              fontSize: "clamp(0.62rem,1.1vw,0.9rem)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Motos&nbsp;·&nbsp;Indumentaria&nbsp;·&nbsp;Repuestos&nbsp;·&nbsp;Taller
          </p>
        </motion.div>

        {/* ── ACT 2: Product Reveal ──────────────────────────────────────── */}
        <motion.div
          ref={act2Ref}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            opacity: a2Opacity,
            pointerEvents: "none",
          }}
        >
          <video
            ref={videoRef}
            src="/videos/ktm-reveal.mp4"
            muted
            playsInline
            preload="auto"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: isMobile ? "58% 42%" : "50% 50%",
              transform: isMobile ? "scale(1.06)" : undefined,
              transformOrigin: "center center",
              display: "block",
            }}
          />
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: isMobile
                ? "linear-gradient(to bottom,rgba(0,0,0,.65) 0%,rgba(0,0,0,.2) 40%,rgba(0,0,0,.85) 100%)"
                : "linear-gradient(to bottom,rgba(0,0,0,.3) 0%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.55) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* "Ready to Race" */}
          <motion.div
            style={{
              position: "absolute",
              opacity: t1,
              ...(isMobile
                ? { bottom: "30%", left: 20, right: 20 }
                : { bottom: "18%", left: "8%" }),
            }}
          >
            <h2
              style={{
                fontFamily: DISPLAY,
                fontSize: isMobile
                  ? "clamp(1.65rem, 8vw, 2.4rem)"
                  : "clamp(2rem,5.5vw,4.5rem)",
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
                margin: 0,
                color: "#fff",
                textShadow: "0 2px 32px rgba(0,0,0,.8)",
              }}
            >
              Ready to Race
            </h2>
          </motion.div>

          {/* "Born in Europe." */}
          <motion.div
            style={{
              position: "absolute",
              opacity: t2,
              ...(isMobile
                ? {
                    bottom: "46%",
                    left: 20,
                    right: 20,
                    top: "auto",
                    textAlign: "left",
                  }
                : { top: "28%", right: "8%", textAlign: "right" }),
            }}
          >
            <h2
              style={{
                fontFamily: DISPLAY,
                fontSize: isMobile
                  ? "clamp(1.65rem, 8vw, 2.4rem)"
                  : "clamp(2rem,5.5vw,4.5rem)",
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
                margin: 0,
                color: "#fff",
                textShadow: "0 2px 32px rgba(0,0,0,.8)",
              }}
            >
              Born in Europe.
            </h2>
            <p
              style={{
                fontFamily: BODY,
                fontSize: isMobile
                  ? "clamp(0.62rem, 2.8vw, 0.78rem)"
                  : "clamp(0.78rem,1.2vw,1rem)",
                color: "rgba(255,255,255,.65)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "10px 0 0",
              }}
            >
              Perfeccionada en la pista.
            </p>
          </motion.div>

          {/* "Agentes Oficiales" */}
          <motion.div
            style={{
              position: "absolute",
              opacity: t3,
              ...(isMobile
                ? { bottom: "14%", left: 20, right: 20, textAlign: "left" }
                : { bottom: "18%", right: "8%", textAlign: "right" }),
            }}
          >
            <h2
              style={{
                fontFamily: DISPLAY,
                fontSize: isMobile
                  ? "clamp(1.85rem, 9vw, 2.75rem)"
                  : "clamp(2.5rem,6vw,5rem)",
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                lineHeight: 0.88,
                margin: 0,
                color: ORANGE,
                textShadow: "0 0 60px rgba(255,106,0,.6)",
              }}
            >
              Agentes
              <br />
              Oficiales
            </h2>
          </motion.div>
        </motion.div>

        {/* ── ACT 3: Constelación de Marcas ──────────────────────────────── */}
        <motion.div
          ref={act3Ref}
          className="sa-act3"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            opacity: a3Opacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: isMobile ? "clamp(64px,9svh,84px)" : 0,
            paddingBottom: isMobile ? "clamp(48px,8svh,72px)" : 0,
            background: "radial-gradient(ellipse at center,#0d0d0d 0%,#000 70%)",
            pointerEvents: "auto",
          }}
        >
          {/* Copy — entra primero */}
          <motion.div
            className="sa-act3-copy"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55 }}
            style={{
              textAlign: "center",
              marginBottom: isMobile ? "clamp(16px,3vh,28px)" : "clamp(28px,5vh,52px)",
              padding: isMobile ? "0 clamp(16px,5vw,24px)" : 0,
            }}
          >
            <p
              style={{
                fontFamily: BODY,
                fontSize: isMobile
                  ? "clamp(0.58rem,.85vw,.76rem)"
                  : "clamp(0.72rem,0.95vw,1rem)",
                letterSpacing: isMobile ? "0.4em" : "0.34em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.62)",
                textShadow: "0 0 22px rgba(255,255,255,.16)",
                margin: isMobile ? "0 0 8px" : "0 0 clamp(10px,1.5vh,16px)",
              }}
            >
              No somos una marca.
            </p>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontSize: isMobile
                  ? "clamp(2rem, 10vw, 3.25rem)"
                  : "clamp(2.5rem,7vw,5.5rem)",
                textTransform: "uppercase",
                letterSpacing: "-0.04em",
                lineHeight: 0.88,
                margin: 0,
                color: "#fff",
              }}
            >
              Somos todas.
            </h2>
          </motion.div>

          {isMobile ? (
            <div className="sa-brands-mobile">
              <div className="sa-brands-grid">
                {row1Logos.map((brand) => (
                  <ScrollBrandLogoChip
                    key={brand.id}
                    brand={brand}
                  />
                ))}
              </div>
              <div className="sa-brands-grid">
                {row2Logos.map((brand) => (
                  <ScrollBrandLogoChip
                    key={brand.id}
                    brand={brand}
                  />
                ))}
              </div>
            </div>
          ) : (
            <motion.div className="sa-brands-desktop-grid">
              {logos.map((brand, i) => (
                <BrandLogoChip
                  key={brand.id}
                  brand={brand}
                  delay={i * 0.035}
                />
              ))}
            </motion.div>
          )}

        </motion.div>

        {/* ── ACT 4: Ecosistema Editorial ────────────────────────────────── */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            opacity: a4Opacity,
            background: "#050505",
            pointerEvents: "auto",
          }}
        >
          <motion.div
            className="sa-act4-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              height: "100%",
            }}
          >
            <EditorialCatalogPanel
              catalogUrl={catalogUrl}
              className="sa-act4-panel sa-act4-panel--tall"
              style={{
                gridColumn: 1,
                gridRow: "1 / 3",
                ...editorialPanelBackground(editorialImages.indumentaria),
                borderRight: "1px solid rgba(255,255,255,.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "clamp(24px,5vw,60px)",
              }}
              title="Indumentaria"
              body="Equipamiento técnico y ropa de moto de las mejores marcas del mundo."
            />

            <EditorialCatalogPanel
              catalogUrl={catalogUrl}
              className="sa-act4-panel"
              style={{
                gridColumn: 2,
                gridRow: 1,
                ...editorialPanelBackground(editorialImages.repuestos),
                borderBottom: "1px solid rgba(255,255,255,.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "clamp(20px,4vw,48px)",
              }}
              title="Repuestos"
              body="Piezas originales y aftermarket para todas las marcas que representamos."
              compact
            />

            {/* Taller — derecha abajo */}
            <motion.div
              className="sa-act4-panel"
              style={{
                gridColumn: 2,
                gridRow: 2,
                ...editorialPanelBackground(editorialImages.taller),
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "clamp(20px,4vw,48px)",
              }}
            >
              <div style={{ borderTop: `2px solid ${ORANGE}`, paddingTop: "clamp(12px,2vh,18px)" }}>
                <h3 style={{ fontFamily: DISPLAY, fontSize: "clamp(1.5rem,3vw,2.4rem)", textTransform: "uppercase", letterSpacing: "-0.03em", margin: "0 0 10px", color: "#fff" }}>
                  Taller
                </h3>
                <p style={{ fontFamily: BODY, fontSize: "clamp(.7rem,1vw,.88rem)", color: "rgba(255,255,255,.4)", letterSpacing: ".06em", lineHeight: 1.6, margin: 0 }}>
                  Servicio técnico oficial. Mecánicos certificados por las marcas.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── ACT 5: Cierre Comercial ────────────────────────────────────── */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 25,
            opacity: a5Opacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#030303",
            pointerEvents: "none",
          }}
        >
          <Act5Cta catalogUrl={catalogUrl} />
        </motion.div>

        {/* ── Scroll hint ────────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            x: "-50%",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: arrowOpacity,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: BODY,
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.4)",
            }}
          >
            Scroll
          </span>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <path
              d="M7 1v14M1 9l6 6 6-6"
              stroke="rgba(255,255,255,.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </div>

    {/* Cierre fijo: visible al terminar el canvas cuando el sticky se desancla */}
    <section
      className="sa-page-finale"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#030303",
        color: "#fff",
      }}
    >
      <Act5Cta catalogUrl={catalogUrl} />
    </section>
    </>
  );
}
