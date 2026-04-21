import type { ReactNode } from "react";

import { themeToCssVars, type TenantTheme } from "@/lib/theme";

type TenantThemeProviderProps = {
  theme: TenantTheme;
  children: ReactNode;
};

export function TenantThemeProvider({ theme, children }: TenantThemeProviderProps) {
  return (
    <div className={`tenant-theme tenant-theme-${theme.preset}`} style={themeToCssVars(theme)}>
      {children}
    </div>
  );
}
