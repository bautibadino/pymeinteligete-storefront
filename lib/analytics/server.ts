import { cookies } from "next/headers";

import { readAnalyticsIdentityFromCookieString } from "@/lib/analytics/identity";

type ServerAnalyticsUser = {
  fbp?: string;
  fbc?: string;
  clientId?: string;
  externalId?: string;
  clientUserAgent?: string;
  clientIpAddress?: string;
};

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
  user?: ServerAnalyticsUser;
  [key: string]: unknown;
};

type EnrichServerAnalyticsPayloadInput = {
  body: ServerAnalyticsPayload;
  cookieHeader?: string | null;
  userAgent?: string | null;
  forwardedFor?: string | null;
  realIp?: string | null;
};

function readForwardedClientIp(
  forwardedFor: string | null | undefined,
  realIp: string | null | undefined,
): string | undefined {
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  if (forwardedIp) {
    return forwardedIp;
  }

  const directIp = realIp?.trim();
  return directIp || undefined;
}

function resolveExternalId(
  bodyUser: ServerAnalyticsUser | undefined,
  identity: ReturnType<typeof readAnalyticsIdentityFromCookieString>,
): string | undefined {
  if (bodyUser?.externalId) {
    return bodyUser.externalId;
  }

  if (!identity) {
    return undefined;
  }

  return identity.tax_id ?? identity.email ?? identity.anonymous_id;
}

export async function readAnalyticsIdentityFromRequest() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");

  return readAnalyticsIdentityFromCookieString(cookieHeader);
}

export function enrichServerAnalyticsPayload({
  body,
  cookieHeader,
  userAgent,
  forwardedFor,
  realIp,
}: EnrichServerAnalyticsPayloadInput): ServerAnalyticsPayload {
  const identity = readAnalyticsIdentityFromCookieString(cookieHeader ?? undefined);
  const clientIpAddress = readForwardedClientIp(forwardedFor, realIp);
  const externalId = resolveExternalId(body.user, identity);
  const nextUser: ServerAnalyticsUser = {};

  if (body.user?.fbp) {
    nextUser.fbp = body.user.fbp;
  } else if (identity?.fbp) {
    nextUser.fbp = identity.fbp;
  }

  if (body.user?.fbc) {
    nextUser.fbc = body.user.fbc;
  } else if (identity?.fbc) {
    nextUser.fbc = identity.fbc;
  }

  if (body.user?.clientId) {
    nextUser.clientId = body.user.clientId;
  } else if (identity?.ga_client_id) {
    nextUser.clientId = identity.ga_client_id;
  }

  if (externalId) {
    nextUser.externalId = externalId;
  }

  if (body.user?.clientUserAgent) {
    nextUser.clientUserAgent = body.user.clientUserAgent;
  } else if (userAgent?.trim()) {
    nextUser.clientUserAgent = userAgent.trim();
  }

  if (body.user?.clientIpAddress) {
    nextUser.clientIpAddress = body.user.clientIpAddress;
  } else if (clientIpAddress) {
    nextUser.clientIpAddress = clientIpAddress;
  }

  return {
    ...body,
    ...(Object.keys(nextUser).length > 0 ? { user: nextUser } : {}),
  };
}
