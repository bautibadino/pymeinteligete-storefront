function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getStringValue(
  source: unknown,
  key: string,
): string | null {
  if (!isRecord(source)) {
    return null;
  }

  const value = source[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getBooleanValue(
  source: unknown,
  key: string,
): boolean | null {
  if (!isRecord(source)) {
    return null;
  }

  const value = source[key];

  return typeof value === "boolean" ? value : null;
}

export function getNestedRecord(
  source: unknown,
  key: string,
): Record<string, unknown> | null {
  if (!isRecord(source)) {
    return null;
  }

  const value = source[key];

  return isRecord(value) ? value : null;
}

export function pickFirstString(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function isLocalhostHost(host: string): boolean {
  const normalized = host.toLowerCase();

  return normalized === "localhost" || normalized === "127.0.0.1" || normalized.endsWith(".localhost");
}
