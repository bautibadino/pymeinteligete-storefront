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
  contain: "object-contain p-6 md:p-10",
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
        <p className="text-sm leading-7 text-white/66">
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
          <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/42">
            {spec.label}
          </dt>
          <dd className="mt-1 text-sm font-medium leading-6 text-white/84">{spec.value}</dd>
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
    <div className={cn("grid gap-4", className)}>
      <div
        className={productDetailCardClassName(
          cn(
            "group relative overflow-hidden",
            aspectClassName ?? "aspect-square",
          ),
        )}
      >
        <div className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72 backdrop-blur-md">
          Galería
          <span className="text-white/42">
            {safeImages.length > 0 ? `${selectedImageIndex + 1}/${safeImages.length}` : "0/0"}
          </span>
        </div>

        <div className="absolute -left-16 top-10 size-36 rounded-full bg-primary-soft blur-3xl" />
        <div className="absolute bottom-0 right-0 size-40 rounded-full bg-secondary-soft blur-3xl" />

        <div className="grid h-full min-h-[360px] place-items-center md:min-h-[580px]">
          {currentImage ? (
            <img
              src={currentImage.url}
              alt={currentImage.alt ?? productName}
              className={cn(
                "h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none",
                IMAGE_FIT_CLASSNAME[imageFit],
              )}
              loading="eager"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-center">
              <div className="grid gap-3">
                <div className="mx-auto rounded-full border border-white/10 bg-white/[0.05] p-4 text-white/58">
                  <ImageOff className="size-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-semibold text-white">
                    Imagen pendiente
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/66">
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
          className="flex gap-3 overflow-x-auto pb-1"
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
                  "relative size-20 shrink-0 overflow-hidden rounded-[20px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground md:size-24",
                  isActive
                    ? "border-white/70 bg-white/[0.08] shadow-[0_14px_28px_rgba(0,0,0,0.22)]"
                    : "border-white/10 bg-white/[0.03] opacity-70 hover:opacity-100",
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
                    "pointer-events-none absolute inset-0 rounded-[20px] border",
                    isActive ? "border-white/30" : "border-transparent",
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
    <div className={productDetailCardClassName(cn("grid gap-5 p-5 md:p-6", className))}>
      <div
        className="flex gap-2 overflow-x-auto rounded-full border border-white/10 bg-black/20 p-1 backdrop-blur-md"
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
                "min-h-11 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground",
                isActive
                  ? "bg-white text-foreground shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                  : "text-white/62 hover:text-white",
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/44">
            {activeSection.eyebrow}
          </p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
              {activeSection.title}
            </h2>
            <ChevronRight className="mt-1 hidden size-5 shrink-0 text-white/28 md:block" aria-hidden="true" />
          </div>
        </div>

        <div className="grid gap-4">
          {activeSection.paragraphs.map((paragraph, index) => (
            <p key={`${activeSection.id}-paragraph-${index}`} className="text-sm leading-7 text-white/72 md:text-base">
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
                  "px-4 py-3 text-sm leading-6 text-white/72",
                )}
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}

        {activeSection.id === "specs" ? (
          <ProductSpecificationsGrid specifications={activeSection.specifications} />
        ) : null}
      </div>
    </div>
  );
}
