import type { StorefrontBootstrap } from "@/lib/storefront-api";

import {
  CUSTOM_STOREFRONT_EXPERIENCE_KEYS,
  type CustomStorefrontExperienceKey,
} from "@/lib/experiences/types";

const TENANT_SLUG_EXPERIENCE_FALLBACKS: Record<string, CustomStorefrontExperienceKey> = {
  sportadventure: "sportadventure-custom-v1",
  "sportadventure-preview": "sportadventure-custom-v1",
};

function isCustomExperienceKey(value: unknown): value is CustomStorefrontExperienceKey {
  return (
    typeof value === "string" &&
    (CUSTOM_STOREFRONT_EXPERIENCE_KEYS as readonly string[]).includes(value)
  );
}

export function resolveCustomExperienceKey(
  bootstrap: StorefrontBootstrap | null,
): CustomStorefrontExperienceKey | null {
  const configuredExperience = bootstrap?.storefrontExperience;

  if (configuredExperience?.enabled && isCustomExperienceKey(configuredExperience.key)) {
    return configuredExperience.key;
  }

  const tenantSlug = bootstrap?.tenant?.tenantSlug;

  if (!tenantSlug) {
    return null;
  }

  return TENANT_SLUG_EXPERIENCE_FALLBACKS[tenantSlug] ?? null;
}
