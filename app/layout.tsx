import type { ReactNode } from "react";

import "./globals.css";
import { getBootstrap } from "@/lib/storefront-api";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import { applyPresentationTheme } from "@/lib/theme/apply-presentation-theme";

export default async function RootLayout({ children }: { children: ReactNode }) {
  let htmlStyle: Record<string, string> | undefined;

  try {
    const runtime = await getStorefrontRuntimeSnapshot();

    const bootstrap = await getBootstrap(runtime.context);

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
