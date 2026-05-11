import { describe, expect, it } from "vitest";

import {
  PYME_STORE_CANONICAL_URL,
  buildPymeStoreJsonLd,
  buildPymeStoreMetadata,
  buildPymeStoreRobots,
  buildPymeStoreSitemap,
  getPymeStoreFaq,
  isPymeStoreMarketingHost,
} from "@/lib/marketing/pyme-store-seo";

describe("pyme store marketing SEO", () => {
  it("expone metadata única para la landing comercial", () => {
    const metadata = buildPymeStoreMetadata();

    expect(metadata.title).toBe(
      "Tiendas online personalizadas para PyMEs | PymeInteligente Ecommerce",
    );
    expect(metadata.description).toBe(
      "Diseñamos tiendas online a medida para PyMEs y comercios técnicos, con catálogo, carrito, checkout y conexión con la gestión de PymeInteligente.",
    );
    expect(metadata.metadataBase?.toString()).toBe(PYME_STORE_CANONICAL_URL);
    expect(metadata.alternates?.canonical).toBe(PYME_STORE_CANONICAL_URL);
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: PYME_STORE_CANONICAL_URL,
      title: metadata.title,
      description: metadata.description,
      siteName: "PymeInteligente Ecommerce",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
    });
  });

  it("publica FAQ long-tail en castellano sin copy técnico interno", () => {
    const faq = getPymeStoreFaq();
    const combinedCopy = faq.map((item) => `${item.question} ${item.answer}`).join(" ");

    expect(faq).toHaveLength(6);
    expect(faq.map((item) => item.question)).toContain(
      "¿Qué es una tienda online personalizada?",
    );
    expect(combinedCopy).toContain("lubricentro");
    expect(combinedCopy).toContain("repuestera");
    expect(combinedCopy).toContain("neumáticos");
    expect(combinedCopy).toContain("carrito, checkout");
    expect(combinedCopy).not.toMatch(/bootstrap|tenant|shopStatus|host-driven/i);
  });

  it("genera JSON-LD Organization, WebSite, Service y FAQPage vinculados por canonical", () => {
    const schemas = buildPymeStoreJsonLd();
    const types = schemas.map((schema) => schema["@type"]);

    expect(types).toEqual(["Organization", "WebSite", "Service", "FAQPage"]);
    expect(schemas.every((schema) => schema["@context"] === "https://schema.org")).toBe(true);
    expect(schemas[0]).toMatchObject({
      "@type": "Organization",
      name: "PymeInteligente",
      url: PYME_STORE_CANONICAL_URL,
    });
    expect(schemas[1]).toMatchObject({
      "@type": "WebSite",
      name: "PymeInteligente Ecommerce",
      url: PYME_STORE_CANONICAL_URL,
      inLanguage: "es-AR",
    });
    expect(schemas[2]).toMatchObject({
      "@type": "Service",
      serviceType: "Desarrollo de tiendas online personalizadas para PyMEs",
      areaServed: "Argentina",
    });
    expect(schemas[3]).toMatchObject({
      "@type": "FAQPage",
      mainEntity: getPymeStoreFaq().map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  });

  it("reconoce sólo los hosts comerciales de PymeInteligente Store", () => {
    expect(isPymeStoreMarketingHost("www.pymeinteligente.store")).toBe(true);
    expect(isPymeStoreMarketingHost("pymeinteligente.store")).toBe(true);
    expect(isPymeStoreMarketingHost("acme.pymeinteligente.store")).toBe(false);
    expect(isPymeStoreMarketingHost("bym.pymeinteligente.com.ar")).toBe(false);
  });

  it("permite indexar la landing comercial sin rutas privadas de tienda", () => {
    const robots = buildPymeStoreRobots();

    expect(robots).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout", "/checkout/", "/checkout/confirmacion"],
      },
      sitemap: `${PYME_STORE_CANONICAL_URL}sitemap.xml`,
      host: "www.pymeinteligente.store",
    });
  });

  it("genera sitemap mínimo sólo para la landing comercial", () => {
    expect(buildPymeStoreSitemap()).toEqual([
      {
        url: PYME_STORE_CANONICAL_URL,
        changeFrequency: "weekly",
        priority: 1,
      },
    ]);
  });
});
