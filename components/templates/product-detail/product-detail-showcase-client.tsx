"use client";

import { startTransition, useEffect, useId, useState } from "react";
import { ChevronRight, ImageOff } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type {
  ProductDetailImage,
  ProductDetailSpecification,
} from "@/lib/modules/product-detail";
import {
  productDetailCardClassName,
  productDetailInnerPanelClassName,
  type ProductDetailTabSection,
} from "@/components/templates/product-detail/product-detail-primitives";

type ProductImageGalleryProps = {
  images: ProductDetailImage[];
  productName: string;
  className?: string | undefined;
  aspectClassName?: string | undefined;
  imageFit?: "contain" | "cover";
};

type ProductDetailSegmentedTabsProps = {
  sections: ProductDetailTabSection[];
  className?: string | undefined;
};

const IMAGE_FIT_CLASSNAME: Record<NonNullable<ProductImageGalleryProps["imageFit"]>, string> = {
  contain: "mx-auto max-h-full max-w-full object-contain object-center p-2 sm:p-4 md:p-6 xl:p-10",
  cover: "object-cover",
};

function ProductSpecificationsGrid({
  specifications,
}: {
  specifications?: ProductDetailSpecification[] | undefined;
}) {
  if (!specifications || specifications.length === 0) {
    return (
      <div className={productDetailInnerPanelClassName("px-4 py-4")}>
        <p className="text-sm leading-7 text-muted-foreground">
          Este producto todavía no tiene especificaciones publicadas.
        </p>
      </div>
    );
  }

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {specifications.map((spec, index) => (
        <div
          key={`${spec.label}-${index}`}
          className={productDetailInnerPanelClassName("px-4 py-3")}
        >
          <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {spec.label}
          </dt>
          <dd className="mt-1 text-sm font-medium leading-6 text-foreground">
            {spec.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ProductImageGallery({
  images,
  productName,
  className,
  aspectClassName,
  imageFit = "contain",
}: ProductImageGalleryProps) {
  const safeImages = images.filter((image) => Boolean(image.url));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (selectedImageIndex >= safeImages.length) {
      setSelectedImageIndex(0);
    }
  }, [safeImages.length, selectedImageIndex]);

  const currentImage = safeImages[selectedImageIndex];

  return (
    <div className={cn("grid gap-2 sm:gap-3 md:gap-4", className)}>
      <div
        className={productDetailCardClassName(
          cn(
            "group relative overflow-hidden bg-white xl:bg-white",
            aspectClassName ?? "aspect-square",
          ),
        )}
      >
        <div className="absolute left-1/2 top-3 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/10 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground shadow-[0_8px_18px_rgba(15,23,42,0.08)] backdrop-blur-sm md:left-5 md:top-5 md:translate-x-0 md:px-3 md:text-[11px] xl:border-black/10 xl:bg-white/90 xl:text-foreground xl:backdrop-blur-sm">
          <span className="hidden md:inline">Galería</span>
          <span className="text-muted-foreground">
            {safeImages.length > 0 ? `${selectedImageIndex + 1}/${safeImages.length}` : "0/0"}
          </span>
        </div>

        <div className="absolute -left-16 top-10 hidden size-36 rounded-full bg-primary-soft blur-3xl xl:block" />
        <div className="absolute bottom-0 right-0 hidden size-40 rounded-full bg-secondary-soft blur-3xl xl:block" />

        <div className="flex h-full min-h-0 items-center justify-center bg-white xl:min-h-[580px] xl:bg-white">
          {currentImage ? (
            <img
              src={currentImage.url}
              alt={currentImage.alt ?? productName}
              className={cn(
                "block h-full w-full max-h-full max-w-full transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none",
                IMAGE_FIT_CLASSNAME[imageFit],
              )}
              loading="eager"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-center">
              <div className="grid gap-3">
                <div className="mx-auto rounded-full border border-black/10 bg-black/[0.03] p-4 text-muted-foreground xl:border-black/10 xl:bg-black/[0.03] xl:text-muted-foreground">
                  <ImageOff className="size-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-heading text-xl font-semibold text-foreground md:text-2xl">
                    Imagen pendiente
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    La galería todavía no tiene assets publicados.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {safeImages.length > 1 ? (
        <div
          className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 md:gap-3"
          aria-label="Miniaturas del producto"
        >
          {safeImages.map((image, index) => {
            const isActive = index === selectedImageIndex;

            return (
              <button
                key={`${image.url}-${index}`}
                type="button"
                aria-label={`Ver imagen ${index + 1} de ${safeImages.length}`}
                aria-pressed={isActive}
                onClick={() => {
                  startTransition(() => {
                    setSelectedImageIndex(index);
                  });
                }}
                className={cn(
                  "relative size-16 shrink-0 snap-start overflow-hidden rounded-[18px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:size-20 md:size-[88px] xl:size-24 xl:focus-visible:ring-white/80 xl:focus-visible:ring-offset-foreground",
                  isActive
                    ? "border-black/12 bg-white shadow-[0_14px_28px_rgba(15,23,42,0.14)] xl:border-black/12 xl:bg-white xl:shadow-[0_14px_28px_rgba(15,23,42,0.14)]"
                    : "border-black/10 bg-white/72 opacity-80 hover:opacity-100 xl:border-black/10 xl:bg-white/72 xl:opacity-80",
                )}
              >
                <img
                  src={image.url}
                  alt={image.alt ?? productName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-[18px] border",
                    isActive ? "border-black/8 xl:border-black/8" : "border-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetailSegmentedTabs({
  sections,
  className,
}: ProductDetailSegmentedTabsProps) {
  const baseId = useId();
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (!sections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(sections[0]?.id ?? "");
    }
  }, [activeSectionId, sections]);

  if (sections.length === 0) {
    return null;
  }

  const fallbackSection = sections[0];
  if (!fallbackSection) {
    return null;
  }

  const activeSection =
    sections.find((section) => section.id === activeSectionId) ?? fallbackSection;
  const tabsId = `${baseId}-tabs`;
  const panelId = `${baseId}-panel-${activeSection.id}`;

  return (
    <div className={productDetailCardClassName(cn("grid gap-4 p-4 md:gap-5 md:p-6", className))}>
      <div
        className="flex gap-2 overflow-x-auto rounded-full border border-black/10 bg-black/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] xl:border-black/10 xl:bg-black/[0.03] xl:backdrop-blur-none"
        role="tablist"
        aria-label="Secciones del producto"
        id={tabsId}
      >
        {sections.map((section) => {
          const isActive = section.id === activeSection.id;

          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${section.id}`}
              id={`${baseId}-tab-${section.id}`}
              onClick={() => {
                startTransition(() => {
                  setActiveSectionId(section.id);
                });
              }}
              className={cn(
                "min-h-11 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background xl:focus-visible:ring-white/80 xl:focus-visible:ring-offset-foreground",
                isActive
                  ? "bg-foreground text-background shadow-[0_10px_24px_rgba(15,23,42,0.12)] xl:bg-foreground xl:text-background xl:shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
                  : "text-muted-foreground hover:text-foreground xl:text-muted-foreground xl:hover:text-foreground",
              )}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${baseId}-tab-${activeSection.id}`}
        aria-describedby={tabsId}
        className="grid gap-5"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {activeSection.eyebrow}
          </p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl">
              {activeSection.title}
            </h2>
            <ChevronRight className="mt-1 hidden size-5 shrink-0 text-muted-foreground md:block" aria-hidden="true" />
          </div>
        </div>

        <div className="grid gap-4">
          {activeSection.paragraphs.map((paragraph, index) => (
            <p
              key={`${activeSection.id}-paragraph-${index}`}
              className="text-sm leading-7 text-muted-foreground md:text-base"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {activeSection.notes && activeSection.notes.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {activeSection.notes.map((note, index) => (
              <li
                key={`${activeSection.id}-note-${index}`}
                className={productDetailInnerPanelClassName(
                  "flex min-h-16 items-center gap-3 px-4 py-3 text-sm leading-6 text-muted-foreground",
                )}
              >
                {index === 0 && activeSection.brandLogoUrl ? (
                  <img
                    src={activeSection.brandLogoUrl}
                    alt=""
                    className="h-8 w-16 shrink-0 object-contain"
                    loading="lazy"
                  />
                ) : null}
                <span>{note}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {activeSection.specifications ? (
          <ProductSpecificationsGrid specifications={activeSection.specifications} />
        ) : null}
      </div>
    </div>
  );
}
