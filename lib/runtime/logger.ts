import type { StorefrontRequestContext } from "@/lib/runtime/storefront-request-context";

type LogLevel = "info" | "warn" | "error";

type LogEntry = {
  level: LogLevel;
  message: string;
  host: string;
  requestId: string;
  tenantSlug?: string;
  path?: string;
  status?: number;
  code?: string | undefined;
  error?: unknown;
  timestamp: string;
};

function writeLog(entry: LogEntry): void {
  const payload = JSON.stringify(entry);

  if (entry.level === "error") {
    console.error(payload);
  } else if (entry.level === "warn") {
    console.warn(payload);
  } else {
    console.log(payload);
  }
}

export function logStorefrontRequest({
  context,
  path,
  method,
}: {
  context: StorefrontRequestContext;
  path: string;
  method: string;
}): void {
  writeLog({
    level: "info",
    message: `Request ${method} ${path}`,
    host: context.host,
    requestId: context.requestId,
    ...(context.tenantSlug ? { tenantSlug: context.tenantSlug } : {}),
    path,
    timestamp: new Date().toISOString(),
  });
}

export function logStorefrontResponse({
  context,
  path,
  status,
}: {
  context: StorefrontRequestContext;
  path: string;
  status: number;
}): void {
  writeLog({
    level: status >= 400 ? "warn" : "info",
    message: `Response ${status} for ${path}`,
    host: context.host,
    requestId: context.requestId,
    ...(context.tenantSlug ? { tenantSlug: context.tenantSlug } : {}),
    path,
    status,
    timestamp: new Date().toISOString(),
  });
}

export function logStorefrontError({
  context,
  path,
  error,
  code,
}: {
  context: StorefrontRequestContext;
  path: string;
  error: unknown;
  code?: string;
}): void {
  writeLog({
    level: "error",
    message: error instanceof Error ? error.message : "Error desconocido en llamada al ERP",
    host: context.host,
    requestId: context.requestId,
    ...(context.tenantSlug ? { tenantSlug: context.tenantSlug } : {}),
    path,
    code,
    error: error instanceof Error ? { name: error.name, message: error.message } : error,
    timestamp: new Date().toISOString(),
  });
}
