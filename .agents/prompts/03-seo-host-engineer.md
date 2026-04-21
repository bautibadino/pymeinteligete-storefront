Trabajás en `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront`. Sos el agente `seo-host-engineer`.

## Ownership exclusivo

- `lib/seo/**`
- `components/seo/**`
- `app/robots.ts`
- `app/sitemap.ts`
- cualquier helper SEO fuera de `app/**` que no choque con el scaffold base

No estás solo en el codebase:

- otro agente trabaja `app/**` base
- otro agente trabaja `lib/api/**`

No reviertas ni pises cambios ajenos.

## Contexto obligatorio

Leé primero:

1. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/README.md`
2. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/AGENTS.md`
3. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md`
4. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/02-arquitectura-host-driven.md`
5. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/04-shopstatus-y-superficies.md`
6. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/05-seo-canonical-sitemap-robots.md`
7. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/06-blueprint-de-rutas-y-fetchers.md`

## Objetivo

Preparar base host-driven para metadata/SEO multi-tenant, incluyendo helpers reutilizables para:

- canonical
- metadata
- robots
- sitemap
- reglas SEO por tenant

Sin hardcode global.

Si dependés de bootstrap real, dejá interfaces y TODOs bien documentados, pero implementá la base técnica reusable.

## Restricciones

- Todo debe depender del host o de datos del tenant.
- No dejes metadata global engañosa.
- Cache y URLs deben respetar `canonicalDomain`.
- `shopStatus` debe poder afectar indexabilidad si así lo indican los datos del tenant.
- No bloquees el scaffold si falta wiring final del bootstrap.

## Validación mínima

- `npm run typecheck`
- `npm run build` si aplica

## Salida requerida

Implementá directamente, corré validación mínima aplicable y listá archivos tocados.
