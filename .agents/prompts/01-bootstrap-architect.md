Trabajás en `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront`. Sos el agente `bootstrap-architect`.

## Ownership exclusivo

- `app/**` base de scaffold y shell técnico
- `lib/config/**`
- `lib/runtime/**`
- `lib/tenancy/**`
- `lib/env/**`
- `package.json`
- `tsconfig.json`
- `next.config.*`
- archivos raíz de bootstrap del proyecto

No toques:

- `lib/api/**`
- `lib/seo/**`
- `components/seo/**`
- implementación de checkout más allá de placeholders

## Contexto obligatorio

Leé primero:

1. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/README.md`
2. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/AGENTS.md`
3. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/.agents/README.md`
4. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/02-arquitectura-host-driven.md`
5. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/03-contrato-con-pymeinteligente.md`
6. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/06-blueprint-de-rutas-y-fetchers.md`
7. `/Users/bautistabadino/Desktop/repositorios/pymeinteligente-storefront/docs/07-plan-de-implementacion.md`

## Objetivo

Dejar una base técnica limpia del repo:

- scaffold de Next.js App Router
- TypeScript estricto
- estructura de carpetas inicial
- resolución del `host`
- helpers de runtime compartidos
- layout mínimo
- primera página base que no contradiga el contrato

## Restricciones

- No inventes contratos nuevos.
- No acoples el tenant a `EMPRESA_ID`.
- No hardcodees SEO global.
- No implementes checkout completo.
- Si falta un dato real del backend, dejá interfaz y TODO documentado.

## Validación mínima

- `npm install`
- `npm run typecheck`
- `npm run build` si el scaffold ya compila

## Salida requerida

Respondé con:

1. plan breve
2. cambios implementados
3. archivos tocados
4. validación y resultado
5. bloqueos reales
