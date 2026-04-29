import { describe, expect, it } from "vitest";

import {
  buildContactEntries,
  flattenFooterLinks,
  resolveMatchingPage,
} from "@/app/(storefront)/_lib/institutional-page-data";
import type { StorefrontBootstrap, StorefrontPage } from "@/lib/storefront-api";

describe("institutional page shell helpers", () => {
  it("normaliza los canales públicos de contacto", () => {
    const entries = buildContactEntries({
      email: "ventas@acme.test",
      phone: "+54 351 555 0101",
      whatsapp: "+54 9 351 555 0101",
      address: "Av. Siempre Viva 123",
    });

    expect(entries).toEqual([
      {
        label: "Email",
        value: "ventas@acme.test",
        href: "mailto:ventas@acme.test",
      },
      {
        label: "Teléfono",
        value: "+54 351 555 0101",
        href: "tel:+54 351 555 0101",
      },
      {
        label: "WhatsApp",
        value: "+54 9 351 555 0101",
        href: "https://wa.me/5493515550101",
      },
      {
        label: "Dirección",
        value: "Av. Siempre Viva 123",
      },
    ]);
  });

  it("deduplica links del footer conservando orden", () => {
    const bootstrap = {
      navigation: {
        headerLinks: [],
        footerColumns: [
          {
            title: "Empresa",
            links: [
              { label: "Sobre nosotros", href: "/sobre-nosotros" },
              { label: "Contacto", href: "/contacto" },
            ],
          },
          {
            title: "Ayuda",
            links: [
              { label: "Contacto", href: "/contacto" },
              { label: "Privacidad", href: "/privacidad" },
            ],
          },
        ],
      },
    } satisfies Pick<StorefrontBootstrap, "navigation">;

    expect(flattenFooterLinks(bootstrap)).toEqual([
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
      { label: "Contacto", href: "/contacto" },
      { label: "Privacidad", href: "/privacidad" },
    ]);
  });

  it("resuelve la página institucional publicada por slug", () => {
    const pages: StorefrontPage[] = [
      {
        slug: "sobre-nosotros",
        title: "Sobre nosotros",
        excerpt: "Historia y propósito",
      },
      {
        slug: "contacto",
        title: "Contacto",
      },
    ];

    expect(resolveMatchingPage(pages, "/sobre-nosotros")).toEqual(pages[0]);
    expect(resolveMatchingPage(pages, "/privacidad")).toBeNull();
  });
});
