"use client";

import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BadgePercent, CreditCard, ShieldCheck, Truck, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";

import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";
import type { BymBenefit } from "@/components/storefront/bym-home-motion";

export type { BymBenefit };

export type BymHeroScrollSceneProps = {
  videoUrl?: string;
  desktopImage?: { src: string; alt?: string } | null | undefined;
  mobileImage?: { src: string; alt?: string } | null | undefined;
  storeName: string;
  h1: string;
  intro?: string | undefined;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  benefits: BymBenefit[];
  benefitsEyebrow: string;
  benefitsTitle: string;
  installmentsCount?: number;
  categoriesCount: number;
};

// ---------------------------------------------------------------------------
// Benefit card helpers (copied from bym-home-motion.tsx)
// ---------------------------------------------------------------------------

type BenefitVisual = {
  Icon: LucideIcon;
  accentClassName: string;
  titleAccentClassName: string;
  eyebrow: string;
  logos: string[];
};

function normalizeBenefitKind(benefit: BymBenefit): NonNullable<BymBenefit["kind"]> {
  if (benefit.kind) {
    return benefit.kind;
  }

  const normalizedText = `${benefit.title} ${benefit.description ?? ""}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  if (normalizedText.includes("cuota") || normalizedText.includes("mercado")) {
    return "installments";
  }

  if (normalizedText.includes("envio") || normalizedText.includes("despacho")) {
    return "shipping";
  }

  if (normalizedText.includes("descuento") || normalizedText.includes("promo")) {
    return "discounts";
  }

  if (normalizedText.includes("armado") || normalizedText.includes("balanceado")) {
    return "service";
  }

  return "trust";
}

function getBenefitVisual(benefit: BymBenefit): BenefitVisual {
  const kind = normalizeBenefitKind(benefit);
  const visuals: Record<NonNullable<BymBenefit["kind"]>, BenefitVisual> = {
    installments: {
      Icon: CreditCard,
      accentClassName: "from-[#00b1ea]/18 via-[#00a650]/10 to-white/[0.04]",
      titleAccentClassName: "text-[#65d8ff]",
      eyebrow: "Financiación",
      logos: ["Mercado Pago", "Visa", "Mastercard", "Amex"],
    },
    shipping: {
      Icon: Truck,
      accentClassName: "from-[#00a650]/18 via-[#f4c542]/10 to-white/[0.03]",
      titleAccentClassName: "text-[#78f2b5]",
      eyebrow: "Logística",
      logos: ["Andreani", "Vía Cargo"],
    },
    discounts: {
      Icon: BadgePercent,
      accentClassName: "from-[#f4c542]/22 via-[#00b1ea]/10 to-white/[0.03]",
      titleAccentClassName: "text-[#f4c542]",
      eyebrow: "Promociones",
      logos: ["Transferencia", "Ofertas"],
    },
    service: {
      Icon: Wrench,
      accentClassName: "from-[#5ddcff]/16 via-white/[0.07] to-white/[0.03]",
      titleAccentClassName: "text-[#9ee7ff]",
      eyebrow: "Taller",
      logos: ["Armado", "Balanceado"],
    },
    trust: {
      Icon: ShieldCheck,
      accentClassName: "from-[#00a650]/14 via-white/[0.08] to-white/[0.03]",
      titleAccentClassName: "text-[#78f2b5]",
      eyebrow: "Compra segura",
      logos: ["Stock", "Asesoramiento"],
    },
  };

  return visuals[kind];
}

function BrandMark({ label }: { label: string }) {
  return (
    <span
      className="inline-flex h-8 shrink-0 items-center rounded-full border border-white/14 bg-white px-3 text-[10px] font-black uppercase tracking-[0.06em] text-black shadow-[0_10px_28px_rgba(0,0,0,0.24)]"
      aria-label={label}
    >
      {label}
    </span>
  );
}

function getTitleHighlightPhrases(benefit: BymBenefit): string[] {
  const kind = normalizeBenefitKind(benefit);

  if (kind === "installments") {
    return ["cuotas sin interés", "cuotas sin interes"];
  }

  if (kind === "shipping") {
    return ["envíos gratis", "envios gratis", "envío gratis", "envio gratis"];
  }

  if (kind === "discounts") {
    return ["descuentos activos", "descuentos"];
  }

  if (kind === "service") {
    return ["armado y balanceado", "bonificado"];
  }

  return [];
}

function HighlightedBenefitTitle({
  benefit,
  className,
  titleAccentClassName,
}: {
  benefit: BymBenefit;
  className: string;
  titleAccentClassName: string;
}) {
  const normalizedTitle = benefit.title.toLowerCase();
  const phrase = getTitleHighlightPhrases(benefit).find((candidate) =>
    normalizedTitle.includes(candidate),
  );

  if (!phrase) {
    return <h3 className={className}>{benefit.title}</h3>;
  }

  const start = normalizedTitle.indexOf(phrase);
  const end = start + phrase.length;

  return (
    <h3 className={className}>
      {benefit.title.slice(0, start)}
      <span className={titleAccentClassName}>{benefit.title.slice(start, end)}</span>
      {benefit.title.slice(end)}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function invLerp(a: number, b: number, v: number): number {
  if (b === a) return 0;
  return clamp01((v - a) / (b - a));
}

// ---------------------------------------------------------------------------
// Benefit card sub-component
// ---------------------------------------------------------------------------

function BenefitCard({
  benefit,
  index,
  installmentsCount,
}: {
  benefit: BymBenefit;
  index: number;
  installmentsCount?: number;
}) {
  const visual = getBenefitVisual(benefit);
  const Icon = visual.Icon;
  const description =
    normalizeBenefitKind(benefit) === "installments" && installmentsCount
      ? benefit.description?.replace(/\{\{installmentsCount\}\}/g, String(installmentsCount))
      : benefit.description;

  return (
    <article
      key={`${benefit.title}-${index}`}
      className="relative grid h-[20rem] min-w-[76vw] overflow-hidden rounded-2xl border border-white/14 bg-[#151515] p-5 shadow-[0_18px_64px_rgba(0,0,0,0.26)] backdrop-blur sm:min-w-[25rem] sm:p-6 lg:h-[21rem] lg:min-w-[30rem]"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${visual.accentClassName}`}
        aria-hidden="true"
      />
      <div
        className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10 bg-white/[0.05]"
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-white/16 bg-white/92 text-black">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/52">
            {visual.eyebrow}
          </span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative z-10 self-end">
        <div className="mb-4 flex max-w-full flex-wrap gap-2">
          {visual.logos.map((logo) => (
            <BrandMark key={logo} label={logo} />
          ))}
        </div>
        <HighlightedBenefitTitle
          benefit={benefit}
          className="max-w-[15ch] text-2xl font-semibold leading-[1.02] text-white sm:text-3xl lg:text-[2.1rem]"
          titleAccentClassName={visual.titleAccentClassName}
        />
        {description ? (
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/72">{description}</p>
        ) : null}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BymHeroScrollScene({
  videoUrl,
  desktopImage,
  mobileImage,
  storeName,
  h1,
  intro,
  primaryCta,
  secondaryCta,
  benefits,
  benefitsEyebrow,
  benefitsTitle,
  installmentsCount,
  categoriesCount,
}: BymHeroScrollSceneProps) {
  const reduceMotion = useReducedMotion();
  const animate = reduceMotion === false;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [sectionHeight, setSectionHeight] = useState(0);
  const [stickyOffset, setStickyOffset] = useState(0);

  // Store latest metrics in a ref to avoid stale closures in the scroll event handler
  const metricsRef = useRef({ ht: 0, vh: 0 });

  // Motion values — all imperative, no static useTransform ranges
  const heroOpacity = useMotionValue(1);
  const heroY = useMotionValue(0);
  const sheetYNum = useMotionValue(100); // 100 = fully below, 0 = fully visible
  const sheetY = useTransform(sheetYNum, (v) => `${v}%`);
  const cardX = useMotionValue(0);
  const progressScaleX = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Metrics calculation
  useEffect(() => {
    const update = () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      const vh = window.innerHeight;
      const ht =
        track && viewport ? Math.max(0, track.scrollWidth - viewport.clientWidth) : 0;
      metricsRef.current = { ht, vh };
      setSectionHeight(vh + 2 * vh + ht);

      const header = document.querySelector<HTMLElement>("[data-bym-header-state]");
      if (header) setStickyOffset(Math.round(header.getBoundingClientRect().height));
    };

    update();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (trackRef.current && ro) ro.observe(trackRef.current);
    if (viewportRef.current && ro) ro.observe(viewportRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [benefits.length]);

  // Non-animated fallback: immediately snap to resting positions
  useEffect(() => {
    if (!animate) {
      sheetYNum.set(0);
      heroOpacity.set(1);
      progressScaleX.set(1);
    }
  }, [animate, sheetYNum, heroOpacity, progressScaleX]);

  // Imperative scroll driver
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!animate) return;

    const { ht, vh } = metricsRef.current;
    const totalExtra = 2 * vh + ht;
    if (totalExtra === 0) return;

    const fVideoEnd = (2 * vh) / totalExtra;
    const fHeroFade = (0.55 * vh) / totalExtra;
    const fSheetStart = (1.0 * vh) / totalExtra;
    const fSheetEnd = fVideoEnd;

    // 1. Hero opacity: 1 → 0 over [0, fHeroFade]
    heroOpacity.set(1 - clamp01(invLerp(0, fHeroFade, v)));

    // 2. Hero Y: 0 → -24px over [0, fHeroFade]
    heroY.set(-24 * clamp01(invLerp(0, fHeroFade, v)));

    // 3. Sheet Y: 100 → 0 over [fSheetStart, fSheetEnd] with easeOutCubic
    if (v < fSheetStart) {
      sheetYNum.set(100);
    } else if (v > fSheetEnd) {
      sheetYNum.set(0);
    } else {
      const t = invLerp(fSheetStart, fSheetEnd, v);
      sheetYNum.set(100 * (1 - easeOutCubic(t)));
    }

    // 4. Card X: 0 → -horizontalTravel over [fSheetEnd, 1.0] with easeInOutQuad
    if (v <= fSheetEnd) {
      cardX.set(0);
      progressScaleX.set(0);
    } else {
      const t = invLerp(fSheetEnd, 1.0, v);
      cardX.set(-ht * easeInOutQuad(t));
      progressScaleX.set(t);
    }

    // 5. Video time scrubbing
    const video = videoRef.current;
    if (video && video.readyState >= 2 && video.duration > 0 && fSheetEnd > 0) {
      video.currentTime = Math.min(1, v / fSheetEnd) * video.duration;
    }
  });

  const fallbackImage = desktopImage ?? mobileImage;

  const wrapperStyle = animate
    ? { minHeight: sectionHeight > 0 ? `${sectionHeight}px` : "300dvh" }
    : { minHeight: "200dvh" };

  return (
    <div ref={wrapperRef} data-bym-fullbleed="true" style={wrapperStyle}>
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-dvh overflow-hidden bg-black text-white">

        {/* ---------------------------------------------------------------- */}
        {/* Background: video (primary) or image fallback                    */}
        {/* ---------------------------------------------------------------- */}
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        ) : fallbackImage ? (
          <picture className="absolute inset-0 z-0 block h-full w-full">
            {mobileImage ? (
              <source media="(max-width: 767px)" srcSet={mobileImage.src} />
            ) : null}
            {desktopImage ? (
              <source media="(min-width: 768px)" srcSet={desktopImage.src} />
            ) : null}
            <img
              src={fallbackImage.src}
              alt={desktopImage?.alt ?? mobileImage?.alt ?? storeName}
              className="h-full w-full object-cover"
            />
          </picture>
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_20%,rgba(244,197,66,0.22),transparent_32%),linear-gradient(135deg,#111,#050505)]" />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/82 via-black/30 to-black/8" />
        <div className="absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-black/42 to-transparent" />

        {/* ---------------------------------------------------------------- */}
        {/* Hero content                                                      */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          className="relative z-20 flex h-full items-end"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-12 sm:px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(280px,0.28fr)] lg:px-8 lg:pb-16">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f4c542]">
                {storeName}
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                {h1}
              </h1>
              {intro ? (
                <p className="mt-6 max-w-2xl text-base leading-7 text-white/76 sm:text-lg">
                  {intro}
                </p>
              ) : null}
            </div>

            <div className="grid content-end gap-5 lg:justify-items-end">
              <p className="max-w-xs text-sm leading-6 text-white/68">
                {categoriesCount > 0
                  ? `${categoriesCount} categorías publicadas para compra online.`
                  : "Catálogo preparado para compra online y consulta comercial."}
              </p>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href={primaryCta.href as Route}
                  prefetch={shouldPrefetchStorefrontLink(primaryCta.href)}
                  className="inline-flex min-h-12 items-center bg-white px-5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-[#f4c542]"
                >
                  {primaryCta.label}
                </Link>
                <Link
                  href={secondaryCta.href as Route}
                  prefetch={shouldPrefetchStorefrontLink(secondaryCta.href)}
                  className="inline-flex min-h-12 items-center border border-white/40 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
                >
                  {secondaryCta.label}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Benefits sheet                                                    */}
        {/* ---------------------------------------------------------------- */}
        {benefits.length > 0 ? (
          <motion.div
            className="absolute inset-x-0 bottom-0 z-30 h-full overflow-hidden rounded-t-[2rem] bg-[#070707]"
            style={{ y: sheetY }}
            aria-label="Beneficios"
          >
            {/* Handle pill */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20"
            />

            {/* Inner content */}
            <div
              className="flex h-full items-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16"
              style={{ paddingTop: stickyOffset > 0 ? `${stickyOffset + 40}px` : undefined }}
            >
              <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.45fr_0.55fr] lg:items-center lg:gap-8">
                {/* Left: eyebrow + title */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f4c542]">
                    {benefitsEyebrow}
                  </span>
                  <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight sm:text-5xl lg:mt-4">
                    {benefitsTitle}
                  </h2>
                </div>

                {/* Right: horizontally scrollable card track */}
                <div ref={viewportRef} className="min-w-0 overflow-hidden">
                  <motion.div
                    ref={trackRef}
                    className="flex gap-4 will-change-transform"
                    {...(animate ? { style: { x: cardX } } : {})}
                  >
                    {benefits.map((benefit, index) => (
                      <BenefitCard
                        key={`${benefit.title}-${index}`}
                        benefit={benefit}
                        index={index}
                        {...(installmentsCount !== undefined ? { installmentsCount } : {})}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#f4c542]/50"
              style={{ scaleX: progressScaleX }}
            />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
