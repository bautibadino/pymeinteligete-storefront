# Agentes y MCPs

Este repo está preparado para trabajar con agentes especializados y con ownership explícito para evitar choques.

## Índice

- índice operativo: `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md`
- agent cards:
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/bootstrap-architect.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/contract-keeper.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/seo-host-engineer.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/storefront-shell-builder.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/checkout-integrator.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/qa-guardian.md`
- prompts:
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/00-orquestador-maestro.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/01-bootstrap-architect.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/02-contract-keeper.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/03-seo-host-engineer.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/04-storefront-shell-builder.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/05-checkout-integrator.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/06-qa-guardian.md`

## Orden de uso recomendado

1. `bootstrap-architect`
2. `contract-keeper`
3. `seo-host-engineer`
4. `storefront-shell-builder`
5. `checkout-integrator`
6. `qa-guardian`

## MCPs mínimos

- terminal/exec
- filesystem
- git local

## MCPs útiles

- GitHub plugin cuando el repo ya esté publicado o con PRs activos
- `web` sólo para verificar documentación oficial reciente de:
  - Next.js
  - React
  - Vercel

## MCPs no necesarios para la fase inicial

- base de datos
- CMS
- image generation

## Criterio operativo

- un agente por ownership
- el contrato manda sobre la intuición
- el host manda sobre el tenant
- el backend manda sobre checkout, pagos y disponibilidad operativa
- `.agents/agents/*` sirve como ficha breve del rol
- `.agents/prompts/*` sirve como prompt completo de ejecución
