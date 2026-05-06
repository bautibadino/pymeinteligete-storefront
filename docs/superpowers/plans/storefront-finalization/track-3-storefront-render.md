# Track 3 - Storefront Render Execution Brief

## Scope

Repo: `/Users/bautista/Desktop/Repositorios/pymeinteligete-storefront`

Objetivo: cerrar la superficie publica oficial para que renderice exactamente lo que el ERP publica, opere por host y cubra navegacion, checkout y confirmacion sin depender de `/(shop)`.

## REQUIRED SKILLS

- `frontend-design`
- `vercel-react-best-practices`
- `seo-geo`

## Ownership exclusivo

- `app/(storefront)/**`
- `components/presentation/**`
- `components/storefront/**`
- `components/modules/**`
- `lib/fetchers/**`
- `lib/seo/**`
- `lib/templates/**`
- `lib/presentation/**`

## No tocar

- repo ERP `pymeinteligente`
- payloads del contrato `storefront/v1`

## Entregables obligatorios

1. `PresentationRenderer` como renderer principal
2. template registry alineado con el catalogo del ERP
3. fetchers y paginas publicas solo sobre `storefront/v1`
4. checkout y confirmacion funcionales
5. SEO/canonical/sitemap/robots tenant-aware
6. manejo consistente de `shopStatus`

## Checklist de relevamiento inicial

- leer `README.md`
- leer `docs/03-contrato-con-pymeinteligente.md`
- leer `docs/09-migracion-tienda-actual.md`
- leer `docs/11-theming-y-modulos-reutilizables.md`
- leer `docs/14-backlog-storefront-multiempresa.md`
- auditar `app/(storefront)/page.tsx`
- auditar `components/presentation/PresentationRenderer.tsx`
- auditar `components/modules/ModuleRenderer.tsx`
- auditar `lib/templates/registry.ts`
- auditar `app/(storefront)/checkout/**`

## Verificaciones obligatorias

```bash
npm run typecheck
npm run test
```

## Reglas quirurgicas

- no reintroducir variantes especificas por tenant
- no crear nuevos payloads ni reinterpretar contrato por cuenta propia
- reducir o eliminar el fallback legacy de `ModuleRenderer` cuando exista paridad real
- toda pagina publica debe resolver host, SEO y estado desde runtime/context reales

## Formato de entrega esperado

Responder con:

1. inventario de gaps de render por pagina
2. inventario de gaps entre catalogo ERP y templates disponibles
3. bloqueantes de checkout/confirmacion
4. orden sugerido de implementacion
5. validaciones minimas y riesgos de SEO/cutover

## Criterio de terminado del track

Un tenant configurado desde ERP puede navegar, comprar y confirmar pedidos desde el repo externo usando solo `storefront/v1`.
