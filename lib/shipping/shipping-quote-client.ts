import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type {
  StorefrontErrorResponse,
  StorefrontShippingBranchesRequest,
  StorefrontShippingBranchesResponse,
  StorefrontShippingQuoteRequest,
  StorefrontShippingQuoteResponse,
  StorefrontSuccessResponse,
} from "@/lib/types/storefront";

export class StorefrontShippingQuoteError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "StorefrontShippingQuoteError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSuccessEnvelope(
  value: unknown,
): value is StorefrontSuccessResponse<StorefrontShippingQuoteResponse> {
  return isRecord(value) && value.success === true && "data" in value;
}

function isBranchesSuccessEnvelope(
  value: unknown,
): value is StorefrontSuccessResponse<StorefrontShippingBranchesResponse> {
  return isRecord(value) && value.success === true && "data" in value;
}

function readErrorMessage(payload: unknown): { message: string; code?: string } {
  if (!isRecord(payload)) {
    return { message: "No se pudo cotizar el envío." };
  }

  const errorPayload = payload as StorefrontErrorResponse;

  if (typeof errorPayload.error === "string") {
    return {
      message: errorPayload.error,
      ...(typeof errorPayload.code === "string" ? { code: errorPayload.code } : {}),
    };
  }

  if (isRecord(errorPayload.error) && typeof errorPayload.error.message === "string") {
    return {
      message: errorPayload.error.message,
      ...(typeof errorPayload.error.code === "string"
        ? { code: errorPayload.error.code }
        : typeof errorPayload.code === "string"
          ? { code: errorPayload.code }
          : {}),
    };
  }

  return { message: "No se pudo cotizar el envío." };
}

export async function postStorefrontShippingQuote(
  request: StorefrontShippingQuoteRequest,
): Promise<StorefrontShippingQuoteResponse> {
  const response = await fetch(STOREFRONT_API_PATHS.shippingQuote, {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });
  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const { message, code } = readErrorMessage(payload);
    throw new StorefrontShippingQuoteError(message, response.status, code);
  }

  if (!isSuccessEnvelope(payload)) {
    throw new StorefrontShippingQuoteError("La plataforma devolvió una cotización inválida.");
  }

  return payload.data;
}

export async function getStorefrontShippingBranches(
  request: StorefrontShippingBranchesRequest,
): Promise<StorefrontShippingBranchesResponse> {
  const params = new URLSearchParams({
    provider: request.provider ?? "andreani",
    postalCode: request.postalCode,
  });

  if (request.contract) {
    params.set("contract", request.contract);
  }

  const response = await fetch(`${STOREFRONT_API_PATHS.shippingBranches}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });
  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const { message, code } = readErrorMessage(payload);
    throw new StorefrontShippingQuoteError(message, response.status, code);
  }

  if (!isBranchesSuccessEnvelope(payload)) {
    throw new StorefrontShippingQuoteError("La plataforma devolvió sucursales inválidas.");
  }

  return payload.data;
}
