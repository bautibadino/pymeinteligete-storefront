"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { ProductGridModule } from "@/lib/modules/product-grid";
import { ProductGridEmptyState } from "./shared";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

export function SpotlightCarouselClient({ module }: { module: ProductGridModule }) {
  const { cardVariant, cardDisplayOptions } = module.content;
  const ProductCard = resolveProductCardTemplate(cardVariant);
  const products = module.products ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeStart, setActiveStart] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const syncViewport = () => {
      startTransition(() => {
        setIsDesktop(media.matches);
      });
    };

    syncViewport();
    media.addEventListener("change", syncViewport);

    return () => {
      media.removeEventListener("change", syncViewport);
    };
  }, []);

  const visibleCount = isDesktop ? 2 : 1;
  const step = isDesktop ? 2 : 1;
  const maxStart = Math.max(0, products.length - visibleCount);

  useEffect(() => {
    if (activeStart <= maxStart) {
      return;
    }

    setActiveStart(maxStart);
  }, [activeStart, maxStart]);

  useEffect(() => {
    const target = itemRefs.current[activeStart];
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: isDesktop ? "center" : "start",
      block: "nearest",
    });
  }, [activeStart, isDesktop, reduceMotion]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (products.length === 0) {
    return <ProductGridEmptyState />;
  }

  const clampStart = (index: number) => {
    const normalized = isDesktop ? index - (index % 2) : index;
    return Math.max(0, Math.min(maxStart, normalized));
  };

  const shiftWindow = (direction: "prev" | "next") => {
    startTransition(() => {
      setActiveStart((current) => clampStart(current + (direction === "next" ? step : -step)));
    });
  };

  const syncActiveFromScroll = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const viewport = scrollRef.current;
      if (!viewport) {
        return;
      }

      const anchor = isDesktop
        ? viewport.scrollLeft + viewport.clientWidth / 2
        : viewport.scrollLeft + 24;

      let closestIndex = 0;
      let smallestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const itemAnchor = isDesktop
          ? item.offsetLeft + item.clientWidth / 2
          : item.offsetLeft;
        const distance = Math.abs(itemAnchor - anchor);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestIndex = index;
        }
      });

      const nextStart = clampStart(closestIndex);
      startTransition(() => {
        setActiveStart((current) => (current === nextStart ? current : nextStart));
      });
    });
  };

  const canGoPrev = activeStart > 0;
  const canGoNext = activeStart < maxStart;

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">
          Carrusel protagonista
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-11 rounded-full bg-white/75 backdrop-blur-sm"
            onClick={() => shiftWindow("prev")}
            disabled={!canGoPrev}
            aria-label="Mostrar productos anteriores"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-11 rounded-full bg-white/75 backdrop-blur-sm"
            onClick={() => shiftWindow("next")}
            disabled={!canGoNext}
            aria-label="Mostrar siguientes productos"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={syncActiveFromScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, index) => {
          const isActive = isDesktop
            ? index === activeStart || index === activeStart + 1
            : index === activeStart;
          const distance = Math.abs(index - activeStart);

          return (
            <motion.div
              key={product.id}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              layout
              initial={false}
              animate={{
                width: isDesktop
                  ? isActive
                    ? 420
                    : distance <= 2
                      ? 244
                      : 208
                  : 320,
                opacity: isActive ? 1 : 0.6,
                scale: reduceMotion ? 1 : isActive ? 1 : 0.88,
                y: reduceMotion ? 0 : isActive ? 0 : 22,
                filter: reduceMotion
                  ? "none"
                  : isActive
                    ? "saturate(1)"
                    : "saturate(0.45) grayscale(0.08)",
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 230,
                      damping: 28,
                      mass: 0.9,
                    }
              }
              className={cn(
                "shrink-0 snap-start",
                "w-[82vw] max-w-[22rem] sm:w-[72vw] sm:max-w-[24rem] lg:max-w-none",
              )}
              data-active={isActive ? "true" : "false"}
            >
              <div className={cn("transition-shadow duration-300", isActive ? "shadow-2xl" : "shadow-none")}>
                <ProductCard product={product} displayOptions={cardDisplayOptions} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
