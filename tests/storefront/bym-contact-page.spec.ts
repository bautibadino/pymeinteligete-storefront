import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { InstitutionalPageData } from "@/app/(storefront)/_lib/institutional-page-data";
import { BymContactPage } from "@/components/storefront/bym-contact-page";
import {
  buildBymContactHref,
  buildBymContactMessage,
} from "@/components/storefront/contact/bym-contact-form";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

function buildData(): InstitutionalPageData {
  return {
    bootstrap: {
      contact: {
        email: "info@bymlubricentro.com",
        phone: "+54 9 3468 50 7255",
        whatsapp: "5493468507255",
        address: "Av. Argentina 410, Corral de Bustos, Cordoba",
      },
    } as unknown as StorefrontBootstrap,
    contactEntries: [
      {
        label: "Email",
        value: "info@bymlubricentro.com",
        href: "mailto:info@bymlubricentro.com",
      },
      {
        label: "Teléfono",
        value: "+54 9 3468 50 7255",
        href: "tel:+5493468507255",
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
    host: "bym.test",
    matchingPage: null,
    visiblePaymentMethods: [],
  };
}

describe("BYM contact page", () => {
  it("renderiza una página full-bleed con WhatsApp, info y formulario fallback", () => {
    const html = renderToStaticMarkup(createElement(BymContactPage, { data: buildData() }));

    expect(html).toContain('data-bym-fullbleed="true"');
    expect(html).toContain("Contacto BYM");
    expect(html).toContain("Hablemos de tu compra.");
    expect(html).toContain("Escribir por WhatsApp");
    expect(html).toContain("https://wa.me/5493468507255");
    expect(html).toContain("info@bymlubricentro.com");
    expect(html).toContain("Av. Argentina 410");
    expect(html).toContain("Contanos qué necesitás");
    expect(html).not.toContain("Información institucional");
  });

  it("arma el mensaje de contacto para WhatsApp con datos del formulario", () => {
    const values = {
      email: "cliente@test.com",
      message: "Necesito precio por 4 cubiertas.",
      name: "Juan",
      phone: "3515551234",
    };

    expect(buildBymContactMessage(values)).toContain("Hola BYM, soy Juan.");
    expect(buildBymContactHref({ values, whatsapp: "+54 9 3468 50 7255" })).toContain(
      "https://wa.me/5493468507255?text=",
    );
  });
});
