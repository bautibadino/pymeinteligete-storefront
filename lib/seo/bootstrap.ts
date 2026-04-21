import { cache } from "react";

import { StorefrontApiError, getBootstrap, type StorefrontBootstrap } from "@/lib/storefront-api";

type SeoBootstrapResult = {
  bootstrap: StorefrontBootstrap | null;
  issues: string[];
};

const getSeoBootstrapByHost = cache(async (host: string): Promise<SeoBootstrapResult> => {
  try {
    const bootstrap = await getBootstrap(host);

    return {
      bootstrap,
      issues: [],
    };
  } catch (error) {
    if (error instanceof StorefrontApiError) {
      return {
        bootstrap: null,
        issues: [`bootstrap-error:${error.code}`],
      };
    }

    return {
      bootstrap: null,
      issues: ["bootstrap-error:unknown"],
    };
  }
});

export async function getBootstrapForSeo(host: string): Promise<SeoBootstrapResult> {
  return getSeoBootstrapByHost(host);
}
