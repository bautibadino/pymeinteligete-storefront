import {
  ANALYTICS_COOKIE_KEYS,
  ANALYTICS_COOKIE_MAX_AGE_SECONDS,
  ANALYTICS_STORAGE_KEYS,
} from "@/lib/analytics/constants";
import {
  extractAnalyticsCookies,
  readCookieValue,
} from "@/lib/analytics/cookies";
import { getOrCreateStoredValue } from "@/lib/analytics/storage";
import type { StorefrontAnalyticsInput } from "@/lib/types/storefront";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

type ResolveAnalyticsIdentityInput = {
  cookie: string;
  hostname: string;
  now?: () => number;
  persistCookie?: (name: string, value: string, maxAge: number) => void;
  randomId?: () => string;
  search: string;
  storage?: StorageLike;
};

function createAnonymousId(factory: (() => string) | undefined): string {
  if (factory) {
    return factory();
  }

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `anon_${Math.random().toString(36).slice(2, 12)}`;
}

function persistStoredFbc(
  value: string,
  storage: StorageLike | undefined,
  persistCookie: ResolveAnalyticsIdentityInput["persistCookie"],
) {
  storage?.setItem(ANALYTICS_STORAGE_KEYS.fbc, value);
  persistCookie?.(ANALYTICS_COOKIE_KEYS.fbc, value, ANALYTICS_COOKIE_MAX_AGE_SECONDS);
}

function compactAnalyticsIdentity(
  identity: Partial<StorefrontAnalyticsInput>,
): StorefrontAnalyticsInput | undefined {
  const nextIdentity: StorefrontAnalyticsInput = {};

  if (identity.fbc) {
    nextIdentity.fbc = identity.fbc;
  }

  if (identity.fbp) {
    nextIdentity.fbp = identity.fbp;
  }

  if (identity.ga_client_id) {
    nextIdentity.ga_client_id = identity.ga_client_id;
  }

  if (identity.anonymous_id) {
    nextIdentity.anonymous_id = identity.anonymous_id;
  }

  return Object.keys(nextIdentity).length > 0 ? nextIdentity : undefined;
}

export function resolveAnalyticsIdentity({
  cookie,
  hostname,
  now,
  persistCookie,
  randomId,
  search,
  storage,
}: ResolveAnalyticsIdentityInput): StorefrontAnalyticsInput | undefined {
  const anonymousId =
    readCookieValue(cookie, ANALYTICS_COOKIE_KEYS.anonymousId) ??
    (storage
      ? getOrCreateStoredValue(storage, ANALYTICS_STORAGE_KEYS.anonymousId, () =>
          createAnonymousId(randomId),
        )
      : createAnonymousId(randomId));

  persistCookie?.(
    ANALYTICS_COOKIE_KEYS.anonymousId,
    anonymousId,
    ANALYTICS_COOKIE_MAX_AGE_SECONDS,
  );

  const cookiesIdentity = extractAnalyticsCookies({
    cookie,
    hostname,
    search,
    ...(now ? { now } : {}),
    persistFbc: (value) => persistStoredFbc(value, storage, persistCookie),
    readStoredFbc: () =>
      readCookieValue(cookie, ANALYTICS_COOKIE_KEYS.fbc) ??
      storage?.getItem(ANALYTICS_STORAGE_KEYS.fbc) ??
      undefined,
  });

  if (cookiesIdentity.fbp) {
    persistCookie?.(
      ANALYTICS_COOKIE_KEYS.fbp,
      cookiesIdentity.fbp,
      ANALYTICS_COOKIE_MAX_AGE_SECONDS,
    );
  }

  if (cookiesIdentity.ga_client_id) {
    persistCookie?.(
      ANALYTICS_COOKIE_KEYS.gaClientId,
      cookiesIdentity.ga_client_id,
      ANALYTICS_COOKIE_MAX_AGE_SECONDS,
    );
  }

  return compactAnalyticsIdentity({
    ...cookiesIdentity,
    anonymous_id: anonymousId,
  });
}

export function readAnalyticsIdentityFromCookieString(
  cookie: string | undefined,
): StorefrontAnalyticsInput | undefined {
  const anonymousId = readCookieValue(cookie, ANALYTICS_COOKIE_KEYS.anonymousId);
  const resolvedIdentity = compactAnalyticsIdentity({
    ...extractAnalyticsCookies({
      ...(cookie ? { cookie } : {}),
      readStoredFbc: () => readCookieValue(cookie, ANALYTICS_COOKIE_KEYS.fbc),
    }),
    ...(anonymousId ? { anonymous_id: anonymousId } : {}),
  });

  return resolvedIdentity;
}
