import type { Metadata } from "next";
import type { MetadataRoute } from "next";

import { isPymeStoreMarketingHost as isMarketingHost } from "@/lib/marketing/pyme-store-host";

export const PYME_STORE_BRAND_NAME = "PymeInteligente";
export const PYME_STORE_SITE_NAME = "PymeInteligente Ecommerce";
export const PYME_STORE_CANONICAL_URL = "https://www.pymeinteligente.store/";
export const PYME_STORE_SITE_URL = PYME_STORE_CANONICAL_URL;
export const PYME_STORE_CANONICAL_HOST = "www.pymeinteligente.store";
export const PYME_STORE_CASE_STUDY_URL = "https://www.bymlubricentro.com";
export const PYME_STORE_OG_IMAGE_URL = getPymeStoreCanonicalUrl("/og-pymeinteligente-store.svg");

export const PYME_STORE_METADATA_TITLE =
  "Tiendas online personalizadas para PyMEs | PymeInteligente Ecommerce";

export const PYME_STORE_METADATA_DESCRIPTION =
  "Diseñamos tiendas online a medida para PyMEs y comercios técnicos, con catálogo, carrito, checkout y conexión con la gestión de PymeInteligente.";

export type PymeStoreFaqItem = {
  question: string;
  answer: string;
};

export function getPymeStoreCanonicalUrl(pathname = "/"): string {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new URL(normalizedPathname, PYME_STORE_CANONICAL_URL).toString();
}

export const PYME_STORE_FAQS: PymeStoreFaqItem[] = [
  {
    question: "¿Qué es una tienda online personalizada?",
    answer:
      "Una tienda online personalizada es un ecommerce diseñado para la operación, la identidad visual y el proceso comercial de cada empresa. No parte de una plantilla cerrada: define navegación, catálogo, fichas de producto, carrito, checkout y medición según cómo vende el negocio.",
  },
  {
    question: "¿En qué se diferencia de una tienda genérica?",
    answer:
      "Una tienda genérica obliga a adaptar el negocio a un formato fijo. Una tienda personalizada permite construir la experiencia alrededor del rubro, los productos, las reglas de venta, la comunicación de marca y las métricas que necesita la empresa para crecer.",
  },
  {
    question: "¿Se puede conectar con catálogo y stock?",
    answer:
      "Sí. El storefront personalizado puede mostrar catálogo, precios, disponibilidad y stock conectados a la gestión comercial para reducir carga manual, evitar información desactualizada y sostener una operación diaria más ordenada.",
  },
  {
    question: "¿Puedo usar mi propio dominio?",
    answer:
      "Sí. La tienda puede publicarse con dominio propio para que los clientes compren desde una URL comercial de la marca, por ejemplo un dominio .com o .com.ar configurado para la empresa.",
  },
  {
    question: "¿La tienda puede tener tracking de Meta y Google?",
    answer:
      "Sí. La implementación puede incluir medición de visitas, productos vistos, carrito, checkout, compras y contactos, con eventos preparados para Google Analytics 4 y Meta Pixel cuando el negocio lo requiere.",
  },
  {
    question: "¿Sirve para rubros técnicos como lubricentros, neumáticos o repuestos?",
    answer:
      "Sí. Es especialmente útil para lubricentros, repuesteras, neumáticos y comercios técnicos porque permite ordenar medidas, marcas, compatibilidades, familias de productos, consultas asistidas y condiciones de compra con una navegación clara.",
  },
];

export function isPymeStoreMarketingHost(host: string | null | undefined): boolean {
  return isMarketingHost(host);
}

export function getPymeStoreFaq(): PymeStoreFaqItem[] {
  return PYME_STORE_FAQS.map((item) => ({ ...item }));
}

export function buildPymeStoreMetadata(): Metadata {
  return {
    metadataBase: new URL(PYME_STORE_SITE_URL),
    title: PYME_STORE_METADATA_TITLE,
    description: PYME_STORE_METADATA_DESCRIPTION,
    alternates: {
      canonical: PYME_STORE_SITE_URL,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      type: "website",
      url: PYME_STORE_SITE_URL,
      title: PYME_STORE_METADATA_TITLE,
      description: PYME_STORE_METADATA_DESCRIPTION,
      siteName: PYME_STORE_SITE_NAME,
      locale: "es_AR",
      images: [
        {
          url: PYME_STORE_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "PymeInteligente Ecommerce: tiendas online personalizadas para PyMEs",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: PYME_STORE_METADATA_TITLE,
      description: PYME_STORE_METADATA_DESCRIPTION,
      images: [PYME_STORE_OG_IMAGE_URL],
    },
  };
}

function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: getPymeStoreFaq().map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildPymeStoreJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: PYME_STORE_BRAND_NAME,
      url: PYME_STORE_SITE_URL,
      sameAs: [PYME_STORE_CASE_STUDY_URL],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: PYME_STORE_SITE_NAME,
      url: PYME_STORE_SITE_URL,
      inLanguage: "es-AR",
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Tiendas online personalizadas para PyMEs",
      serviceType: "Desarrollo de tiendas online personalizadas para PyMEs",
      provider: {
        "@type": "Organization",
        name: PYME_STORE_BRAND_NAME,
        url: PYME_STORE_SITE_URL,
      },
      areaServed: "Argentina",
      url: getPymeStoreCanonicalUrl("/"),
      description:
        "Diseño y desarrollo de tienda online a medida para PyMEs, ecommerce conectado a gestión, catálogo, carrito y checkout para lubricentros, repuesteras, neumáticos y comercios técnicos.",
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        category: "Ecommerce personalizado para empresas",
      },
    },
    buildFaqJsonLd(),
  ];
}

export function buildPymeStoreRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/checkout", "/checkout/", "/checkout/confirmacion"],
    },
    sitemap: getPymeStoreCanonicalUrl("/sitemap.xml"),
    host: PYME_STORE_CANONICAL_HOST,
  };
}

export function buildPymeStoreSitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: PYME_STORE_CANONICAL_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
