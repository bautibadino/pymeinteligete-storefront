import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type {
  StorefrontCartValidateRequest,
  StorefrontCartValidateResult,
  StorefrontErrorResponse,
  StorefrontSuccessResponse,
} from "@/lib/types/storefront";

export class StorefrontCartValidationError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "StorefrontCartValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSuccessEnvelope(
  value: unknown,
): value is StorefrontSuccessResponse<StorefrontCartValidateResult> {
  return isRecord(value) && value.success === true && "data" in value;
}

function readErrorMessage(payload: unknown): { message: string; code?: string } {
  if (!isRecord(payload)) {
    return { message: "No se pudo validar el carrito." };
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

  return { message: "No se pudo validar el carrito." };
}

export async function postStorefrontCartValidate(
  request: StorefrontCartValidateRequest,
): Promise<StorefrontCartValidateResult> {
  const response = await fetch(STOREFRONT_API_PATHS.cartValidate, {
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
    throw new StorefrontCartValidationError(message, response.status, code);
  }

  if (!isSuccessEnvelope(payload)) {
    throw new StorefrontCartValidationError("La plataforma devolvió una validación inválida.");
  }

  return payload.data;
}
