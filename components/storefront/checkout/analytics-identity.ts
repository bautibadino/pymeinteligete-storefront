"use client";

import { getStorefrontAnalyticsBridge } from "@/lib/analytics/client";
import { enrichAnalyticsIdentity } from "@/lib/analytics/identity";

type CheckoutAnalyticsIdentityInput = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  taxId?: string;
};

function compactCheckoutAnalyticsIdentity(
  identityInput: CheckoutAnalyticsIdentityInput,
) {
  return {
    ...(identityInput.name ? { name: identityInput.name } : {}),
    ...(identityInput.email ? { email: identityInput.email } : {}),
    ...(identityInput.phone ? { phone: identityInput.phone } : {}),
    ...(identityInput.city ? { city: identityInput.city } : {}),
    ...(identityInput.province ? { province: identityInput.province } : {}),
    ...(identityInput.postalCode ? { postalCode: identityInput.postalCode } : {}),
    ...(identityInput.taxId ? { taxId: identityInput.taxId } : {}),
  };
}

export function identifyCheckoutAnalyticsBuyer(
  identityInput: CheckoutAnalyticsIdentityInput,
) {
  const bridge = getStorefrontAnalyticsBridge();

  if (!bridge) {
    return;
  }

  bridge.identify(
    enrichAnalyticsIdentity(
      bridge.getIdentity(),
      compactCheckoutAnalyticsIdentity(identityInput),
    ),
  );
}
