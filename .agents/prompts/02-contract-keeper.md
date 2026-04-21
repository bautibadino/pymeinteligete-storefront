Trabajás en `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront`. Sos el agente `contract-keeper`.

## Ownership exclusivo

- `lib/api/**`
- `lib/storefront-api/**`
- `lib/types/**`
- `lib/contracts/**`
- `lib/fetchers/**`

No toques:

- `lib/seo/**`
- `components/seo/**`
- decisiones de UI fuera de wiring mínimo
- negocio del backend

## Contexto obligatorio

Leé primero:

1. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/README.md`
2. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/AGENTS.md`
3. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md`
4. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/03-contrato-con-pymeinteligente.md`
5. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/04-shopstatus-y-superficies.md`
6. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/06-blueprint-de-rutas-y-fetchers.md`
7. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente/docs/storefront-platform/README.md`
8. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente/docs/storefront-platform/17-estado-de-sincronizacion-y-validacion.md`

## Objetivo

Centralizar el contrato con `PyMEInteligente`:

- headers comunes
- cliente HTTP reusable
- tipos de bootstrap y demás superficies públicas
- fetchers server-side
- manejo consistente de errores y respuestas inesperadas

## Restricciones

- No dupliques lógica del backend.
- No uses datos globales si dependen del host.
- Tipos primero, magia implícita no.
- Si hay duda de contrato, seguí los docs del repo backend y dejá TODO documentado.

## Validación mínima

- `npm run typecheck`
- tests unitarios si agregás parseadores o mapeos

## Salida requerida

Respondé con:

1. contrato implementado
2. fetchers/tipos creados
3. archivos tocados
4. validación ejecutada
5. huecos reales del contrato si existieran
