import type { ReactNode } from "react";

import { loadBootstrapExperience } from "@/app/(storefront)/_lib/storefront-shell-data";
import { TenantThemeProvider } from "@/components/theme/TenantThemeProvider";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { resolveTenantTheme } from "@/lib/theme";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const experience = await loadBootstrapExperience();
  const theme = resolveTenantTheme(experience.bootstrap);

  return (
    <TenantThemeProvider theme={theme}>
      <StorefrontShell
        bootstrap={experience.bootstrap}
        host={experience.runtime.context.host}
        issues={experience.issues}
      >
        {children}
      </StorefrontShell>
    </TenantThemeProvider>
  );
}
