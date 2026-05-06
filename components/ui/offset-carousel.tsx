"use client";

import {
  startTransition,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type TouchEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import {
  clampCarouselIndex,
  getCarouselItemVisualState,
  getVisibleDotIndexes,
} from "@/lib/utils/offset-carousel";
import { Button } from "@/components/ui/button";

const ITEM_TRANSITION =
  "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.35s ease";

type DotTone = "primary" | "muted";

export interface OffsetCarouselRenderItemParams<T> {
  item: T;
  index: number;
  offset: number;
  isActive: boolean;
}

export interface OffsetCarouselProps<T> {
  items: T[];
  renderItem: (params: OffsetCarouselRenderItemParams<T>) => ReactNode;
  getItemKey?: (item: T, index: number) => string;
  ariaLabel: string;
  className?: string;
  viewportClassName?: string;
  trackClassName?: string;
  itemClassName?: string;
  peek?: string;
  itemWidth?: string;
  gap?: string;
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  scaleStep?: number;
  opacityStep?: number;
  maxVisibleOffset?: number;
  showDots?: boolean;
  dotsLabel?: string;
  footerStart?: ReactNode;
  footerEnd?: ReactNode;
  footerClassName?: string;
  autoplay?: boolean;
  interval?: number;
}

export function OffsetCarousel<T>({
  items,
  renderItem,
  getItemKey,
  ariaLabel,
  className,
  viewportClassName,
  trackClassName,
  itemClassName,
  peek = "1.5rem",
  itemWidth = "clamp(15.5rem, 26vw, 23rem)",
  gap = "1rem",
  activeIndex: activeIndexProp,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  scaleStep = 0.08,
  opacityStep = 0.45,
  maxVisibleOffset = 2,
  showDots = true,
  dotsLabel = "Posición del carrusel",
  footerStart,
  footerEnd,
  footerClassName,
  autoplay = false,
  interval = 4500,
}: OffsetCarouselProps<T>) {
  const isControlled = activeIndexProp !== undefined;
  const [uncontrolledActiveIndex, setUncontrolledActiveIndex] = useState(() =>
    clampCarouselIndex(defaultActiveIndex, items.length),
  );
  const [isHovering, setIsHovering] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const dotSetId = useId();
  const total = items.length;
  const activeIndex = clampCarouselIndex(
    isControlled ? activeIndexProp ?? 0 : uncontrolledActiveIndex,
    total,
  );

  useEffect(() => {
    if (isControlled || total > 0) {
      return;
    }

    setUncontrolledActiveIndex(0);
  }, [isControlled, total]);

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    setUncontrolledActiveIndex(clampCarouselIndex(activeIndexProp ?? 0, total));
  }, [activeIndexProp, isControlled, total]);

  const setActiveIndex = (index: number) => {
    const nextIndex = clampCarouselIndex(index, total);

    if (!isControlled) {
      startTransition(() => {
        setUncontrolledActiveIndex(nextIndex);
      });
    }

    onActiveIndexChange?.(nextIndex);
  };

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < total - 1;

  const shift = (direction: "prev" | "next") => {
    setActiveIndex(activeIndex + (direction === "next" ? 1 : -1));
  };

  useEffect(() => {
    if (!autoplay || total <= 1 || isHovering) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex(activeIndex >= total - 1 ? 0 : activeIndex + 1);
    }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeIndex, autoplay, interval, isHovering, total]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchEndX = event.changedTouches[0]?.clientX ?? null;
    touchStartXRef.current = null;

    if (touchStartX === null || touchEndX === null) {
      return;
    }

    const deltaX = touchStartX - touchEndX;

    if (deltaX > 50 && canGoNext) {
      shift("next");
    }

    if (deltaX < -50 && canGoPrev) {
      shift("prev");
    }
  };

  const visibleDots = useMemo(
    () => getVisibleDotIndexes(total, activeIndex, 5),
    [activeIndex, total],
  );

  const containerStyle = {
    "--carousel-gap": gap,
    "--carousel-item-width": itemWidth,
    "--carousel-peek": peek,
  } as CSSProperties;

  const trackStyle = {
    paddingInline: "max(var(--carousel-peek), calc(50% - var(--carousel-item-width) / 2))",
    transform: `translate3d(calc(-${activeIndex} * (var(--carousel-item-width) + var(--carousel-gap))), 0, 0)`,
    transition: "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  } as CSSProperties;

  if (total === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)} style={containerStyle}>
      <div
        className="relative pb-5 sm:pb-6"
      >
        <div
          className={cn("relative [overflow-x:clip] [overflow-y:visible]", viewportClassName)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
        <div
          className={cn(
            "flex items-stretch gap-[var(--carousel-gap)]",
            trackClassName,
          )}
          style={trackStyle}
          aria-label={ariaLabel}
        >
          {items.map((item, index) => {
            const offset = index - activeIndex;
            const isActive = offset === 0;
            const visualState = getCarouselItemVisualState(offset, {
              maxVisibleOffset,
              opacityStep,
              scaleStep,
            });

            return (
              <div
                key={getItemKey ? getItemKey(item, index) : `${index}`}
                aria-hidden={visualState.hidden ? "true" : undefined}
                className={cn("shrink-0 basis-[var(--carousel-item-width)]", itemClassName)}
                style={{
                  opacity: visualState.opacity,
                  transform: `scale(${visualState.scale})`,
                  transition: ITEM_TRANSITION,
                  visibility: visualState.hidden ? "hidden" : "visible",
                  zIndex: visualState.zIndex,
                }}
                data-offset={offset}
                data-active={isActive ? "true" : "false"}
              >
                {renderItem({ item, index, offset, isActive })}
              </div>
            );
          })}
        </div>

        {total > 1 ? (
          <>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="absolute left-2 top-1/2 z-20 size-9 -translate-y-1/2 rounded-full border-border/70 bg-white/92 disabled:opacity-35 sm:left-3"
              onClick={() => shift("prev")}
              disabled={!canGoPrev}
              aria-label="Mostrar item anterior"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="outline"
              className="absolute right-2 top-1/2 z-20 size-9 -translate-y-1/2 rounded-full border-border/70 bg-white/92 disabled:opacity-35 sm:right-3"
              onClick={() => shift("next")}
              disabled={!canGoNext}
              aria-label="Mostrar item siguiente"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </>
        ) : null}
        </div>
      </div>

      {showDots || footerStart || footerEnd ? (
        <div
          data-carousel-footer="true"
          className={cn(
            "flex items-center justify-between gap-3 border-t border-border/50 pt-3",
            footerClassName,
          )}
        >
          <div className="min-w-0 flex-1">
            {footerStart}
          </div>
          <div className="flex flex-1 justify-center">
            {showDots && total > 1 ? (
              <div
                role="tablist"
                aria-label={dotsLabel}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/85 px-3 py-2"
              >
                {visibleDots.map((dotIndex) => {
                  const tone: DotTone = dotIndex === activeIndex ? "primary" : "muted";

                  return (
                    <button
                      key={`${dotSetId}-${dotIndex}`}
                      type="button"
                      role="tab"
                      aria-selected={dotIndex === activeIndex}
                      aria-label={`Ir al item ${dotIndex + 1}`}
                      onClick={() => setActiveIndex(dotIndex)}
                      className={cn(
                        "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        tone === "primary"
                          ? "h-2.5 w-6 bg-primary"
                          : "h-2 w-2 bg-border hover:bg-muted/80",
                      )}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-1 justify-end">
            {footerEnd}
          </div>
        </div>
      ) : null}
    </div>
  );
}
