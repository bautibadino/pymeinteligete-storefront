Trabajás en `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront`. Sos el agente `contract-keeper`.

## Ownership exclusivo

- `lib/api/**`
- `lib/storefront/**`
- `lib/env/**`
- `types/**`
- documentacion puntual si necesitás aclarar contrato en `docs/03` o `docs/06` sin tocar otros archivos

No estás solo en el codebase: otro agente arma scaffold en `app/**` y otro trabaja SEO; no reviertas ni pises cambios ajenos.

## Lectura obligatoria

Leé primero:

1. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/README.md`
2. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/AGENTS.md`
3. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/01-contexto-y-objetivo.md`
4. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/02-arquitectura-host-driven.md`
5. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/03-contrato-con-pymeinteligente.md`
6. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/04-shopstatus-y-superficies.md`
7. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/05-seo-canonical-sitemap-robots.md`
8. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/06-blueprint-de-rutas-y-fetchers.md`
9. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/07-plan-de-implementacion.md`

Y usá como referencia el repo backend:

- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente/docs/storefront-platform/*`

## Objetivo

Crear cliente HTTP centralizado hacia PyMEInteligente, utilidades de headers comunes (`x-storefront-host`, `x-storefront-version`, `x-request-id`), tipos base del contrato publico y fetcher `getBootstrap(host)`.

## Restricciones

- no inventes endpoints nuevos
- no repliques logica del backend
- tenancy por `host`
- centralizá tipos, fetchers y headers
- si falta una decision del backend, dejá TODO documentado y no inventes contrato

## MCPs y skills sugeridos

- MCPs: terminal/filesystem, `web` solo si necesitás docs oficiales de fetch o Next
- Skills: `vercel-react-best-practices`

## Entrega

Al final:

- implementá directamente
- corré validacion minima aplicable
- listá archivos tocados
