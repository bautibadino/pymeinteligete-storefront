# Orquestacion De Corte A Produccion Multiempresa

Fecha: 2026-04-23

## Proposito
Este documento coordina **el orden entre repos** para evitar que los agentes se mezclen.

- Repo ERP: PyMEInteligente
- Repo frontend publico: pymeinteligete-storefront

## Documentos operativos por repo

### 1) PyMEInteligente (ERP)
Usar este documento en el repo ERP:
- `/Users/bautista/Desktop/Repositorios/Bym-mayorista/docs/storefront-platform/23-backlog-erp-pymeinteligente-multiempresa.md`

### 2) Storefront externo
Usar este documento en el repo storefront:
- `/Users/bautista/Desktop/Repositorios/pymeinteligete-storefront/docs/14-backlog-storefront-multiempresa.md`

## Orden de ejecucion recomendado

### Paso A - Agente ERP (primero)
Ejecutar fases de PyMEInteligente hasta dejar:
1. contrato v1 congelado
2. tenancy/dominios deterministico
3. autoservicio shop operativo
4. estados oficiales de checkout/pagos/order-token

Salida esperada del Paso A:
- contratos cerrados
- codigos de error oficiales
- ejemplos reales de response

### Paso B - Agente Storefront (despues)
Con esa salida, ejecutar backlog del storefront:
1. tipado contractual estricto
2. shell host-driven
3. discovery + SEO tenant-aware
4. checkout/pagos/confirmacion E2E
5. observabilidad

### Paso C - Cutover controlado
Con ambos pasos cerrados:
1. canary BYM en staging
2. cutover con rollback inmediato
3. monitoreo 48-72h
4. decommission legacy gradual

## Regla clave de coordinacion
Si el contrato de ERP no esta cerrado, el agente de storefront **no** debe implementar pagos finales ni suponer payloads.

## Criterio de exito final
- PyMEInteligente es fuente de verdad multiempresa.
- Storefront externo renderiza por host sin hardcodes por empresa.
- Cualquier empresa con `module:shop` activa puede crear/publicar tienda y vender sin intervencion manual de DB.
