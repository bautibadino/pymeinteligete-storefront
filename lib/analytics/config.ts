export type StorefrontMetaAnalyticsConfig = {
  enabled: boolean;
  pixelId?: string;
  testEventCode?: string;
};

export type StorefrontGoogleAnalyticsConfig = {
  enabled: boolean;
  measurementId?: string;
};

export type StorefrontAnalyticsConfig = {
  meta: StorefrontMetaAnalyticsConfig;
  google: StorefrontGoogleAnalyticsConfig;
};

type AnalyticsRuntimeSource = {
  analytics?: unknown;
} | null | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function resolveStorefrontAnalyticsConfig(
  source: AnalyticsRuntimeSource,
): StorefrontAnalyticsConfig {
  const analytics = isRecord(source?.analytics) ? source.analytics : null;
  const pixel = isRecord(analytics?.pixel) ? analytics.pixel : null;
  const google = isRecord(analytics?.google) ? analytics.google : null;
  const ga = isRecord(analytics?.ga) ? analytics.ga : null;

  const pixelId = readString(pixel?.pixelId) ?? readString(analytics?.pixelId);
  const testEventCode = readString(pixel?.testEventCode);
  const measurementId = readString(google?.measurementId) ?? readString(ga?.gaId);

  return {
    meta: {
      enabled: (readBoolean(pixel?.enabled) ?? Boolean(pixelId)) && Boolean(pixelId),
      ...(pixelId ? { pixelId } : {}),
      ...(testEventCode ? { testEventCode } : {}),
    },
    google: {
      enabled:
        (readBoolean(google?.enabled) ?? readBoolean(ga?.enabled) ?? Boolean(measurementId)) &&
        Boolean(measurementId),
      ...(measurementId ? { measurementId } : {}),
    },
  };
}
