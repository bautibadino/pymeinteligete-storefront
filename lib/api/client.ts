import { STOREFRONT_INTERNAL_ERROR_CODES } from "@/lib/contracts/storefront-v1";
import { getServerEnvSnapshot } from "@/lib/env/server-env";
import {
  logStorefrontError,
  logStorefrontRequest,
  logStorefrontResponse,
} from "@/lib/runtime/logger";
import type { StorefrontRequestContext } from "@/lib/runtime/storefront-request-context";
import type {
  StorefrontErrorResponse,
  StorefrontQueryParams,
  StorefrontSuccessResponse,
} from "@/lib/types/storefront";

import { StorefrontApiError } from "@/lib/api/errors";
import { buildStorefrontHeaders } from "@/lib/api/headers";
import { buildStorefrontSearchParams } from "@/lib/api/query";

type StorefrontHttpMethod = "GET" | "POST";

export type StorefrontNextOptions = {
  revalidate?: number | false;
  tags?: string[];
};

type StorefrontApiRequestOptions<TBody> = {
  path: string;
  context: StorefrontRequestContext;
  method?: StorefrontHttpMethod;
  query?: StorefrontQueryParams;
  body?: TBody;
  headers?: HeadersInit;
  idempotencyKey?: string;
  cache?: RequestCache;
  next?: StorefrontNextOptions;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isErrorEnvelope(value: unknown): value is StorefrontErrorResponse {
  return (
    isRecord(value) &&
    value.success === false &&
    typeof value.error === "string" &&
    (value.code === undefined || typeof value.code === "string")
  );
}

function isSuccessEnvelope<TData>(value: unknown): value is StorefrontSuccessResponse<TData> {
  return isRecord(value) && value.success === true && "data" in value;
}

function getApiBaseUrl(): string {
  const baseUrl = getServerEnvSnapshot().pymeApiBaseUrl;

  if (!baseUrl) {
    throw new Error("Falta definir PYME_API_BASE_URL.");
  }

  return baseUrl.replace(/\/+$/, "");
}

function buildRequestUrl(path: string, query?: StorefrontQueryParams): string {
  const url = new URL(path, `${getApiBaseUrl()}/`);
  const searchParams = buildStorefrontSearchParams(query);

  url.search = searchParams.toString();

  return url.toString();
}

async function readResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch (error) {
    throw new StorefrontApiError({
      message: "La plataforma respondio un body no JSON.",
      code: STOREFRONT_INTERNAL_ERROR_CODES.invalidJson,
      status: response.status,
      path: response.url,
      host: new URL(response.url).host,
      requestId: response.headers.get("x-request-id") ?? "unknown",
      details: { rawText },
      cause: error,
    });
  }
}

function resolveIdempotencyKey<TBody>(
  explicitKey: string | undefined,
  body: TBody | undefined,
): string | undefined {
  if (explicitKey) {
    return explicitKey;
  }

  if (!isRecord(body)) {
    return undefined;
  }

  const candidate = body.idempotencyKey;

  return typeof candidate === "string" && candidate.trim() ? candidate : undefined;
}

function toStorefrontApiError(
  payload: unknown,
  response: Response,
  context: StorefrontRequestContext,
  path: string,
): StorefrontApiError {
  if (isErrorEnvelope(payload)) {
    const errorParams = {
      message: payload.error,
      status: response.status,
      details: payload.details,
      path,
      host: context.host,
      requestId: context.requestId,
    };

    if (payload.code) {
      return new StorefrontApiError({
        ...errorParams,
        code: payload.code,
      });
    }

    return new StorefrontApiError({
      ...errorParams,
    });
  }

  return new StorefrontApiError({
    message: `La plataforma respondio ${response.status} en ${path}.`,
    status: response.status,
    path,
    host: context.host,
    requestId: context.requestId,
    details: payload,
  });
}

export async function requestStorefrontApi<TData, TBody = undefined>({
  path,
  context,
  method = "GET",
  query,
  body,
  headers,
  idempotencyKey,
  cache,
  next,
}: StorefrontApiRequestOptions<TBody>): Promise<TData> {
  const url = buildRequestUrl(path, query);
  const resolvedIdempotencyKey = resolveIdempotencyKey(idempotencyKey, body);
  const headerOptions = {
    context,
    ...(resolvedIdempotencyKey ? { idempotencyKey: resolvedIdempotencyKey } : {}),
    ...(headers ? { headers } : {}),
  };
  const resolvedHeaders = buildStorefrontHeaders(headerOptions);

  const requestInit: RequestInit & { next?: StorefrontNextOptions } = {
    method,
    headers: resolvedHeaders,
  };

  if (cache) {
    requestInit.cache = cache;
  }

  if (next) {
    requestInit.next = next;
  }

  if (body !== undefined) {
    resolvedHeaders.set("content-type", "application/json");
    requestInit.body = JSON.stringify(body);
  }

  logStorefrontRequest({ context, path, method: method ?? "GET" });

  let response: Response;

  try {
    response = await fetch(url, requestInit);
  } catch (error) {
    logStorefrontError({ context, path, error, code: STOREFRONT_INTERNAL_ERROR_CODES.network });
    throw new StorefrontApiError({
      message: `No se pudo conectar con la plataforma en ${path}.`,
      code: STOREFRONT_INTERNAL_ERROR_CODES.network,
      path,
      host: context.host,
      requestId: context.requestId,
      cause: error,
    });
  }

  logStorefrontResponse({ context, path, status: response.status });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    const apiError = toStorefrontApiError(payload, response, context, path);
    logStorefrontError({ context, path, error: apiError, code: apiError.code });
    throw apiError;
  }

  if (!isSuccessEnvelope<TData>(payload)) {
    const envelopeError = new StorefrontApiError({
      message: `La plataforma respondio un envelope invalido para ${path}.`,
      code: STOREFRONT_INTERNAL_ERROR_CODES.invalidEnvelope,
      status: response.status,
      path,
      host: context.host,
      requestId: context.requestId,
      details: payload,
    });
    logStorefrontError({ context, path, error: envelopeError, code: envelopeError.code });
    throw envelopeError;
  }

  return payload.data;
}
