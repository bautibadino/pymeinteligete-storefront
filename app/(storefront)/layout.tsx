import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { loadBootstrapExperience } from "@/app/(storefront)/_lib/storefront-shell-data";
import { StorefrontAnalyticsProvider } from "@/components/analytics/storefront-analytics-provider";
import { StorefrontCartProvider } from "@/components/storefront/cart/storefront-cart-provider";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { TenantThemeProvider } from "@/components/theme/TenantThemeProvider";
import { resolveCustomExperienceKey } from "@/lib/experiences";
import { shouldServePymeStoreMarketingLanding } from "@/lib/marketing/pyme-store-host";
import { resolveRequestHostFromHeaders } from "@/lib/tenancy/resolve-request-host";
import { resolveEffectiveTenantTheme } from "@/lib/theme";

async function isPymeStoreMarketingRequest(): Promise<boolean> {
  try {
    const headerStore = await headers();
    const host = resolveRequestHostFromHeaders(headerStore);

    return shouldServePymeStoreMarketingLanding(host, headerStore);
  } catch {
    return false;
  }
}

export default async function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (await isPymeStoreMarketingRequest()) {
    return <>{children}</>;
  }

  const experience = await loadBootstrapExperience();

  if (experience.bootstrap?.tenant.status === "disabled") {
    notFound();
  }

  const theme = resolveEffectiveTenantTheme(experience.bootstrap);
  const customExperienceKey = resolveCustomExperienceKey(experience.bootstrap);

  return (
    <TenantThemeProvider theme={theme}>
      <StorefrontAnalyticsProvider
        bootstrap={experience.bootstrap}
        host={experience.runtime.context.host}
      >
        <StorefrontCartProvider host={experience.runtime.context.host}>
          {customExperienceKey ? (
            <main
              className={`custom-experience-root custom-experience-root-${customExperienceKey}`}
            >
              {children}
            </main>
          ) : (
            <StorefrontShell
              bootstrap={experience.bootstrap}
              categories={experience.categories}
              host={experience.runtime.context.host}
              issues={experience.issues}
            >
              {children}
            </StorefrontShell>
          )}
        </StorefrontCartProvider>
      </StorefrontAnalyticsProvider>
    </TenantThemeProvider>
  );
}
