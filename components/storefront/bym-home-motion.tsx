"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BadgePercent, CreditCard, ShieldCheck, Truck, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  calculateBymHorizontalScrollMetrics,
  type BymHorizontalScrollMetrics,
} from "@/lib/storefront/bym-horizontal-scroll";

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

function readBymStickyOffset(section: HTMLElement): number {
  const header = document.querySelector<HTMLElement>("[data-bym-header-state]");
  const headerHeight = header?.getBoundingClientRect().height;
  if (headerHeight && Number.isFinite(headerHeight)) {
    return Math.round(headerHeight);
  }

  const rawValue = window
    .getComputedStyle(section)
    .getPropertyValue("--bym-shell-header-height");
  const parsedValue = Number.parseFloat(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
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
  const [scrollMetrics, setScrollMetrics] = useState<BymHorizontalScrollMetrics | null>(null);
  const [stickyOffset, setStickyOffset] = useState(0);
  const reduceMotion = useReducedMotion();
  const animate = reduceMotion === false;
  const shouldPinBenefits = animate && (scrollMetrics?.horizontalTravel ?? 0) > 0;
  const { scrollYProgress } = useScroll({
    target: benefitsSectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, shouldPinBenefits ? -(scrollMetrics?.horizontalTravel ?? 0) : 0],
  );

  const benefitsSectionStyle =
    shouldPinBenefits && scrollMetrics
      ? { minHeight: `${scrollMetrics.sectionHeight}px` }
      : undefined;

  useEffect(() => {
    const updateMetrics = () => {
      const section = benefitsSectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!section || !viewport || !track) {
        return;
      }

      setStickyOffset(readBymStickyOffset(section));
      const metrics = calculateBymHorizontalScrollMetrics({
        trackWidth: track.scrollWidth,
        viewportWidth: viewport.clientWidth,
        viewportHeight: window.innerHeight,
      });

      setScrollMetrics(metrics);
    };

    updateMetrics();
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateMetrics);
    if (viewportRef.current) resizeObserver?.observe(viewportRef.current);
    if (trackRef.current) resizeObserver?.observe(trackRef.current);
    window.addEventListener("resize", updateMetrics);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, [benefits.length]);

  return (
    <>
      {benefits.length > 0 ? (
        <section
          ref={benefitsSectionRef}
          className="relative bg-[#070707] text-white"
          style={benefitsSectionStyle}
          aria-label="Beneficios"
        >
          <div
            className={[
              "flex h-dvh w-full items-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16",
              shouldPinBenefits
                ? "sticky"
                : "",
            ].join(" ")}
            style={shouldPinBenefits ? { top: 0 } : undefined}
          >
            <div
              className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.45fr_0.55fr] lg:items-center lg:gap-8"
              style={{ paddingTop: `${stickyOffset}px` }}
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f4c542]">
                  {benefitsEyebrow}
                </span>
                <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight sm:text-5xl lg:mt-4">
                  {benefitsTitle}
                </h2>
              </div>
              <div
                ref={viewportRef}
                className={[
                  "min-w-0",
                  shouldPinBenefits
                    ? "overflow-hidden"
                    : "overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                ].join(" ")}
              >
                <motion.div
                  ref={trackRef}
                  className={["flex gap-4", shouldPinBenefits ? "will-change-transform" : ""].join(" ")}
                  {...(shouldPinBenefits ? { style: { x } } : {})}
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
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
