import type { ReactNode } from "react";

import { SportAdventureHomeExperience } from "@/components/experiences/sportadventure";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

import { resolveCustomExperienceKey } from "@/lib/experiences/resolve-experience-key";
import type {
  CustomHomeExperienceProps,
  CustomStorefrontExperienceKey,
} from "@/lib/experiences/types";

type CustomExperienceDefinition = {
  key: CustomStorefrontExperienceKey;
  renderHome: (props: CustomHomeExperienceProps) => ReactNode;
};

const CUSTOM_EXPERIENCE_REGISTRY: Record<
  CustomStorefrontExperienceKey,
  CustomExperienceDefinition
> = {
  "sportadventure-custom-v1": {
    key: "sportadventure-custom-v1",
    renderHome: ({ bootstrap, host, products, categories, paymentMethods }) => (
      <SportAdventureHomeExperience
        bootstrap={bootstrap}
        host={host}
        products={products}
        categories={categories}
        paymentMethods={paymentMethods}
      />
    ),
  },
};

export function resolveCustomExperienceDefinition(
  bootstrap: StorefrontBootstrap | null,
): CustomExperienceDefinition | null {
  const key = resolveCustomExperienceKey(bootstrap);
  return key ? CUSTOM_EXPERIENCE_REGISTRY[key] : null;
}
