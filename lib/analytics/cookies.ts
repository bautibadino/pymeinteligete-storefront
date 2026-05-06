import { ANALYTICS_COOKIE_KEYS } from "@/lib/analytics/constants";

type ExtractAnalyticsCookiesInput = {
  cookie?: string;
  hostname?: string;
  now?: () => number;
  persistFbc?: (value: string) => void;
  readStoredFbc?: () => string | undefined;
  search?: string;
};

function parseCookieString(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((accumulator, cookiePart) => {
    const [rawName, ...rawValueParts] = cookiePart.trim().split("=");

    if (!rawName) {
      return accumulator;
    }

    accumulator[rawName] = decodeURIComponent(rawValueParts.join("="));
    return accumulator;
  }, {});
}

export function normalizeGaClientId(rawValue: string | undefined): string | undefined {
  if (!rawValue) {
    return undefined;
  }

  const normalizedValue = rawValue.trim();
  const match = normalizedValue.match(/^GA\d+\.\d+\.(.+)$/);

  if (match?.[1]) {
    return match[1];
  }

  return /^\d+\.\d+$/.test(normalizedValue) ? normalizedValue : undefined;
}

export function buildFacebookClickIdCookie(fbclid: string, timestamp: number): string {
  return `fb.2.${timestamp}.${fbclid}`;
}

export function extractAnalyticsCookies({
  cookie,
  now = Date.now,
  persistFbc,
  readStoredFbc,
  search,
}: ExtractAnalyticsCookiesInput) {
  const parsedCookies = parseCookieString(cookie);
  const searchParams = new URLSearchParams(search?.startsWith("?") ? search.slice(1) : search);
  const fbclid = searchParams.get("fbclid");
  const rawFbc =
    parsedCookies._fbc ??
    parsedCookies[ANALYTICS_COOKIE_KEYS.fbc] ??
    readStoredFbc?.();
  const fbc = fbclid ? buildFacebookClickIdCookie(fbclid, now()) : rawFbc;
  const fbp = parsedCookies._fbp ?? parsedCookies[ANALYTICS_COOKIE_KEYS.fbp];
  const ga_client_id = normalizeGaClientId(
    parsedCookies._ga ?? parsedCookies[ANALYTICS_COOKIE_KEYS.gaClientId],
  );

  if (fbclid && fbc) {
    persistFbc?.(fbc);
  }

  return {
    ...(fbc ? { fbc } : {}),
    ...(fbp ? { fbp } : {}),
    ...(ga_client_id ? { ga_client_id } : {}),
  };
}

export function readCookieValue(cookie: string | undefined, name: string): string | undefined {
  return parseCookieString(cookie)[name];
}
