import type { ReactNode } from "react";

import type { Presentation, SectionInstance } from "@/lib/types/presentation";
import type { PresentationRenderContext } from "@/components/presentation/render-context";
import { resolveStoreName } from "@/components/presentation/render-context";
import { BymScrollBenefits, type BymBenefitCard } from "./bym-scroll-benefits";

type LayoutImage = {
  src: string;
  alt?: string;
};

type Cta = {
  label: string;
  href: string;
};

type BymImmersiveHomeLayoutProps = {
  presentation: Presentation;
  sections: SectionInstance[];
  chrome?: ReactNode;
  context?: PresentationRenderContext | undefined;
  renderSections?: ReactNode;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readImage(value: unknown): LayoutImage | undefined {
  if (typeof value === "string") {
    const src = readString(value);
    return src ? { src } : undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const src = readString(value.url) ?? readString(value.src);
  if (!src) {
    return undefined;
  }

  const alt = readString(value.alt);
  return alt ? { src, alt } : { src };
}

function readCta(value: unknown): Cta | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const label = readString(value.label) ?? readString(value.title) ?? readString(value.text);
  const href = readString(value.href) ?? readString(value.url);

  if (!label || !href) {
    return undefined;
  }

  return { label, href };
}

function readBenefits(value: unknown): BymBenefitCard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry): BymBenefitCard[] => {
    if (!isRecord(entry)) {
      return [];
    }

    const title = readString(entry.title);
    if (!title) {
      return [];
    }

    const icon = readString(entry.icon);
    const description = readString(entry.description) ?? readString(entry.text);

    return [
      {
        ...(icon ? { icon } : {}),
        title,
        ...(description ? { description } : {}),
      },
    ];
  });
}

export function BymImmersiveHomeLayout({
  presentation,
  sections,
  chrome,
  context,
  renderSections,
}: BymImmersiveHomeLayoutProps) {
  const content = presentation.pages.home.layout?.content ?? {};
  const storeName = resolveStoreName(context);
  const desktopImage = readImage(content.desktopImage);
  const mobileImage = readImage(content.mobileImage);
  const fallbackAlt = readString(content.imageAlt) ?? storeName;
  const h1 =
    readString(content.h1) ??
    readString(content.title) ??
    storeName;
  const introText =
    readString(content.introText) ??
    readString(content.subtitle) ??
    readString(content.description) ??
    context?.bootstrap?.seo?.defaultDescription;
  const primaryCta = readCta(content.primaryCta);
  const secondaryCta = readCta(content.secondaryCta);
  const benefits = readBenefits(content.benefits);
  const image = desktopImage ?? mobileImage;

  return (
    <div
      className="bym-immersive-home-layout bg-zinc-950 text-white"
      data-home-layout="bym-immersive-home-v1"
      data-sections-count={sections.length}
    >
      <section
        className="relative isolate flex h-[100dvh] min-h-[100dvh] w-screen items-end overflow-hidden"
        style={{ height: "100dvh", minHeight: "100dvh", width: "100vw" }}
      >
        {image ? (
          <picture className="absolute inset-0 -z-10 block h-full w-full">
            {mobileImage ? (
              <source media="(max-width: 767px)" srcSet={mobileImage.src} />
            ) : null}
            {desktopImage ? (
              <source media="(min-width: 768px)" srcSet={desktopImage.src} />
            ) : null}
            <img
              className="h-full w-full object-cover"
              src={image.src}
              alt={desktopImage?.alt ?? mobileImage?.alt ?? fallbackAlt}
            />
          </picture>
        ) : (
          <div className="absolute inset-0 -z-10 bg-zinc-900" aria-hidden="true" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/45 to-black/10" />

        {chrome ? (
          <div
            className="absolute inset-x-0 top-0 z-20 text-white [--accent:rgba(255,255,255,0.12)] [--border:rgba(255,255,255,0.18)] [--foreground:#ffffff] [--ink:#ffffff] [--muted:rgba(255,255,255,0.74)] [--paper:transparent] [&_[data-announcement-topmost=true]]:!border-white/15 [&_[data-announcement-topmost=true]]:!bg-transparent [&_[data-announcement-topmost=true]]:!bg-none [&_button]:!text-white [&_header]:!border-white/15 [&_header]:!bg-transparent [&_img]:drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)] [&_span]:!text-white"
            data-bym-hero-chrome="true"
          >
            {chrome}
          </div>
        ) : null}

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 pb-10 pt-28 sm:px-8 lg:px-12 lg:pb-14">
          <p className="text-sm font-semibold uppercase text-zinc-200">{storeName}</p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-none text-white sm:text-6xl lg:text-7xl">
            {h1}
          </h1>
          {introText ? (
            <p className="max-w-2xl text-base leading-7 text-zinc-100 sm:text-lg">
              {introText}
            </p>
          ) : null}
          {primaryCta || secondaryCta ? (
            <div className="flex flex-wrap gap-3">
              {primaryCta ? (
                <a
                  className="inline-flex min-h-11 items-center justify-center bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                  href={primaryCta.href}
                >
                  {primaryCta.label}
                </a>
              ) : null}
              {secondaryCta ? (
                <a
                  className="inline-flex min-h-11 items-center justify-center border border-white/60 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                  href={secondaryCta.href}
                >
                  {secondaryCta.label}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <BymScrollBenefits benefits={benefits} />

      {renderSections}
    </div>
  );
}
