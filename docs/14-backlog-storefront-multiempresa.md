# Backlog Storefront Externo (Multiempresa)

Fecha: 2026-04-23

## Alcance de este documento
Este backlog es **solo** para el agente del repo `pymeinteligete-storefront`.

No incluye tareas internas del ERP. Se asume que el contrato v1 en PyMEInteligente ya fue congelado.

## Prerrequisito bloqueante (entrada)
Antes de ejecutar este backlog, debe existir desde PyMEInteligente:
1. contrato final de checkout/pagos/order-token
2. codigos de error oficiales
3. estados de pago oficiales

Si no existe, ejecutar solo tareas no bloqueadas por contrato.

## Orden de ejecucion

## Fase SF-0 - Cliente API y tipado contractual

### SF-001
- Tipar fetchers 1:1 contra contrato final del ERP.
- Reemplazar `unknown`/`Record<string, unknown>` en flujos de pago.

### SF-010
- Cliente server-side unico con headers:
  - `x-storefront-host`
  - `x-storefront-version`
  - `x-request-id`
- Sin fetchers duplicados con headers manuales.

Criterio de aceptacion:
- `npm run typecheck` limpio sin `any` por contrato.

## Fase SF-1 - Shell host-driven

### SF-011
- Carga base por `bootstrap` en layout.
- Branding/navegacion/SEO desde datos de tenant.

### SF-012
- Hardening de error/not-found por `shopStatus`.
- Política:
  - `disabled`: no superficie publica
  - `paused/draft`: respetar politica definida

Criterio de aceptacion:
- Tenant se resuelve por host; cero dependencia de `EMPRESA_ID` local.

## Fase SF-2 - Discovery y SEO

### SF-020
- Catalogo/categorias/producto 100% con `api/storefront/v1/*`.

### SF-021
- `sitemap` dinamico tenant-aware (categorias/productos reales).

### SF-022
- Metadata/canonical/robots tenant-aware.
- Excluir checkout/confirmacion de indexacion.

Criterio de aceptacion:
- Sin canonical cruzado entre empresas.

## Fase SF-3 - Checkout y pagos E2E

### SF-030
- Checkout action completa:
  - crear orden
  - procesar pago cuando corresponda
  - fallback de pago manual por token firmado

### SF-031
- Confirmacion por `orderToken` con estado real del ERP.

Criterio de aceptacion:
- Confirmacion muestra estado oficial (no estado local inventado).

## Fase SF-4 - Observabilidad y hardening

### SF-040
- Propagar `x-request-id` en toda llamada al ERP.
- Logging estructurado por host/ruta/error.

Criterio de aceptacion:
- Cada error de produccion correlacionable con ERP.

## Suite minima de validacion (storefront)
1. `npm run typecheck`
2. `npm run build`
3. `npm run test`

## Entregable del agente storefront
1. Archivos tocados
2. Decisiones tecnicas
3. Resultados de comandos
4. Pendientes reales (bloqueos por contrato si existen)
