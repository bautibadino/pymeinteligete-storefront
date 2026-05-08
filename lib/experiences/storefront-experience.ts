import type { StorefrontBootstrap } from "@/lib/storefront-api";

export const BYM_CUSTOM_EXPERIENCE_KEY = "bym-custom-v1";

export type StorefrontExperienceKey = typeof BYM_CUSTOM_EXPERIENCE_KEY;

export function getStorefrontExperienceKey(
  bootstrap: StorefrontBootstrap | null | undefined,
): StorefrontExperienceKey | null {
  const experience = bootstrap?.storefrontExperience;
  if (!experience?.enabled) {
    return null;
  }

  if (experience.key === BYM_CUSTOM_EXPERIENCE_KEY) {
    return experience.key;
  }

  return null;
}

export function isBymCustomExperience(
  bootstrap: StorefrontBootstrap | null | undefined,
): boolean {
  return getStorefrontExperienceKey(bootstrap) === BYM_CUSTOM_EXPERIENCE_KEY;
}
