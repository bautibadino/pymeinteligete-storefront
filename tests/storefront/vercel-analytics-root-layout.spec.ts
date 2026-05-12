import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("RootLayout Vercel Analytics", () => {
  it("inyecta el componente oficial de Vercel Analytics en el layout raiz", () => {
    const layoutSource = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");

    expect(layoutSource).toContain('import { Analytics } from "@vercel/analytics/next";');
    expect(layoutSource).toMatch(/<body>\s*\{children\}\s*<Analytics\s*\/>\s*<\/body>/);
  });
});
