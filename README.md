# PyMEInteligente Storefront

Storefront externo desacoplado de `PyMEInteligente`.

Este repo existe para construir la app publica multi-tenant que consume al backend principal por HTTP, sin duplicar logica de negocio critica.

## Estado

- repo creado como base de arranque
- documentacion minima ya cargada para que agentes puedan implementar sin deducir arquitectura
- backend fuente de verdad: `/Users/bautistabadino/Desktop/repositorios/pymeinteligente`

## Documentos clave

- [AGENTS.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/AGENTS.md)
- [.agents/README.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md)
- [docs/01-contexto-y-objetivo.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/01-contexto-y-objetivo.md)
- [docs/02-arquitectura-host-driven.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/02-arquitectura-host-driven.md)
- [docs/03-contrato-con-pymeinteligente.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/03-contrato-con-pymeinteligente.md)
- [docs/04-shopstatus-y-superficies.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/04-shopstatus-y-superficies.md)
- [docs/05-seo-canonical-sitemap-robots.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/05-seo-canonical-sitemap-robots.md)
- [docs/06-blueprint-de-rutas-y-fetchers.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/06-blueprint-de-rutas-y-fetchers.md)
- [docs/07-plan-de-implementacion.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/07-plan-de-implementacion.md)
- [docs/08-agentes-y-mcps.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/08-agentes-y-mcps.md)
- [docs/09-migracion-tienda-actual.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/09-migracion-tienda-actual.md)
- [docs/10-roadmap-ux.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/10-roadmap-ux.md)
- [docs/11-theming-y-modulos-reutilizables.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/11-theming-y-modulos-reutilizables.md)
- [docs/08-agentes-y-mcps.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/08-agentes-y-mcps.md)
- [.agents/README.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md)
- [docs/08-agentes-y-mcps.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/08-agentes-y-mcps.md)

## Orquestacion de agentes

Los prompts operativos de agentes viven en:

- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/`

La guia de reparto de ownership, skills y MCPs vive en:

- [docs/08-agentes-y-mcps.md](/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/08-agentes-y-mcps.md)

## Fuente de verdad

La arquitectura y el contrato vienen del repo principal:

- backend: `/Users/bautistabadino/Desktop/repositorios/pymeinteligente`
- carpeta base: `/Users/bautistabadino/Desktop/repositorios/pymeinteligente/docs/storefront-platform`

Punto de partida recomendado en ese repo:

- `docs/storefront-platform/README.md`
- `docs/storefront-platform/14-storefront-externo-host-seo-y-auth.md`
- `docs/storefront-platform/15-politica-operativa-de-shopstatus.md`
- `docs/storefront-platform/16-blueprint-repo-storefront-externo.md`
- `docs/storefront-platform/17-estado-de-sincronizacion-y-validacion.md`

## Agentes

El repo ya incluye prompts locales de agentes especializados en:

- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/bootstrap-architect.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/contract-keeper.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/seo-host-engineer.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/storefront-shell-builder.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/checkout-integrator.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/qa-guardian.md`
