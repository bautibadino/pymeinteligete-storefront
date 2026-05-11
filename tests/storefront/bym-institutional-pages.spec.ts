import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { InstitutionalPageData } from "@/app/(storefront)/_lib/institutional-page-data";
import { BymInstitutionalPage } from "@/components/storefront/bym-institutional-page";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

function buildData(): InstitutionalPageData {
  return {
    bootstrap: {
      branding: {
        storeName: "BYM SRL",
        logoUrl: "https://cdn.example.com/bym.svg",
      },
      contact: {
        email: "info@bymlubricentro.com",
        phone: "+54 9 3468 50 7255",
        whatsapp: "5493468507255",
        address: "Av. Argentina 410, Corral de Bustos, Cordoba",
      },
      commerce: {
        payment: {
          visibleMethods: ["mercadopago", "transferencia"],
        },
      },
      storefrontExperience: {
        enabled: true,
        key: "bym-custom-v1",
      },
      tenant: {
        status: "active",
      },
    } as unknown as StorefrontBootstrap,
    contactEntries: [
      {
        label: "Email",
        value: "info@bymlubricentro.com",
        href: "mailto:info@bymlubricentro.com",
      },
      {
        label: "WhatsApp",
        value: "5493468507255",
        href: "https://wa.me/5493468507255",
      },
      {
        label: "Dirección",
        value: "Av. Argentina 410, Corral de Bustos, Cordoba",
      },
    ],
    displayName: "BYM SRL",
    footerLinks: [],
    host: "www.bymlubricentro.com",
    matchingPage: null,
    visiblePaymentMethods: ["mercadopago", "transferencia"],
  };
}

describe("BYM institutional pages", () => {
  it("migra sobre nosotros con contenido real de marca", () => {
    const html = renderToStaticMarkup(
      createElement(BymInstitutionalPage, {
        data: buildData(),
        pathname: "/sobre-nosotros",
        title: "Sobre nosotros",
      }),
    );

    expect(html).toContain('data-bym-fullbleed="true"');
    expect(html).toContain("Más de 25 años");
    expect(html).toContain("Badino Y Monti");
    expect(html).toContain("TOP 5 HANKOOK ARGENTINA 2025");
    expect(html).not.toContain("bootstrap");
    expect(html).not.toContain("tenant");
  });

  it("migra envíos y entregas con condiciones comprables", () => {
    const html = renderToStaticMarkup(
      createElement(BymInstitutionalPage, {
        data: buildData(),
        pathname: "/envios-y-entregas",
        title: "Envíos y entregas",
      }),
    );

    expect(html).toContain("Envíos y entregas");
    expect(html).toContain("Andreani y Vía Cargo");
    expect(html).toContain("Retiro en sucursal");
    expect(html).toContain("Av. Argentina 410");
    expect(html).not.toContain("Configurar desde módulo");
  });

  it("migra cambios y devoluciones sin placeholders legales visibles", () => {
    const html = renderToStaticMarkup(
      createElement(BymInstitutionalPage, {
        data: buildData(),
        pathname: "/cambios-y-devoluciones",
        title: "Cambios y devoluciones",
      }),
    );

    expect(html).toContain("Cambios y devoluciones");
    expect(html).toContain("Conservá el comprobante");
    expect(html).toContain("Escribir por WhatsApp");
    expect(html).not.toContain("CONTENIDO LEGAL PENDIENTE");
    expect(html).not.toContain("placeholder");
  });
});
