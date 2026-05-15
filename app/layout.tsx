import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { headers } from "next/headers";

import "./globals.css";
import { loadBootstrapExperience } from "@/app/(storefront)/_lib/storefront-shell-data";
import { shouldServePymeStoreMarketingLanding } from "@/lib/marketing/pyme-store-host";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import { applyPresentationTheme } from "@/lib/theme/apply-presentation-theme";

export default async function RootLayout({ children }: { children: ReactNode }) {
  let htmlStyle: Record<string, string> | undefined;

  try {
    const headerStore = await headers();
    const runtime = await getStorefrontRuntimeSnapshot();

    if (!shouldServePymeStoreMarketingLanding(runtime.context.host, headerStore)) {
      const { bootstrap } = await loadBootstrapExperience();

      if (bootstrap?.presentation?.theme) {
        htmlStyle = applyPresentationTheme(bootstrap.presentation.theme);
      }
    }
  } catch {
    // El storefront layout maneja el estado de error; aquí silenciamos
    // para no romper el render base si el bootstrap no está disponible.
  }

  return (
    <html lang="es" style={htmlStyle}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
