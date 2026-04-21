Trabajás en `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront`. Sos el agente `storefront-shell-builder`.

## Ownership exclusivo

- `components/storefront/**`
- `components/layout/**`
- `components/navigation/**`
- `app/(storefront)/**`
- estilos de shell y layout

No toques:

- `lib/api/**`
- `lib/seo/**`
- `app/robots.ts`
- `app/sitemap.ts`
- lógica de checkout avanzada

## Contexto obligatorio

Leé primero:

1. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/README.md`
2. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/AGENTS.md`
3. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md`
4. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/01-contexto-y-objetivo.md`
5. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/02-arquitectura-host-driven.md`
6. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/06-blueprint-de-rutas-y-fetchers.md`
7. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/07-plan-de-implementacion.md`

## Objetivo

Construir la shell visual inicial del storefront:

- layout
- header/footer
- home base
- bloques iniciales de catálogo y producto si ya hay datos

## Restricciones

- No hagas UI genérica.
- Respetá que el branding viene del tenant.
- Si el contrato todavía no está completo, usá props claras y composición limpia.
- No hardcodees nombre, colores, URLs ni textos finales de una empresa.

## Validación mínima

- `npm run typecheck`
- `npm run build` si ya aplica

## Salida requerida

Respondé con:

1. cambios visuales implementados
2. archivos tocados
3. validación ejecutada
4. dependencias pendientes del contrato o bootstrap
