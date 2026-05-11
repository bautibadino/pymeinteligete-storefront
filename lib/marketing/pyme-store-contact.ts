const PYME_STORE_WHATSAPP_ENV_KEY = "NEXT_PUBLIC_PYME_STORE_WHATSAPP";

type EnvSource = Record<string, string | undefined>;

export type PymeStoreWhatsAppConfig = {
  href: string;
  number: string;
  source: typeof PYME_STORE_WHATSAPP_ENV_KEY;
};

export type PymeStoreContactConfig = {
  whatsApp?: PymeStoreWhatsAppConfig;
};

function getDefaultEnv(): EnvSource {
  if (typeof process === "undefined") {
    return {};
  }

  return process.env;
}

function readWhatsAppNumberFromUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (host === "wa.me" || host.endsWith(".wa.me")) {
      return url.pathname.split("/").find(Boolean);
    }

    if (host === "api.whatsapp.com" || host.endsWith(".api.whatsapp.com")) {
      return url.searchParams.get("phone") ?? undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function normalizePymeStoreWhatsAppNumber(value: string | undefined): string | undefined {
  const rawValue = value?.trim();
  if (!rawValue) {
    return undefined;
  }

  const rawNumber = rawValue.startsWith("http")
    ? readWhatsAppNumberFromUrl(rawValue)
    : rawValue;
  const number = rawNumber?.replace(/\D/g, "") ?? "";

  if (number.length < 8 || number.length > 15 || !/[1-9]/.test(number)) {
    return undefined;
  }

  return number;
}

export function buildPymeStoreWhatsAppHref(
  value: string | undefined,
  message?: string,
): string | undefined {
  const number = normalizePymeStoreWhatsAppNumber(value);
  if (!number) {
    return undefined;
  }

  const href = `https://wa.me/${number}`;
  const text = message?.trim();

  return text ? `${href}?text=${encodeURIComponent(text)}` : href;
}

export function readPymeStoreContactConfig(
  env: EnvSource = getDefaultEnv(),
): PymeStoreContactConfig {
  const configuredNumber = env[PYME_STORE_WHATSAPP_ENV_KEY];
  const href = buildPymeStoreWhatsAppHref(configuredNumber);
  const number = normalizePymeStoreWhatsAppNumber(configuredNumber);

  return {
    ...(href && number
      ? {
          whatsApp: {
            href,
            number,
            source: PYME_STORE_WHATSAPP_ENV_KEY,
          },
        }
      : {}),
  };
}
