export type ServerEnvSnapshot = {
  nodeEnv: string;
  pymeApiBaseUrl: string | null;
  storefrontVersionOverride: string | null;
  storefrontCatalogSecret: string | null;
};

function readOptionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();

  return value ? value : null;
}

export function getServerEnvSnapshot(): ServerEnvSnapshot {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    pymeApiBaseUrl: readOptionalEnv("PYME_API_BASE_URL"),
    storefrontVersionOverride: readOptionalEnv("STOREFRONT_VERSION"),
    storefrontCatalogSecret: readOptionalEnv("STOREFRONT_CATALOG_SECRET"),
  };
}
