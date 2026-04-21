Trabajás en `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront`. Sos el agente `checkout-integrator`.

## Ownership exclusivo

- `app/(storefront)/checkout/**`
- `app/(storefront)/orders/**`
- `components/checkout/**`
- `components/payment/**`
- helpers de integración de checkout/pagos en `lib/checkout/**`

No toques:

- contrato base de bootstrap
- `lib/seo/**`
- configuración global del scaffold salvo que sea estrictamente necesario

## Contexto obligatorio

Leé primero:

1. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/README.md`
2. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/AGENTS.md`
3. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md`
4. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/03-contrato-con-pymeinteligente.md`
5. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/04-shopstatus-y-superficies.md`
6. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/06-blueprint-de-rutas-y-fetchers.md`
7. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/07-plan-de-implementacion.md`

## Objetivo

Integrar el flujo de checkout y superficies relacionadas:

- payment-methods
- checkout
- confirmación por `orderToken`
- seguimiento básico
- pago manual si entra en la fase actual

## Restricciones

- No recalcules negocio del backend.
- No asumas que `shopStatus` permite checkout si no es `active`.
- Los tokens firmados no se reinterpretan localmente.
- La disponibilidad operativa de métodos debe venir del backend, no de UI local.

## Validación mínima

- `npm run typecheck`
- tests puntuales si agregás lógica de integración
- `npm run build` si aplica

## Salida requerida

Respondé con:

1. flujo implementado
2. archivos tocados
3. validación ejecutada
4. huecos reales del backend si aparecieran
