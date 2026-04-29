import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const COMPONENT_PATH =
  "/Users/bautista/Desktop/Repositorios/pymeinteligete-storefront/components/templates/product-detail/product-detail-gallery-specs.tsx";

describe("ProductDetailGallerySpecs breadcrumb wiring", () => {
  it("apunta el breadcrumb publico a /catalogo", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8");

    expect(source).toContain('href={"/catalogo" as Route}');
    expect(source).not.toContain('href={"/catalog" as Route}');
  });
});
