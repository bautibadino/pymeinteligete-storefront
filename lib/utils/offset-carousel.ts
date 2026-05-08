export interface CarouselVisualStateOptions {
  maxVisibleOffset?: number;
  opacityStep?: number;
  scaleStep?: number;
}

export interface CarouselVisualState {
  hidden: boolean;
  opacity: number;
  scale: number;
  zIndex: number;
}

const DEFAULT_MAX_VISIBLE_OFFSET = 2;
const DEFAULT_SCALE_STEP = 0.08;
const DEFAULT_OPACITY_STEP = 0.45;

export function clampCarouselIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, total - 1));
}

export function getCarouselItemVisualState(
  offset: number,
  options: CarouselVisualStateOptions = {},
): CarouselVisualState {
  const {
    maxVisibleOffset = DEFAULT_MAX_VISIBLE_OFFSET,
    opacityStep = DEFAULT_OPACITY_STEP,
    scaleStep = DEFAULT_SCALE_STEP,
  } = options;

  const distance = Math.abs(offset);
  const hidden = distance > maxVisibleOffset;
  const scale = Number(Math.max(0, 1 - distance * scaleStep).toFixed(3));
  const normalizedOpacityStep = Math.min(Math.max(opacityStep, 0), 1);
  const opacity = hidden
    ? 0
    : Number(Math.max(0, (1 - normalizedOpacityStep) ** distance).toFixed(2));
  const zIndex = hidden ? 0 : Math.max(1, 10 - distance * 5);

  return {
    hidden,
    opacity,
    scale,
    zIndex,
  };
}

export function getVisibleDotIndexes(
  total: number,
  activeIndex: number,
  maxVisibleDots = 5,
): number[] {
  if (total <= 0) {
    return [];
  }

  if (total <= 7 || total <= maxVisibleDots) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const normalizedMax = Math.max(1, Math.min(maxVisibleDots, total));
  const halfWindow = Math.floor(normalizedMax / 2);
  const safeActiveIndex = clampCarouselIndex(activeIndex, total);
  let start = safeActiveIndex - halfWindow;
  let end = start + normalizedMax;

  if (start < 0) {
    start = 0;
    end = normalizedMax;
  }

  if (end > total) {
    end = total;
    start = total - normalizedMax;
  }

  return Array.from({ length: end - start }, (_, index) => start + index);
}

export function getCarouselTrackTransform(
  activeIndex: number,
  measuredStepWidth: number | null | undefined,
): string {
  if (!measuredStepWidth || !Number.isFinite(measuredStepWidth) || measuredStepWidth <= 0) {
    return "translate3d(0, 0, 0)";
  }

  const offset = Number((activeIndex * measuredStepWidth).toFixed(3));
  return `translate3d(-${offset}px, 0, 0)`;
}
