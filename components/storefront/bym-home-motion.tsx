"use client";

import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { BadgePercent, CreditCard, ShieldCheck, Truck, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type BymBenefit = {
  kind?: "installments" | "shipping" | "discounts" | "service" | "trust";
  title: string;
  description?: string;
};

type BymHomeMotionProps = {
  benefitsEyebrow: string;
  benefitsTitle: string;
  benefits: BymBenefit[];
  installmentsCount?: number;
};

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
    .replace(/[\u0300-\u036f]/g, "")
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

export function BymHomeMotion({
  benefitsEyebrow,
  benefitsTitle,
  benefits,
  installmentsCount,
}: BymHomeMotionProps) {
  const benefitsSectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const virtualXRef = useRef(0);
  const touchPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastSectionAlignAtRef = useRef(0);
  const [travelDistance, setTravelDistance] = useState(0);
  const reduceMotion = useReducedMotion();
  const animate = reduceMotion === false;
  const x = useMotionValue(0);

  const setVirtualX = useCallback(
    (nextValue: number) => {
      const clampedValue = Math.max(0, Math.min(travelDistance, nextValue));
      virtualXRef.current = clampedValue;
      x.set(-clampedValue);
    },
    [travelDistance, x],
  );

  useEffect(() => {
    const updateDistance = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) {
        return;
      }

      const nextTravelDistance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      setTravelDistance(nextTravelDistance);
      virtualXRef.current = Math.min(virtualXRef.current, nextTravelDistance);
      x.set(-virtualXRef.current);
    };

    updateDistance();
    const resizeObserver = new ResizeObserver(updateDistance);
    if (viewportRef.current) resizeObserver.observe(viewportRef.current);
    if (trackRef.current) resizeObserver.observe(trackRef.current);
    window.addEventListener("resize", updateDistance);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDistance);
    };
  }, [benefits.length, x]);

  useEffect(() => {
    if (!animate || travelDistance <= 0) {
      return;
    }

    const getHeaderOffset = () => (window.innerWidth < 1024 ? 112 : 0);
    const getMaxStep = () => Math.max(160, Math.min(window.innerWidth * 0.62, 360));
    const clampDeltaStep = (delta: number) =>
      Math.sign(delta) * Math.min(Math.abs(delta) * 1.05, getMaxStep());

    const alignSectionToViewport = () => {
      const section = benefitsSectionRef.current;
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const headerOffset = getHeaderOffset();
      if (Math.abs(rect.top - headerOffset) <= 10) {
        return;
      }

      const now = window.performance.now();
      if (now - lastSectionAlignAtRef.current < 420) {
        return;
      }

      lastSectionAlignAtRef.current = now;
      window.scrollTo({
        top: window.scrollY + rect.top - headerOffset,
        behavior: "smooth",
      });
    };

    const isSectionActive = () => {
      const section = benefitsSectionRef.current;
      if (!section) {
        return false;
      }

      const rect = section.getBoundingClientRect();
      const headerOffset = getHeaderOffset();
      return (
        rect.top <= headerOffset + 8 &&
        rect.bottom >= headerOffset + window.innerHeight * 0.42
      );
    };

    const isSectionApproachingFromAbove = (delta: number) => {
      const section = benefitsSectionRef.current;
      if (!section || delta <= 0) {
        return false;
      }

      const rect = section.getBoundingClientRect();
      const headerOffset = getHeaderOffset();
      const catchDistance = Math.min(180, window.innerHeight * 0.22);
      return rect.top > headerOffset + 8 && rect.top <= headerOffset + catchDistance;
    };

    const shouldCaptureDelta = (delta: number) => {
      const current = virtualXRef.current;
      return (
        (delta > 0 && current < travelDistance) ||
        (delta < 0 && current > 0)
      );
    };

    const syncPositionAtBoundaries = () => {
      const section = benefitsSectionRef.current;
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const headerOffset = getHeaderOffset();
      if (rect.top > window.innerHeight * 0.35) {
        setVirtualX(0);
      } else if (rect.bottom < headerOffset + window.innerHeight * 0.35) {
        setVirtualX(travelDistance);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      const section = benefitsSectionRef.current;
      if (!section) {
        return;
      }

      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;
      if (delta === 0) {
        return;
      }

      const current = virtualXRef.current;
      if (!isSectionActive() && isSectionApproachingFromAbove(delta)) {
        event.preventDefault();
        alignSectionToViewport();
        return;
      }

      if (!isSectionActive()) {
        return;
      }

      if (!shouldCaptureDelta(delta)) {
        return;
      }

      event.preventDefault();
      setVirtualX(current + clampDeltaStep(delta));
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches.item(0);
      touchPointRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const previousPoint = touchPointRef.current;
      const touch = event.touches.item(0);
      if (!previousPoint || !touch) {
        touchPointRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        return;
      }

      const deltaY = previousPoint.y - touch.clientY;
      const deltaX = previousPoint.x - touch.clientX;
      const delta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;
      touchPointRef.current = { x: touch.clientX, y: touch.clientY };

      if (!isSectionActive() && isSectionApproachingFromAbove(delta)) {
        event.preventDefault();
        alignSectionToViewport();
        return;
      }

      if (!isSectionActive()) {
        return;
      }

      if (delta === 0 || !shouldCaptureDelta(delta)) {
        return;
      }

      event.preventDefault();
      setVirtualX(virtualXRef.current + clampDeltaStep(delta));
    };

    syncPositionAtBoundaries();
    window.addEventListener("scroll", syncPositionAtBoundaries, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("scroll", syncPositionAtBoundaries);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [animate, setVirtualX, travelDistance]);

  return (
    <>
      {benefits.length > 0 ? (
        <section
          ref={benefitsSectionRef}
          className="relative flex min-h-[calc(100dvh-var(--bym-shell-header-height))] items-center bg-[#070707] text-white lg:min-h-dvh"
          aria-label="Beneficios"
        >
          <div className="flex w-full items-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.45fr_0.55fr] lg:items-center lg:gap-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f4c542]">
                  {benefitsEyebrow}
                </span>
                <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight sm:text-5xl lg:mt-4">
                  {benefitsTitle}
                </h2>
              </div>
              <div ref={viewportRef} className="min-w-0 overflow-hidden">
                <motion.div
                  ref={trackRef}
                  className="flex gap-4"
                  {...(animate ? { style: { x } } : {})}
                >
                  {benefits.map((benefit, index) => {
                    const visual = getBenefitVisual(benefit);
                    const Icon = visual.Icon;
                    const description =
                      normalizeBenefitKind(benefit) === "installments" && installmentsCount
                        ? benefit.description?.replace(/\{\{installmentsCount\}\}/g, String(installmentsCount))
                        : benefit.description;

                    return (
                      <motion.article
                        key={`${benefit.title}-${index}`}
                        className="relative grid h-[20rem] min-w-[82vw] overflow-hidden border border-white/14 bg-[#151515] p-5 shadow-[0_18px_64px_rgba(0,0,0,0.26)] backdrop-blur sm:min-w-[25rem] sm:p-6 lg:h-[21rem] lg:min-w-[30rem]"
                        {...(animate
                          ? {
                              initial: { x: -56, opacity: 0 },
                              whileInView: { x: 0, opacity: 1 },
                              transition: { duration: 0.65, delay: index * 0.08, ease: "easeOut" as const },
                              viewport: { once: true, amount: 0.35 },
                            }
                          : {})}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${visual.accentClassName}`}
                          aria-hidden="true"
                        />
                        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10 bg-white/[0.05]" aria-hidden="true" />
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
                      </motion.article>
                    );
                  })}
                  <div
                    className="min-w-[56vw] shrink-0 sm:min-w-[18rem] lg:min-w-[28rem]"
                    aria-hidden="true"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
