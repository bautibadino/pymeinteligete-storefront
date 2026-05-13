import { describe, expect, it } from "vitest";

import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";

describe("shouldPrefetchStorefrontLink", () => {
  it("desactiva prefetch para superficies caras del storefront", () => {
    expect(shouldPrefetchStorefrontLink("/catalogo")).toBe(false);
    expect(shouldPrefetchStorefrontLink("/catalogo/cubiertas")).toBe(false);
    expect(shouldPrefetchStorefrontLink("/catalog/slug")).toBe(false);
    expect(shouldPrefetchStorefrontLink("/producto/neumatico-1")).toBe(false);
  });

  it("mantiene prefetch para rutas livianas o externas", () => {
    expect(shouldPrefetchStorefrontLink("/contacto")).toBe(true);
    expect(shouldPrefetchStorefrontLink("/")).toBe(true);
    expect(shouldPrefetchStorefrontLink("https://example.com")).toBe(true);
  });
});
