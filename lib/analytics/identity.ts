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

export type AnalyticsBuyerIdentityInput = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  taxId?: string;
};

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

function persistStoredTtclid(
  value: string,
  storage: StorageLike | undefined,
  persistCookie: ResolveAnalyticsIdentityInput["persistCookie"],
) {
  storage?.setItem(ANALYTICS_STORAGE_KEYS.ttclid, value);
  persistCookie?.(ANALYTICS_COOKIE_KEYS.ttclid, value, ANALYTICS_COOKIE_MAX_AGE_SECONDS);
}

function normalizeMatchingText(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue.toLocaleLowerCase("es-AR") : undefined;
}

function normalizeDigits(value: string | undefined): string | undefined {
  const digits = value?.replace(/\D/g, "");
  return digits ? digits : undefined;
}

function normalizePhone(value: string | undefined): string | undefined {
  return normalizeDigits(value);
}

function extractNameParts(value: string | undefined): {
  first_name?: string;
  last_name?: string;
} {
  const normalizedName = normalizeMatchingText(value);

  if (!normalizedName) {
    return {};
  }

  const nameParts = normalizedName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return {
    ...(firstName ? { first_name: firstName } : {}),
    ...(lastName ? { last_name: lastName } : {}),
  };
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

  if (identity.ttclid) {
    nextIdentity.ttclid = identity.ttclid;
  }

  if (identity.ttp) {
    nextIdentity.ttp = identity.ttp;
  }

  if (identity.anonymous_id) {
    nextIdentity.anonymous_id = identity.anonymous_id;
  }

  if (identity.email) {
    nextIdentity.email = identity.email;
  }

  if (identity.phone) {
    nextIdentity.phone = identity.phone;
  }

  if (identity.first_name) {
    nextIdentity.first_name = identity.first_name;
  }

  if (identity.last_name) {
    nextIdentity.last_name = identity.last_name;
  }

  if (identity.city) {
    nextIdentity.city = identity.city;
  }

  if (identity.province) {
    nextIdentity.province = identity.province;
  }

  if (identity.postal_code) {
    nextIdentity.postal_code = identity.postal_code;
  }

  if (identity.tax_id) {
    nextIdentity.tax_id = identity.tax_id;
  }

  return Object.keys(nextIdentity).length > 0 ? nextIdentity : undefined;
}

export function enrichAnalyticsIdentity(
  identity: StorefrontAnalyticsInput | undefined,
  buyer: AnalyticsBuyerIdentityInput,
): StorefrontAnalyticsInput | undefined {
  const email = normalizeMatchingText(buyer.email);
  const phone = normalizePhone(buyer.phone);
  const city = normalizeMatchingText(buyer.city);
  const province = normalizeMatchingText(buyer.province);
  const postalCode = buyer.postalCode?.trim();
  const taxId = normalizeDigits(buyer.taxId);

  return compactAnalyticsIdentity({
    ...identity,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...extractNameParts(buyer.name),
    ...(city ? { city } : {}),
    ...(province ? { province } : {}),
    ...(postalCode ? { postal_code: postalCode } : {}),
    ...(taxId ? { tax_id: taxId } : {}),
  });
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
    persistTtclid: (value) => persistStoredTtclid(value, storage, persistCookie),
    readStoredFbc: () =>
      readCookieValue(cookie, ANALYTICS_COOKIE_KEYS.fbc) ??
      storage?.getItem(ANALYTICS_STORAGE_KEYS.fbc) ??
      undefined,
    readStoredTtclid: () =>
      readCookieValue(cookie, ANALYTICS_COOKIE_KEYS.ttclid) ??
      storage?.getItem(ANALYTICS_STORAGE_KEYS.ttclid) ??
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
