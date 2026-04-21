import { STOREFRONT_INTERNAL_ERROR_CODES } from "@/lib/contracts/storefront-v1";

type StorefrontApiErrorParams = {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
  path: string;
  host: string;
  requestId: string;
  cause?: unknown;
};

export class StorefrontApiError extends Error {
  readonly code: string;
  readonly status: number | undefined;
  readonly details: unknown;
  readonly path: string;
  readonly host: string;
  readonly requestId: string;

  constructor({
    message,
    code = STOREFRONT_INTERNAL_ERROR_CODES.network,
    status,
    details,
    path,
    host,
    requestId,
    cause,
  }: StorefrontApiErrorParams) {
    super(message, cause ? { cause } : undefined);
    this.name = "StorefrontApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.path = path;
    this.host = host;
    this.requestId = requestId;
  }
}
