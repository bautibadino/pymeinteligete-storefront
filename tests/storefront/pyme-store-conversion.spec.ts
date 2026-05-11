import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  buildPymeStoreWhatsAppHref,
  readPymeStoreContactConfig,
} from "@/lib/marketing/pyme-store-contact";
import {
  buildMarketingStorePayload,
  buildMarketingWhatsAppPayload,
  MarketingTrackedLink,
  trackMarketingCta,
} from "@/components/marketing/marketing-tracked-link";

describe("pyme store contact config", () => {
  it("lee WhatsApp desde NEXT_PUBLIC_PYME_STORE_WHATSAPP y arma wa.me con un numero valido", () => {
    const config = readPymeStoreContactConfig({
      NEXT_PUBLIC_PYME_STORE_WHATSAPP: "+54 9 351 555 0000",
    });

    expect(config.whatsApp).toEqual({
      href: "https://wa.me/5493515550000",
      number: "5493515550000",
      source: "NEXT_PUBLIC_PYME_STORE_WHATSAPP",
    });
    expect(buildPymeStoreWhatsAppHref("+54 9 351 555 0000", "Hola PyME")).toBe(
      "https://wa.me/5493515550000?text=Hola%20PyME",
    );
  });

  it("no inventa enlace funcional si falta o es invalido", () => {
    expect(readPymeStoreContactConfig({}).whatsApp).toBeUndefined();
    expect(buildPymeStoreWhatsAppHref("351")).toBeUndefined();
    expect(buildPymeStoreWhatsAppHref("sin telefono")).toBeUndefined();
  });
});

describe("pyme store marketing tracking", () => {
  it("arma payloads descriptivos para WhatsApp y tienda real", () => {
    expect(buildMarketingWhatsAppPayload({ label: "Hablar por WhatsApp", surface: "hero" })).toEqual({
      content_category: "pyme-store-marketing",
      content_name: "Hablar por WhatsApp",
      contact_method: "whatsapp",
      surface: "hero",
    });

    expect(buildMarketingStorePayload({ href: "https://demo.pyme.test", label: "Ver tienda real", surface: "hero" })).toEqual({
      content_category: "pyme-store-marketing",
      content_name: "Ver tienda real",
      content_type: "storefront_demo",
      link_url: "https://demo.pyme.test",
      surface: "hero",
    });
  });

  it("envia WhatsApp como generate_lead a GA4 y Lead/Contact a Meta mediante el bridge existente", () => {
    const track = vi.fn();

    trackMarketingCta(
      { kind: "whatsapp", label: "Hablar por WhatsApp", surface: "hero" },
      { track },
    );

    expect(track).toHaveBeenCalledTimes(2);
    expect(track).toHaveBeenNthCalledWith(1, {
      event: "generate_lead",
      googlePayload: {
        content_category: "pyme-store-marketing",
        content_name: "Hablar por WhatsApp",
        contact_method: "whatsapp",
        surface: "hero",
      },
    });
    expect(track).toHaveBeenNthCalledWith(2, {
      event: "Lead",
      metaPayload: {
        content_category: "pyme-store-marketing",
        content_name: "Hablar por WhatsApp",
        contact_method: "whatsapp",
        surface: "hero",
      },
    });
  });

  it("envia Ver tienda real como select_content a GA4", () => {
    const track = vi.fn();

    trackMarketingCta(
      {
        href: "https://demo.pyme.test",
        kind: "store",
        label: "Ver tienda real",
        surface: "hero",
      },
      { track },
    );

    expect(track).toHaveBeenCalledWith({
      event: "select_content",
      googlePayload: {
        content_category: "pyme-store-marketing",
        content_name: "Ver tienda real",
        content_type: "storefront_demo",
        link_url: "https://demo.pyme.test",
        surface: "hero",
      },
    });
  });

  it("renderiza SSR-safe y sin href cuando no hay WhatsApp valido", () => {
    const html = renderToStaticMarkup(
      createElement(
        MarketingTrackedLink,
        {
          className: "cta",
          href: undefined,
          tracking: { kind: "whatsapp", label: "Hablar por WhatsApp", surface: "hero" },
        },
        "Hablar por WhatsApp",
      ),
    );

    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain("href=");
  });
});
