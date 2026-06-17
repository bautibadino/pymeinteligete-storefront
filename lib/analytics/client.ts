import type { StorefrontAnalyticsConfig } from "@/lib/analytics/config";
import { shouldFilterStorefrontTrafficEvent } from "@/lib/analytics/bot-detection";
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
    ttclid?: string;
    ttp?: string;
  };
};

export type StorefrontAnalyticsTrackCommand = {
  event: string;
  googleEvent?: string;
  metaPayload?: AnalyticsPayload;
  metaEvent?: string;
  googlePayload?: AnalyticsPayload;
  tiktokEvent?: string;
  tiktokPayload?: AnalyticsPayload;
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
  type TikTokPixelQueueCall = [string, ...unknown[]];
  type TikTokPixelFunction = ((...args: unknown[]) => void) & {
    instance?: Record<string, true>;
    load?: (pixelId: string) => void;
    page?: (payload?: Record<string, unknown>) => void;
    queue?: TikTokPixelQueueCall[];
    track?: (event: string, payload?: Record<string, unknown>) => void;
  };

  interface Window {
    __storefrontAnalytics?: StorefrontAnalyticsBridge;
    __storefrontMetaPixelIds?: Record<string, true>;
    __storefrontTikTokPixelIds?: Record<string, true>;
    _fbq?: MetaPixelFunction;
    dataLayer?: unknown[];
    fbq?: MetaPixelFunction;
    gtag?: (...args: unknown[]) => void;
    ttq?: TikTokPixelFunction;
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

function compactPayloadRecord<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== ""),
  ) as T;
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const values = value
    .map((entry) =>
      typeof entry === "string" || typeof entry === "number" ? String(entry) : undefined,
    )
    .filter((entry): entry is string => Boolean(entry));

  return values.length > 0 ? values : undefined;
}

type TikTokContentsItem = {
  brand?: string;
  content_category?: string;
  content_id: string;
  content_name?: string;
  price?: number;
  quantity?: number;
};

function buildTikTokContents(payload: AnalyticsPayload | undefined): TikTokContentsItem[] | undefined {
  if (!payload || !Array.isArray(payload.items)) {
    return undefined;
  }

  const contents = payload.items.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const contentId = readString(item.id);
    if (!contentId) {
      return [];
    }

    const entry: TikTokContentsItem = {
      content_id: contentId,
    };
    const brand = readString(item.brand);
    const category = readString(item.category);
    const contentName = readString(item.name);
    const price = readNumber(item.price);
    const quantity = readNumber(item.quantity);

    if (brand) {
      entry.brand = brand;
    }

    if (category) {
      entry.content_category = category;
    }

    if (contentName) {
      entry.content_name = contentName;
    }

    if (price !== undefined) {
      entry.price = price;
    }

    if (quantity !== undefined) {
      entry.quantity = quantity;
    }

    return [entry];
  });

  return contents.length > 0 ? contents : undefined;
}

function resolveTikTokUrl(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return readString(window.location.href);
}

function sanitizeTikTokPayloadExtras(payload: AnalyticsPayload | undefined): Record<string, unknown> {
  if (!payload) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return false;
      }

      return ![
        "content_ids",
        "content_name",
        "content_type",
        "currency",
        "eventId",
        "items",
        "num_items",
        "order_number",
        "order_token",
        "value",
      ].includes(key);
    }),
  );
}

function buildTikTokPixelPayload(
  payload: AnalyticsPayload | undefined,
  eventId: string | undefined,
): AnalyticsPayload {
  const source = payload;
  const contents = buildTikTokContents(source);
  const contentIds = readStringArray(source?.content_ids);
  const contentId =
    readString(source?.content_id) ?? contentIds?.[0] ?? contents?.[0]?.content_id;
  const contentName =
    readString(source?.content_name) ?? contents?.[0]?.content_name;
  const contentType =
    source?.content_type === "product" || source?.content_type === "product_group"
      ? source.content_type
      : undefined;
  const quantity =
    readNumber(source?.quantity) ??
    readNumber(source?.num_items) ??
    (contents
      ? contents.reduce((total, item) => total + (item.quantity ?? 1), 0)
      : undefined);
  const normalizedPayload: Record<string, unknown> = compactPayloadRecord({
    ...sanitizeTikTokPayloadExtras(source),
    ...(contentId ? { content_id: contentId } : {}),
    ...(contentIds ? { content_ids: contentIds } : {}),
    ...(contentName ? { content_name: contentName } : {}),
    ...(contentType ? { content_type: contentType } : {}),
    ...(readString(source?.currency) ? { currency: readString(source?.currency) } : {}),
    ...(readString(source?.description) ?? contentName
      ? { description: readString(source?.description) ?? contentName }
      : {}),
    ...(eventId ? { event_id: eventId } : {}),
    ...(quantity !== undefined ? { quantity } : {}),
    ...(resolveTikTokUrl() ? { url: resolveTikTokUrl() } : {}),
    ...(readNumber(source?.value) !== undefined ? { value: readNumber(source?.value) } : {}),
    ...(contents ? { contents } : {}),
  });

  if ("search_string" in normalizedPayload && !("query" in normalizedPayload)) {
    const searchString = readString(normalizedPayload.search_string);
    if (searchString) {
      normalizedPayload.query = searchString;
    }
  }

  return normalizedPayload;
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
      ...(currentIdentity.ttclid ? { ttclid: currentIdentity.ttclid } : {}),
      ...(currentIdentity.ttp ? { ttp: currentIdentity.ttp } : {}),
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

function resolveBrowserUserAgent(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return typeof window.navigator?.userAgent === "string"
    ? window.navigator.userAgent
    : undefined;
}

function resolveMetaPixelRegistry(): Record<string, true> | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  window.__storefrontMetaPixelIds ??= {};
  return window.__storefrontMetaPixelIds;
}

function resolveTikTokPixelRegistry(): Record<string, true> | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  window.__storefrontTikTokPixelIds ??= {};
  return window.__storefrontTikTokPixelIds;
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

function createQueuedTikTokBridge(): TikTokPixelFunction {
  const ttq = ((method: string, ...args: unknown[]) => {
    ttq.queue?.push([method, ...args]);
  }) as TikTokPixelFunction;

  ttq.queue = [];
  ttq.instance = {};
  ttq.load = (pixelId: string) => {
    if (ttq.instance) {
      ttq.instance[pixelId] = true;
    }

    ttq.queue?.push(["load", pixelId]);
  };
  ttq.page = (payload?: Record<string, unknown>) => {
    if (payload && Object.keys(payload).length > 0) {
      ttq.queue?.push(["page", payload]);
      return;
    }

    ttq.queue?.push(["page"]);
  };
  ttq.track = (event: string, payload?: Record<string, unknown>) => {
    ttq.queue?.push(["track", event, payload ?? {}]);
  };

  return ttq;
}

function ensureTikTokPixelBridge(pixelId: string): TikTokPixelFunction | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  let ttq = window.ttq;

  if (!ttq || (typeof ttq !== "function" && !isRecord(ttq))) {
    ttq = createQueuedTikTokBridge();
    window.ttq = ttq;
  }

  const bridge = ttq as TikTokPixelFunction;

  bridge.instance ??= {};
  const initializedPixels = resolveTikTokPixelRegistry();

  if (initializedPixels && !initializedPixels[pixelId]) {
    bridge.load?.(pixelId);
    initializedPixels[pixelId] = true;
  }

  return bridge;
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
    track: ({
      event,
      googleEvent,
      googlePayload,
      metaEvent,
      metaPayload,
      options,
      serverEvent,
      tiktokEvent,
      tiktokPayload,
    }) => {
      if (typeof window === "undefined") {
        return;
      }

      const analyticsPayload = metaPayload ?? googlePayload ?? tiktokPayload;
      const eventId = options?.eventId;

      const metaEventName = metaEvent ?? event;
      const googleEventName = googleEvent ?? event;
      const tiktokEventName = tiktokEvent ?? event;
      const tiktokConfig = config.tiktok;
      const browserUserAgent = resolveBrowserUserAgent();

      if (
        shouldFilterStorefrontTrafficEvent({
          eventName: serverEvent ?? metaEvent ?? tiktokEvent ?? event,
          userAgent: browserUserAgent,
        })
      ) {
        return;
      }

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

      if (tiktokConfig?.enabled && tiktokConfig.pixelId) {
        const ttq = ensureTikTokPixelBridge(tiktokConfig.pixelId);
        const payload = buildTikTokPixelPayload(
          tiktokPayload ?? metaPayload ?? googlePayload,
          eventId,
        );

        if (tiktokEventName === "PageView") {
          ttq?.page?.(payload);
        } else {
          ttq?.track?.(tiktokEventName, payload);
        }
      }

      const shouldPostServerAnalytics = typeof serverEvent === "string" && serverEvent.length > 0;

      if (shouldPostServerAnalytics) {
        postStorefrontServerAnalytics(
          serverEvent ?? metaEvent ?? tiktokEvent ?? event,
          analyticsPayload,
          identity,
          eventId,
        );
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
