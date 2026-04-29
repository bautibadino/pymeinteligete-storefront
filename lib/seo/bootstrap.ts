import { cache } from "react";

import { STOREFRONT_TECHNICAL_NAME, STOREFRONT_VERSION } from "@/lib/config/storefront";
import { createRequestId } from "@/lib/runtime/request-id";
import { StorefrontApiError, getBootstrap, type StorefrontBootstrap } from "@/lib/storefront-api";
import type { StorefrontFetchInput } from "@/lib/types/storefront";
import type { TenantSeoRequestContext } from "@/lib/seo/types";

type SeoBootstrapResult = {
  bootstrap: StorefrontBootstrap | null;
  issues: string[];
};

function resolveSeoFetchInput(input: string | TenantSeoRequestContext): StorefrontFetchInput {
  if (typeof input === "string") {
    return input;
  }

  return {
    host: input.resolvedHost,
    requestId: createRequestId(),
    storefrontVersion: `${STOREFRONT_TECHNICAL_NAME}@${STOREFRONT_VERSION}`,
    ...(input.tenantSlug ? { tenantSlug: input.tenantSlug } : {}),
  };
}

const getSeoBootstrapByKey = cache(
  async (host: string, tenantSlug?: string): Promise<SeoBootstrapResult> => {
  try {
      const bootstrap = await getBootstrap({
        host,
        requestId: createRequestId(),
        storefrontVersion: `${STOREFRONT_TECHNICAL_NAME}@${STOREFRONT_VERSION}`,
        ...(tenantSlug ? { tenantSlug } : {}),
      });

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
  },
);

export async function getBootstrapForSeo(
  input: string | TenantSeoRequestContext,
): Promise<SeoBootstrapResult> {
  const resolvedInput = resolveSeoFetchInput(input);

  if (typeof resolvedInput === "string") {
    return getSeoBootstrapByKey(resolvedInput);
  }

  return getSeoBootstrapByKey(resolvedInput.host, resolvedInput.tenantSlug);
}
