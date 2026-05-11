const PYME_STORE_MARKETING_DOMAIN = "pymeinteligente.store";
const PYME_STORE_MARKETING_WWW_DOMAIN = `www.${PYME_STORE_MARKETING_DOMAIN}`;
const LOCAL_MARKETING_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function getPrimaryHostCandidate(candidate: string): string {
  return candidate.split(",")[0]?.trim() ?? "";
}

export function normalizePymeStoreHost(candidate: string | null | undefined): string | null {
  if (!candidate) {
    return null;
  }

  const primaryCandidate = getPrimaryHostCandidate(candidate);

  if (!primaryCandidate) {
    return null;
  }

  try {
    const withProtocol = primaryCandidate.includes("://")
      ? primaryCandidate
      : `http://${primaryCandidate}`;
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");

    return hostname || null;
  } catch {
    return null;
  }
}

export function isPymeStoreMarketingHost(candidate: string | null | undefined): boolean {
  const normalizedHost = normalizePymeStoreHost(candidate);

  return (
    normalizedHost === PYME_STORE_MARKETING_DOMAIN ||
    normalizedHost === PYME_STORE_MARKETING_WWW_DOMAIN ||
    (normalizedHost !== null && LOCAL_MARKETING_HOSTS.has(normalizedHost))
  );
}

export function getPymeStoreCanonicalUrl(pathname = "/"): string {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new URL(normalizedPathname, `https://${PYME_STORE_MARKETING_WWW_DOMAIN}`).toString();
}

export function isPymeStoreHost(candidate: string | null | undefined): boolean {
  return isPymeStoreMarketingHost(candidate);
}
