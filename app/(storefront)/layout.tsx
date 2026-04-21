import type { ReactNode } from "react";

import { loadBootstrapExperience } from "@/app/(storefront)/_lib/storefront-shell-data";
import { StorefrontShell } from "@/components/storefront/storefront-shell";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const experience = await loadBootstrapExperience();

  return (
    <StorefrontShell
      bootstrap={experience.bootstrap}
      host={experience.runtime.context.host}
      issues={experience.issues}
    >
      {children}
    </StorefrontShell>
  );
}
