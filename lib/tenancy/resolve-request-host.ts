function getPrimaryHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const firstValue = value.split(",")[0]?.trim();

  return firstValue ? firstValue : null;
}

function normalizeHostCandidate(candidate: string): string {
  const withProtocol = candidate.includes("://") ? candidate : `http://${candidate}`;
  const parsed = new URL(withProtocol);

  return parsed.hostname.toLowerCase();
}

export function resolveRequestHostFromHeaders(headerStore: Headers): string {
  const candidate =
    getPrimaryHeaderValue(headerStore.get("x-forwarded-host")) ??
    getPrimaryHeaderValue(headerStore.get("host"));

  if (!candidate) {
    throw new Error(
      "No se pudo resolver el host de la request. El storefront depende de host real para tenancy.",
    );
  }

  return normalizeHostCandidate(candidate);
}
