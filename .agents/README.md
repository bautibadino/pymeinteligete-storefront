# Agentes del Repo

Este repo ya tiene una base documental suficiente para trabajar con agentes especializados sin depender de prompts improvisados en cada turno.

## Orden recomendado

1. `00-orquestador-maestro.md`
2. `01-bootstrap-architect.md`
3. `02-contract-keeper.md`
4. `03-seo-host-engineer.md`
5. `04-storefront-shell-builder.md`
6. `05-checkout-integrator.md`
7. `06-qa-guardian.md`

## Reglas generales

- Todos los agentes trabajan en `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront`.
- Todos deben leer primero:
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/README.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/AGENTS.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/01-contexto-y-objetivo.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/02-arquitectura-host-driven.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/03-contrato-con-pymeinteligente.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/04-shopstatus-y-superficies.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/05-seo-canonical-sitemap-robots.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/06-blueprint-de-rutas-y-fetchers.md`
  - `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/07-plan-de-implementacion.md`
- Ningún agente debe tocar el repo backend salvo lectura de contexto.
- Ningún agente debe inventar contratos fuera de `/api/storefront/v1/*`.
- No se pisa trabajo ajeno: cada prompt define ownership exclusivo.

## MCPs y capacidades recomendadas

- Base para todos:
  - terminal/exec
  - filesystem
  - git local
- Condicionales:
  - GitHub plugin para PRs, issues y revisiones
  - `web` sólo para validar documentación oficial actual de Next.js, React o Vercel
- No necesarios al inicio:
  - DB/CMS MCP
  - image generation

## Skills recomendadas

- `01-bootstrap-architect`
  - [`frontend-design`](/Users/bautistabadino/.agents/skills/frontend-design/SKILL.md)
  - [`vercel-react-best-practices`](/Users/bautistabadino/Desktop/repositorios/pymeinteligente/.agents/skills/vercel-react-best-practices/SKILL.md)
- `02-contract-keeper`
  - [`vercel-react-best-practices`](/Users/bautistabadino/Desktop/repositorios/pymeinteligente/.agents/skills/vercel-react-best-practices/SKILL.md)
- `03-seo-host-engineer`
  - [`seo-geo`](/Users/bautistabadino/Desktop/repositorios/pymeinteligente/.agents/skills/seo-geo/SKILL.md)
  - [`vercel-react-best-practices`](/Users/bautistabadino/Desktop/repositorios/pymeinteligente/.agents/skills/vercel-react-best-practices/SKILL.md)
- `04-storefront-shell-builder`
  - [`frontend-design`](/Users/bautistabadino/.agents/skills/frontend-design/SKILL.md)
  - [`ui-ux-pro-max`](/Users/bautistabadino/Desktop/repositorios/pymeinteligente/.agents/skills/ui-ux-pro-max/SKILL.md)
- `05-checkout-integrator`
  - [`vercel-react-best-practices`](/Users/bautistabadino/Desktop/repositorios/pymeinteligente/.agents/skills/vercel-react-best-practices/SKILL.md)
- `06-qa-guardian`
  - [`web-design-guidelines`](/Users/bautistabadino/Desktop/repositorios/pymeinteligente/.agents/skills/web-design-guidelines/SKILL.md)
  - [`github:github`](/Users/bautistabadino/.codex/plugins/cache/openai-curated/github/b1986b3d3da5bb8a04d3cb1e69af5a29bb5c2c04/skills/github/SKILL.md)

## Agent cards

- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/bootstrap-architect.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/contract-keeper.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/seo-host-engineer.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/storefront-shell-builder.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/checkout-integrator.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/agents/qa-guardian.md`

Estas fichas son la versión corta y estable de cada agente.

## Prompts disponibles

- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/00-orquestador-maestro.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/01-bootstrap-architect.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/02-contract-keeper.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/03-seo-host-engineer.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/04-storefront-shell-builder.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/05-checkout-integrator.md`
- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/prompts/06-qa-guardian.md`

Estos prompts son la versión larga, lista para pegar en una sesión nueva.
