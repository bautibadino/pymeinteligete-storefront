import type { StorefrontAnalyticsConfig } from "@/lib/analytics/config";
import { extractAnalyticsCookies } from "@/lib/analytics/cookies";
import {
  type AnalyticsBuyerIdentityInput,
  enrichAnalyticsIdentity,
} from "@/lib/analytics/identity";
import type { StorefrontAnalyticsInput } from "@/lib/types/storefront";

type AnalyticsPayload = Record<string, unknown>;
type ServerAnalyticsPayload = {
  eventName: string;
  eventId?: string;
  path: string;
  value?: number;
  currency?: string;
  contentType?: "product" | "product_group";
  contentIds?: string[];
  items?: Array<{
    id: string;
    name?: string;
    price?: number;
    quantity?: number;
  }>;
  params?: Record<string, unknown>;
  user?: {
    fbp?: string;
    fbc?: string;
    clientId?: string;
    externalId?: string;
  };
};

export type StorefrontAnalyticsTrackCommand = {
  event: string;
  googleEvent?: string;
  metaPayload?: AnalyticsPayload;
  metaEvent?: string;
  googlePayload?: AnalyticsPayload;
  serverEvent?: string | null;
  options?: {
    eventId?: string;
  };
};

export type StorefrontAnalyticsBridge = {
  getConfig: () => StorefrontAnalyticsConfig;
  getIdentity: () => StorefrontAnalyticsInput | undefined;
  identify: (identity: StorefrontAnalyticsInput | undefined) => StorefrontAnalyticsInput | undefined;
  ready: boolean;
  track: (command: StorefrontAnalyticsTrackCommand) => void;
};

declare global {
  type MetaPixelQueueCall = [string, ...unknown[]];
  type MetaPixelFunction = ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void;
    loaded?: boolean;
    push?: (...args: MetaPixelQueueCall) => number;
    queue?: MetaPixelQueueCall[];
    version?: string;
  };

  interface Window {
    __storefrontAnalytics?: StorefrontAnalyticsBridge;
    __storefrontMetaPixelIds?: Record<string, true>;
    _fbq?: MetaPixelFunction;
    dataLayer?: unknown[];
    fbq?: MetaPixelFunction;
    gtag?: (...args: unknown[]) => void;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function buildServerAnalyticsPayload(
  event: string,
  payload: AnalyticsPayload | undefined,
  identity: StorefrontAnalyticsInput | undefined,
  eventId: string | undefined,
): ServerAnalyticsPayload {
  const source = payload ?? {};
  const items = Array.isArray(source.items)
    ? source.items.flatMap((item) => {
        if (!isRecord(item)) {
          return [];
        }

        const id = readString(item.id);
        if (!id) {
          return [];
        }

        const mappedItem: {
          id: string;
          name?: string;
          price?: number;
          quantity?: number;
        } = { id };
        const name = readString(item.name);
        const price = readNumber(item.price);
        const quantity = readNumber(item.quantity);

        if (name) {
          mappedItem.name = name;
        }

        if (price !== undefined) {
          mappedItem.price = price;
        }

        if (quantity !== undefined) {
          mappedItem.quantity = quantity;
        }

        return [mappedItem];
      })
    : undefined;
  const contentIds = Array.isArray(source.content_ids)
    ? source.content_ids
        .map((value) => (typeof value === "string" || typeof value === "number" ? String(value) : null))
        .filter((value): value is string => Boolean(value))
    : undefined;
  const params = Object.fromEntries(
    Object.entries(source).filter(([key]) => !["eventId", "value", "currency", "content_type", "content_ids", "items"].includes(key)),
  );

  const result: ServerAnalyticsPayload = {
    eventName: event,
    path: `${window.location.pathname}${window.location.search}`,
  };

  if (eventId) {
    result.eventId = eventId;
  }

  const value = readNumber(source.value);
  if (value !== undefined) {
    result.value = value;
  }

  const currency = readString(source.currency);
  if (currency) {
    result.currency = currency;
  }

  if (source.content_type === "product" || source.content_type === "product_group") {
    result.contentType = source.content_type;
  }

  if (contentIds && contentIds.length > 0) {
    result.contentIds = contentIds;
  }

  if (items && items.length > 0) {
    result.items = items;
  }

  if (Object.keys(params).length > 0) {
    result.params = params;
  }

  const currentIdentity = resolveCurrentBrowserIdentity(identity);

  if (currentIdentity) {
    const externalId =
      currentIdentity.tax_id ?? currentIdentity.email ?? currentIdentity.anonymous_id;
    const user = {
      ...(currentIdentity.fbp ? { fbp: currentIdentity.fbp } : {}),
      ...(currentIdentity.fbc ? { fbc: currentIdentity.fbc } : {}),
      ...(currentIdentity.ga_client_id ? { clientId: currentIdentity.ga_client_id } : {}),
      ...(externalId ? { externalId } : {}),
    };

    if (Object.keys(user).length > 0) {
      result.user = user;
    }
  }

  return result;
}

function resolveCurrentBrowserIdentity(
  identity: StorefrontAnalyticsInput | undefined,
): StorefrontAnalyticsInput | undefined {
  if (typeof document === "undefined") {
    return identity;
  }

  const cookieIdentity = extractAnalyticsCookies({
    cookie: document.cookie,
  });
  const currentIdentity = {
    ...identity,
    ...cookieIdentity,
  };

  return Object.keys(currentIdentity).length > 0 ? currentIdentity : undefined;
}

function postStorefrontServerAnalytics(
  event: string,
  payload: AnalyticsPayload | undefined,
  identity: StorefrontAnalyticsInput | undefined,
  eventId: string | undefined,
) {
  if (typeof window === "undefined") {
    return;
  }

  const body = buildServerAnalyticsPayload(event, payload, identity, eventId);

  void fetch("/api/storefront/v1/analytics/events", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => undefined);
}

function resolveMetaPixelRegistry(): Record<string, true> | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  window.__storefrontMetaPixelIds ??= {};
  return window.__storefrontMetaPixelIds;
}

function ensureMetaPixelBridge(pixelId: string): MetaPixelFunction | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  let fbq = window.fbq;

  if (typeof fbq !== "function") {
    const queuedFbq = ((...args: unknown[]) => {
      if (typeof queuedFbq.callMethod === "function") {
        queuedFbq.callMethod(...args);
        return;
      }

      queuedFbq.queue?.push(args as MetaPixelQueueCall);
    }) as MetaPixelFunction;

    queuedFbq.queue = [];
    queuedFbq.push = (...args: MetaPixelQueueCall) => queuedFbq.queue?.push(args) ?? 0;
    queuedFbq.loaded = true;
    queuedFbq.version = "2.0";

    fbq = queuedFbq;
    window.fbq = queuedFbq;
  }

  if (!window._fbq) {
    window._fbq = fbq;
  }

  const initializedPixels = resolveMetaPixelRegistry();

  if (initializedPixels && !initializedPixels[pixelId]) {
    fbq("init", pixelId);
    initializedPixels[pixelId] = true;
  }

  return fbq;
}

function createAnalyticsBridge(
  initialConfig: StorefrontAnalyticsConfig,
  initialIdentity: StorefrontAnalyticsInput | undefined,
): StorefrontAnalyticsBridge {
  let config = initialConfig;
  let identity = initialIdentity;

  return {
    ready: true,
    getConfig: () => config,
    getIdentity: () => identity,
    identify: (nextIdentity) => {
      identity = nextIdentity;
      return identity;
    },
    track: ({ event, googleEvent, googlePayload, metaEvent, metaPayload, options, serverEvent }) => {
      if (typeof window === "undefined") {
        return;
      }

      const analyticsPayload = metaPayload ?? googlePayload;
      const eventId = options?.eventId;

      const metaEventName = metaEvent ?? event;
      const googleEventName = googleEvent ?? event;

      if (config.meta.enabled && config.meta.pixelId) {
        const fbq = ensureMetaPixelBridge(config.meta.pixelId);
        const eventOptions = eventId ? { eventID: eventId } : undefined;

        if (typeof fbq === "function") {
          if (eventOptions) {
            fbq("track", metaEventName, metaPayload ?? {}, eventOptions);
          } else {
            fbq("track", metaEventName, metaPayload ?? {});
          }
        }
      }

      if (config.google.enabled && config.google.measurementId && typeof window.gtag === "function") {
        const payload = {
          ...(googlePayload ?? metaPayload ?? {}),
          ...(eventId ? { event_id: eventId } : {}),
        };

        window.gtag("event", googleEventName, payload);
      }

      const shouldPostServerAnalytics =
        serverEvent !== null && (config.meta.enabled || config.google.enabled);

      if (shouldPostServerAnalytics) {
        postStorefrontServerAnalytics(serverEvent ?? metaEvent ?? event, analyticsPayload, identity, eventId);
      }
    },
  };
}

export function installStorefrontAnalyticsBridge(
  config: StorefrontAnalyticsConfig,
  identity: StorefrontAnalyticsInput | undefined,
): StorefrontAnalyticsBridge | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const bridge = createAnalyticsBridge(config, identity);
  window.__storefrontAnalytics = bridge;
  return bridge;
}

export function getStorefrontAnalyticsBridge(): StorefrontAnalyticsBridge | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.__storefrontAnalytics;
}

export function enrichStorefrontAnalyticsBuyerIdentity(
  buyer: AnalyticsBuyerIdentityInput,
): StorefrontAnalyticsInput | undefined {
  const bridge = getStorefrontAnalyticsBridge();

  if (!bridge) {
    return undefined;
  }

  return bridge.identify(enrichAnalyticsIdentity(bridge.getIdentity(), buyer));
}

export function trackStorefrontAnalyticsEvent(command: StorefrontAnalyticsTrackCommand) {
  getStorefrontAnalyticsBridge()?.track(command);
}
