import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Gauge,
  Layers3,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { MarketingTrackedLink } from "@/components/marketing/marketing-tracked-link";
import { PymeStoreLandingMotion } from "@/components/marketing/pyme-store-landing-motion";
import {
  buildPymeStoreWhatsAppHref,
  readPymeStoreContactConfig,
} from "@/lib/marketing/pyme-store-contact";
import {
  PYME_STORE_CASE_STUDY_URL,
  PYME_STORE_FAQS,
  buildPymeStoreJsonLd,
} from "@/lib/marketing/pyme-store-seo";

const WHATSAPP_MESSAGE =
  "Hola, quiero consultar por una tienda online personalizada de PymeInteligente.";
const WHATSAPP_HELP =
  "Configurá NEXT_PUBLIC_PYME_STORE_WHATSAPP con el número internacional para activar este CTA.";

const sectors = [
  "Lubricentros",
  "Repuesteras",
  "Neumáticos",
  "Mayoristas",
  "Comercios técnicos",
  "Distribuidores",
];

const includedFeatures = [
  {
    title: "Diseño a medida",
    description:
      "Una experiencia visual propia, con navegación, contenido y fichas de producto pensadas para tu rubro.",
    icon: Sparkles,
  },
  {
    title: "Catálogo conectado",
    description:
      "Productos, categorías, precios y disponibilidad preparados para operar con información comercial consistente.",
    icon: Layers3,
  },
  {
    title: "Consulta y pedido guiado",
    description:
      "Un recorrido claro para convertir visitas en pedidos o conversaciones comerciales, con contacto alineado a la operación.",
    icon: Gauge,
  },
  {
    title: "Métricas comerciales",
    description:
      "Eventos de conversión listos para medir campañas, comportamiento de clientes y puntos de mejora.",
    icon: BarChart3,
  },
];

const operatingSignals = [
  "Arquitectura responsive para mobile, tablet y desktop",
  "Contenido indexable para Google, Bing y buscadores con IA",
  "Dominio propio y caso real navegable",
  "Base preparada para tracking de Meta y Google",
];

function resolveWhatsappHref(): string | undefined {
  const contactConfig = readPymeStoreContactConfig();

  return contactConfig.whatsApp
    ? buildPymeStoreWhatsAppHref(contactConfig.whatsApp.number, WHATSAPP_MESSAGE)
    : undefined;
}

function WhatsappCta({ label, surface }: { label: string; surface: string }) {
  const href = resolveWhatsappHref();

  return (
    <MarketingTrackedLink
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#1f7a5c] px-5 text-sm font-semibold text-white transition hover:bg-[#155f47] focus:outline-none focus:ring-2 focus:ring-[#1f7a5c] focus:ring-offset-2 aria-disabled:cursor-not-allowed aria-disabled:bg-zinc-300 aria-disabled:text-zinc-600"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      title={!href ? WHATSAPP_HELP : undefined}
      tracking={{ kind: "whatsapp", label, surface }}
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      {label}
    </MarketingTrackedLink>
  );
}

function CaseStudySignals() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-[0_24px_80px_rgba(20,20,20,0.14)]">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f7a5c]">
            BYM Lubricentro
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">Caso real publicado</p>
        </div>
        <span className="rounded-md bg-[#f4c542] px-3 py-2 text-xs font-semibold text-black">
          En producción
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        {[
          "Marca reconocible desde el primer viewport.",
          "Beneficios comerciales explicados con claridad.",
          "Rutas para categorías, contacto e información institucional.",
          "Diseño responsive para consulta rápida desde celular.",
        ].map((signal) => (
          <div className="flex items-start gap-3 rounded-md bg-[#f7f4ed] p-4" key={signal}>
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#1f7a5c]" aria-hidden="true" />
            <p className="leading-7 text-zinc-700">{signal}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function JsonLdScripts() {
  return (
    <>
      {buildPymeStoreJsonLd().map((schema) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={String(schema["@type"])}
          type="application/ld+json"
        />
      ))}
    </>
  );
}

export function PymeStoreLanding() {
  const hasWhatsapp = Boolean(resolveWhatsappHref());

  return (
    <main className="min-h-dvh bg-[#f7f4ed] text-[#151515]" data-pyme-store-landing="true">
      <JsonLdScripts />

      <section className="relative overflow-hidden border-b border-black/10 bg-[#151515] text-white">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_0.82fr] lg:px-10 lg:py-10">
          <header className="flex items-center justify-between gap-4 lg:col-span-2">
            <a className="flex items-center gap-3" href="/" aria-label="PymeInteligente Store">
              <span className="grid size-10 place-items-center rounded-lg bg-[#f4c542] text-sm font-black text-black">
                PI
              </span>
              <span className="text-sm font-semibold">PymeInteligente Store</span>
            </a>
            <MarketingTrackedLink
              className="hidden items-center gap-2 rounded-lg border border-white/18 px-4 py-2 text-sm font-semibold text-white/86 transition hover:bg-white hover:text-black sm:inline-flex"
              href={PYME_STORE_CASE_STUDY_URL}
              rel="noopener noreferrer"
              target="_blank"
              tracking={{
                href: PYME_STORE_CASE_STUDY_URL,
                kind: "store",
                label: "Ver tienda real",
                surface: "nav",
              }}
            >
              Ver tienda real
              <ExternalLink className="size-4" aria-hidden="true" />
            </MarketingTrackedLink>
          </header>

          <PymeStoreLandingMotion className="flex min-h-[calc(100dvh-8rem)] flex-col justify-center py-10">
            <p className="text-sm font-semibold text-[#f4c542]">Ecommerce personalizado para empresas argentinas</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-none sm:text-6xl lg:text-7xl">
              Tiendas online personalizadas para PyMEs que venden con operación real.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
              Diseñamos storefronts a medida para empresas que necesitan catálogo conectado,
              métricas y una experiencia comercial propia, no una plantilla genérica.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsappCta label="Quiero una tienda personalizada" surface="hero" />
              <MarketingTrackedLink
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                href={PYME_STORE_CASE_STUDY_URL}
                rel="noopener noreferrer"
                target="_blank"
                tracking={{
                  href: PYME_STORE_CASE_STUDY_URL,
                  kind: "store",
                  label: "Ver tienda ejemplo",
                  surface: "hero",
                }}
              >
                Ver tienda ejemplo
                <ArrowRight className="size-4" aria-hidden="true" />
              </MarketingTrackedLink>
            </div>
            {!hasWhatsapp ? <p className="mt-3 max-w-xl text-sm text-white/56">{WHATSAPP_HELP}</p> : null}
          </PymeStoreLandingMotion>

          <PymeStoreLandingMotion className="flex items-center pb-10 lg:pb-0" delay={0.12}>
            <div className="w-full rounded-lg border border-white/12 bg-white/8 p-4 backdrop-blur">
              <div className="rounded-md bg-[#f7f4ed] p-4 text-[#151515]">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div>
                    <p className="text-sm font-semibold">Panel comercial</p>
                    <p className="text-xs text-zinc-500">Catálogo, consultas y métricas</p>
                  </div>
                  <Gauge className="size-6 text-[#1f7a5c]" aria-hidden="true" />
                </div>
                <div className="mt-5 grid gap-3">
                  {operatingSignals.map((signal) => (
                    <div className="flex items-start gap-3 rounded-md bg-white p-3" key={signal}>
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#1f7a5c]" aria-hidden="true" />
                      <p className="text-sm leading-6">{signal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PymeStoreLandingMotion>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          <p className="text-sm font-semibold text-[#1f7a5c]">Qué hacemos</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Desarrollo de tienda online a medida, lista para vender y medir.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {includedFeatures.map((item) => {
            const Icon = item.icon;

            return (
              <article className="rounded-lg border border-black/10 bg-white p-5" key={item.title}>
                <Icon className="size-6 text-[#1f7a5c]" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-zinc-700">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold text-[#1f7a5c]">Para quién es</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Para empresas que necesitan un ecommerce conectado a su forma de vender.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sectors.map((sector) => (
              <div className="rounded-lg border border-zinc-200 bg-[#f7f4ed] px-4 py-4 text-sm font-semibold" key={sector}>
                {sector}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          <p className="text-sm font-semibold text-[#1f7a5c]">Qué incluye una tienda personalizada</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Storefront personalizado, contenido indexable y seguimiento comercial.
          </h2>
        </div>
        <div className="grid gap-3">
          {operatingSignals.map((signal) => (
            <div className="flex items-start gap-3 rounded-lg border border-black/10 bg-white p-4" key={signal}>
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#1f7a5c]" aria-hidden="true" />
              <p className="leading-7 text-zinc-700">{signal}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold text-[#1f7a5c]">Caso real: BYM Lubricentro</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Una tienda para vender neumáticos, lubricantes y productos técnicos con claridad.
          </h2>
          <p className="mt-5 leading-8 text-zinc-700">
            BYM muestra cómo un comercio técnico puede llevar su catálogo a una experiencia online
            con categorías, beneficios comerciales, contenido institucional y consulta directa.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <MarketingTrackedLink
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 text-sm font-semibold transition hover:border-zinc-950"
              href={PYME_STORE_CASE_STUDY_URL}
              rel="noopener noreferrer"
              target="_blank"
              tracking={{
                href: PYME_STORE_CASE_STUDY_URL,
                kind: "store",
                label: "Ver tienda real BYM",
                surface: "case_bym",
              }}
            >
              Ver tienda real BYM
              <ExternalLink className="size-4" aria-hidden="true" />
            </MarketingTrackedLink>
            <WhatsappCta label="Coordinar demo por WhatsApp" surface="case_bym" />
          </div>
        </div>
        <CaseStudySignals />
      </section>

      <section className="border-y border-black/10 bg-[#151515] text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[#f4c542]">Preguntas frecuentes</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Respuestas para empresas que evalúan una tienda online personalizada.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {PYME_STORE_FAQS.map((item) => (
              <article className="rounded-lg border border-white/12 bg-white/8 p-5" key={item.question}>
                <h3 className="text-lg font-semibold">{item.question}</h3>
                <p className="mt-3 leading-7 text-white/72">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <p className="text-sm font-semibold text-[#1f7a5c]">Lanzar mi tienda</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            Convertí tu operación comercial en una tienda online propia, medible y preparada para crecer.
          </h2>
        </div>
        <div className="flex items-center">
          <WhatsappCta label="Lanzar mi tienda" surface="final" />
        </div>
      </section>

      <footer className="border-t border-black/10 px-5 py-8 text-sm text-zinc-600 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>PymeInteligente ecommerce personalizado</span>
          <a className="font-semibold text-zinc-950 underline-offset-4 hover:underline" href={PYME_STORE_CASE_STUDY_URL}>
            www.bymlubricentro.com
          </a>
        </div>
      </footer>
    </main>
  );
}
