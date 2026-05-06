export const ANALYTICS_STORAGE_KEYS = {
  anonymousId: "storefront.analytics.anonymous_id",
  fbc: "storefront.analytics.fbc",
} as const;

export const ANALYTICS_COOKIE_KEYS = {
  anonymousId: "sf_anonymous_id",
  fbc: "sf_fbc",
  fbp: "sf_fbp",
  gaClientId: "sf_ga_client_id",
} as const;

export const ANALYTICS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
