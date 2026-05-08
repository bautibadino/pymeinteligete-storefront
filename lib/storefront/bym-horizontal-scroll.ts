type BymHorizontalScrollMetricInput = {
  trackWidth: number;
  viewportWidth: number;
  viewportHeight: number;
};

type BymPinnedProgressInput = {
  sectionTop: number;
  stickyOffset?: number;
  scrollDistance: number;
};

export type BymHorizontalScrollMetrics = {
  horizontalTravel: number;
  verticalTravel: number;
  finalReadBuffer: number;
  stickyViewportHeight: number;
  sectionHeight: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateBymHorizontalScrollMetrics({
  trackWidth,
  viewportWidth,
  viewportHeight,
}: BymHorizontalScrollMetricInput): BymHorizontalScrollMetrics {
  const stickyViewportHeight = Math.max(1, Math.round(viewportHeight));
  const horizontalTravel = Math.max(0, Math.round(trackWidth - viewportWidth));

  if (horizontalTravel === 0) {
    return {
      horizontalTravel: 0,
      verticalTravel: 0,
      finalReadBuffer: 0,
      stickyViewportHeight,
      sectionHeight: stickyViewportHeight,
    };
  }

  const verticalTravel = horizontalTravel;
  const finalReadBuffer = 0;

  return {
    horizontalTravel,
    verticalTravel,
    finalReadBuffer,
    stickyViewportHeight,
    sectionHeight: stickyViewportHeight + verticalTravel,
  };
}

export function calculateBymPinnedHorizontalProgress({
  sectionTop,
  stickyOffset = 0,
  scrollDistance,
}: BymPinnedProgressInput): number {
  if (scrollDistance <= 0) {
    return 0;
  }

  return clamp((stickyOffset - sectionTop) / scrollDistance, 0, 1);
}
