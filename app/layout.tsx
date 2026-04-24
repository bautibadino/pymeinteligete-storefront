import type { ReactNode } from "react";
import { headers } from "next/headers";

import "./globals.css";
import { resolveRequestHostFromHeaders } from "@/lib/tenancy/resolve-request-host";
import { getBootstrap } from "@/lib/storefront-api";
import { applyPresentationTheme } from "@/lib/theme/apply-presentation-theme";

export default async function RootLayout({ children }: { children: ReactNode }) {
  let htmlStyle: Record<string, string> | undefined;

  try {
    const headerStore = await headers();
    const host = resolveRequestHostFromHeaders(headerStore);

    const bootstrap = await getBootstrap({
      host,
      requestId: "root-layout",
      storefrontVersion: "root-layout",
    });

    if (bootstrap.presentation?.theme) {
      htmlStyle = applyPresentationTheme(bootstrap.presentation.theme);
    }
  } catch {
    // El storefront layout maneja el estado de error; aquí silenciamos
    // para no romper el render base si el bootstrap no está disponible.
  }

  return (
    <html lang="es" style={htmlStyle}>
      <body>{children}</body>
    </html>
  );
}
