# AGENTS.md

## Lenguaje

- responder y documentar en castellano

## Objetivo del repo

Construir el storefront externo de `PyMEInteligente` como app host-driven multi-tenant.

Este repo:

- renderiza experiencia publica
- genera SEO por tenant
- consume el backend por `/api/storefront/v1/*`
- no replica logica de negocio del ERP

Este repo no debe:

- recalcular reglas de negocio del checkout
- decidir stock, precios o disponibilidad por fuera del backend
- escribir en la base de datos del ERP
- inventar contratos no documentados

## Fuente de verdad

Backend fuente de verdad:

- repo: `/Users/bautistabadino/Desktop/repositorios/pymeinteligente`
- docs: `/Users/bautistabadino/Desktop/repositorios/pymeinteligente/docs/storefront-platform`

Leer siempre antes de implementar:

1. [README.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/README.md)
2. [docs/01-contexto-y-objetivo.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/01-contexto-y-objetivo.md)
3. [docs/02-arquitectura-host-driven.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/02-arquitectura-host-driven.md)
4. [docs/03-contrato-con-pymeinteligente.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/03-contrato-con-pymeinteligente.md)
5. [docs/04-shopstatus-y-superficies.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/04-shopstatus-y-superficies.md)
6. [docs/05-seo-canonical-sitemap-robots.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/05-seo-canonical-sitemap-robots.md)
7. [docs/06-blueprint-de-rutas-y-fetchers.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/06-blueprint-de-rutas-y-fetchers.md)
8. [docs/07-plan-de-implementacion.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/07-plan-de-implementacion.md)
9. [docs/08-agentes-y-mcps.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/08-agentes-y-mcps.md)
10. [.agents/README.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md)

Prompts locales de agentes:

- [.agents/README.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md)
- [.agents/agents/bootstrap-architect.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/bootstrap-architect.md)
- [.agents/agents/contract-keeper.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/contract-keeper.md)
- [.agents/agents/seo-host-engineer.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/seo-host-engineer.md)
- [.agents/agents/storefront-shell-builder.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/storefront-shell-builder.md)
- [.agents/agents/checkout-integrator.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/checkout-integrator.md)
- [.agents/agents/qa-guardian.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/qa-guardian.md)
9. [docs/08-agentes-y-mcps.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/08-agentes-y-mcps.md)

Prompts de agentes listos para usar:

- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/bootstrap-architect.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/contract-keeper.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/seo-host-engineer.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/storefront-shell-builder.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/checkout-integrator.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/qa-guardian.md`

## Reglas operativas

- tenancy se resuelve por `host`, no por `EMPRESA_ID` local
- todo cache debe estar keyado por `host`
- `generateMetadata`, `robots`, `sitemap` y `canonical` dependen del tenant
- `shopStatus` debe respetarse exactamente como esta documentado
- `bootstrap` no es opcional: es la carga base del tenant
- `payment-methods` debe reflejar disponibilidad operativa real, no solo configuracion
- seguimiento y pago manual de pedidos usan token firmado

## Suposiciones permitidas

- si falta una decision menor de UI, seguir patrones de Next.js App Router modernos
- si falta una decision de backend, no asumir: dejar TODO documentado y consultar el contrato fuente

## Stack recomendado

- Next.js App Router
- TypeScript estricto
- React 19
- fetch server-side por defecto
- cache/revalidate explicitos por `host`

## Criterio de exito

El repo queda bien encaminado cuando puede implementar:

1. bootstrap por tenant
2. home/catalog/producto
3. metadata y SEO por host
4. checkout basico
5. confirmacion por `orderToken`
