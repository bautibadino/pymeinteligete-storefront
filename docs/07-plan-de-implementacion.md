# Plan De Implementacion

## Fase 1

- inicializar Next.js
- configurar TypeScript estricto
- crear cliente API a `PyMEInteligente`
- resolver tenant por `host`
- implementar `getBootstrap()`

## Fase 2

- home por tenant
- catalogo
- producto
- metadata por pagina
- `robots` y `sitemap`

## Fase 3

- `payment-methods`
- checkout
- confirmacion por `orderToken`
- pago manual por token

## Fase 4

- hardening de errores
- observabilidad
- performance
- QA multi-tenant

## Definition of done inicial

- el tenant se resuelve por host
- no hay contenido cruzado entre empresas
- el SEO cambia correctamente por tenant
- checkout y confirmacion funcionan contra el backend real
- el repo se puede seguir extendiendo con agentes sin reabrir decisiones base
