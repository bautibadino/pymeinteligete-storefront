import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const COMPONENT_PATH =
  "/Users/bautista/Desktop/Repositorios/pymeinteligete-storefront/components/templates/product-detail/product-detail-gallery-specs.tsx";
const SHOWCASE_PATH =
  "/Users/bautista/Desktop/Repositorios/pymeinteligete-storefront/components/templates/product-detail/product-detail-showcase-client.tsx";
const PRIMITIVES_PATH =
  "/Users/bautista/Desktop/Repositorios/pymeinteligete-storefront/components/templates/product-detail/product-detail-primitives.tsx";

describe("ProductDetailGallerySpecs breadcrumb wiring", () => {
  it("apunta el breadcrumb publico a /catalogo", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8");

    expect(source).toContain('href={"/catalogo" as Route}');
    expect(source).not.toContain('href={"/catalog" as Route}');
  });
});

describe("ProductDetailGallerySpecs mobile/tablet contract", () => {
  it("reserva el layout de dos columnas para desktop y esconde la lectura rapida antes de lg", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8");

    expect(source).toContain("lg:grid-cols-[minmax(0,1fr)_minmax(300px,320px)]");
    expect(source).toContain('className="hidden lg:block"');
  });

  it("centra la insignia de la galeria en mobile y evita que las cards fuercen overflow", () => {
    const showcaseSource = readFileSync(SHOWCASE_PATH, "utf8");
    const primitivesSource = readFileSync(PRIMITIVES_PATH, "utf8");

    expect(showcaseSource).toContain("left-1/2 top-3 z-10");
    expect(showcaseSource).toContain("md:left-5 md:top-5 md:translate-x-0");
    expect(primitivesSource).toContain('"min-w-0 rounded-none border-y');
    expect(primitivesSource).toContain('"mx-auto max-w-7xl px-3 sm:px-0"');
  });
});
