import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { loadBootstrapExperience } from "@/app/(storefront)/_lib/storefront-shell-data";
import { StorefrontAnalyticsProvider } from "@/components/analytics/storefront-analytics-provider";
import { StorefrontCartProvider } from "@/components/storefront/cart/storefront-cart-provider";
import { TenantThemeProvider } from "@/components/theme/TenantThemeProvider";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { resolveEffectiveTenantTheme } from "@/lib/theme";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const experience = await loadBootstrapExperience();

  if (experience.bootstrap?.tenant.status === "disabled") {
    notFound();
  }

  const theme = resolveEffectiveTenantTheme(experience.bootstrap);

  return (
    <TenantThemeProvider theme={theme}>
      <StorefrontAnalyticsProvider
        bootstrap={experience.bootstrap}
        host={experience.runtime.context.host}
      >
        <StorefrontCartProvider host={experience.runtime.context.host}>
          <StorefrontShell
            bootstrap={experience.bootstrap}
            host={experience.runtime.context.host}
            issues={experience.issues}
          >
            {children}
          </StorefrontShell>
        </StorefrontCartProvider>
      </StorefrontAnalyticsProvider>
    </TenantThemeProvider>
  );
}
