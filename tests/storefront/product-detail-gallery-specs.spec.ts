import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import {
  buildProductDetailTabs,
  type ProductDetailTabSection,
} from "@/components/templates/product-detail/product-detail-primitives";
import type { ProductDetailData } from "@/lib/modules/product-detail";

const COMPONENT_PATH =
  `${process.cwd()}/components/templates/product-detail/product-detail-gallery-specs.tsx`;
const SHOWCASE_PATH =
  `${process.cwd()}/components/templates/product-detail/product-detail-showcase-client.tsx`;
const PRIMITIVES_PATH =
  `${process.cwd()}/components/templates/product-detail/product-detail-primitives.tsx`;

const PRODUCT_FIXTURE: ProductDetailData = {
  id: "prod-1",
  name: "Linglong Greenmax ET 145/70R13",
  slug: "linglong-greenmax-et-14570r13-001-300-221000024",
  brand: "Linglong",
  brandLogoUrl: "https://example.com/linglong-logo.webp",
  description: "Neumático urbano con buen balance entre durabilidad y confort.",
  images: [{ url: "https://example.com/tire.webp", alt: "Neumático Linglong" }],
  price: { amount: 118825, currency: "ARS", formatted: "$ 118.825" },
  stock: { available: true, label: "Disponible con entrega en 72h" },
  freeShipping: true,
  dispatch: { type: "DELAYED_72H", label: "Entrega en 72h" },
  badges: [
    { label: "Envío gratis", tone: "success" },
    { label: "Instalación incluida", tone: "info" },
    { label: "Envío gratis", tone: "success" },
  ],
  specifications: [
    { label: "Marca", value: "Linglong" },
    { label: "Rodado", value: "13" },
  ],
  href: "/producto/linglong-greenmax-et-14570r13-001-300-221000024",
};

function findSection(sections: ProductDetailTabSection[], id: string) {
  return sections.find((section) => section.id === id);
}

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

  it("ubica las pestañas debajo de la galería solo en desktop", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8");

    expect(source).toContain('className="grid min-w-0 gap-3 lg:gap-5 xl:gap-6"');
    expect(source).toContain('<ProductDetailSegmentedTabs sections={tabs} className="hidden lg:grid lg:min-h-[300px]" />');
  });

  it("mantiene las pestañas debajo de todo el bloque comercial antes de desktop", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8");

    expect(source).toContain('<div className="mt-4 md:mt-5 lg:hidden">');
    expect(source).toContain('<ProductDetailSegmentedTabs sections={tabs} />');
  });

  it("centra la insignia de la galeria en mobile y evita que las cards fuercen overflow", () => {
    const showcaseSource = readFileSync(SHOWCASE_PATH, "utf8");
    const primitivesSource = readFileSync(PRIMITIVES_PATH, "utf8");

    expect(showcaseSource).toContain("left-1/2 top-3 z-10");
    expect(showcaseSource).toContain("md:left-5 md:top-5 md:translate-x-0");
    expect(primitivesSource).toContain('"min-w-0 rounded-none border-y');
    expect(primitivesSource).toContain('"mx-auto max-w-7xl px-3 sm:px-0"');
  });

  it("quita señales comerciales secundarias y agrega confianza compacta", () => {
    const primitivesSource = readFileSync(PRIMITIVES_PATH, "utf8");

    expect(primitivesSource).not.toContain("Más señales comerciales");
    expect(primitivesSource).not.toContain('label: "Entrega"');
    expect(primitivesSource).not.toContain('label: "Opiniones"');
    expect(primitivesSource).toContain("ProductDetailGoogleTrust");
  });
});

describe("ProductDetailGallerySpecs tab content", () => {
  it("combina descripción y especificaciones en una sola pestaña", () => {
    const tabs = buildProductDetailTabs(PRODUCT_FIXTURE, {
      paymentMethods: ["Mercado Pago", "Contado"],
      reviewsEnabled: true,
    });

    expect(tabs.map((tab) => tab.label)).toEqual(["Detalle"]);
    expect(findSection(tabs, "details")?.title).toBe("Descripción y especificaciones");
    expect(findSection(tabs, "details")?.brandLogoUrl).toBe("https://example.com/linglong-logo.webp");
    expect(findSection(tabs, "details")?.specifications).toEqual(PRODUCT_FIXTURE.specifications);
    expect(findSection(tabs, "specs")).toBeUndefined();
    expect(findSection(tabs, "shipping")).toBeUndefined();
  });

  it("no expone distinciones comerciales como notas de descripción", () => {
    const tabs = buildProductDetailTabs(PRODUCT_FIXTURE, {
      paymentMethods: ["Mercado Pago", "Contado"],
      reviewsEnabled: true,
    });

    expect(findSection(tabs, "details")?.notes).toEqual(["Marca: Linglong"]);
    expect(findSection(tabs, "details")?.notes?.join(" ")).not.toContain("Distinciones:");
  });
});
